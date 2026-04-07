import { Prisma } from "../lib/prisma.js";
import { prisma } from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../http/errors/httpErrors.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

type Visibility = "PUBLIC" | "PRIVATE";
type ReactionType = "LIKE" | "LOVE" | "CARE" | "HAHA" | "ANGRY" | "SAD" | "WOW";

type CreatePostInput = {
  content: string;
  visibility: Visibility;
  imageUrls: string[];
};

type UpdatePostInput = {
  content?: string;
  visibility?: Visibility;
  imageUrls?: string[];
};

type FeedQueryInput = {
  page?: number;
  limit?: number;
};

type CreateCommentInput = {
  content: string;
  parentCommentId?: string;
};

const postInclude = {
  author: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  postImages: {
    select: { id: true, url: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  postReactions: {
    select: { id: true, type: true, userId: true, createdAt: true },
  },
  comments: {
    where: { parentCommentId: null },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      commentReactions: {
        select: { id: true, type: true, userId: true, createdAt: true },
      },
      replies: {
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          commentReactions: {
            select: { id: true, type: true, userId: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "asc" as const },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.PostInclude;

async function assertPostExistsAndReadable(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, visibility: true },
  });

  if (!post) {
    throw new NotFoundError({ message: "Post not found" });
  }

  if (post.visibility === "PRIVATE" && post.authorId !== userId) {
    throw new UnauthorizedError({ message: "You are not allowed to access this post" });
  }

  return post;
}

async function assertPostOwner(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new NotFoundError({ message: "Post not found" });
  }

  if (post.authorId !== userId) {
    throw new UnauthorizedError({ message: "Only the post author can perform this action" });
  }

  return post;
}

export const postService = {
  async listFeed(userId: string, query: FeedQueryInput) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.PostWhereInput = {
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }],
    };

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: postInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      posts,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getPostById(userId: string, postId: string) {
    await assertPostExistsAndReadable(postId, userId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundError({ message: "Post not found" });
    }

    return { post };
  },

  async createPost(userId: string, input: CreatePostInput) {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: input.content,
        visibility: input.visibility,
        postImages: {
          create: input.imageUrls.map((url, index) => ({ url, sortOrder: index })),
        },
      },
      include: postInclude,
    });

    return { post };
  },

  async updatePost(userId: string, postId: string, input: UpdatePostInput) {
    await assertPostOwner(postId, userId);

    const post = await prisma.$transaction(async (tx) => {
      if (input.imageUrls) {
        await tx.postImage.deleteMany({ where: { postId } });
      }

      return tx.post.update({
        where: { id: postId },
        data: {
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
          ...(input.imageUrls
            ? {
                postImages: {
                  create: input.imageUrls.map((url, index) => ({ url, sortOrder: index })),
                },
              }
            : {}),
        },
        include: postInclude,
      });
    });

    return { post };
  },

  async deletePost(userId: string, postId: string) {
    await assertPostOwner(postId, userId);
    await prisma.post.delete({ where: { id: postId } });
    return { deleted: true };
  },

  async addComment(userId: string, postId: string, input: CreateCommentInput) {
    await assertPostExistsAndReadable(postId, userId);

    if (input.parentCommentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: input.parentCommentId },
        select: { id: true, postId: true },
      });

      if (!parent || parent.postId !== postId) {
        throw new BadRequestError({ message: "Invalid parent comment for this post" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: input.content,
        ...(input.parentCommentId ? { parentCommentId: input.parentCommentId } : {}),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        commentReactions: { select: { id: true, type: true, userId: true, createdAt: true } },
      },
    });

    return { comment };
  },

  async reactToPost(userId: string, postId: string, reaction: ReactionType) {
    await assertPostExistsAndReadable(postId, userId);

    const postReaction = await prisma.postReaction.upsert({
      where: { postId_userId: { postId, userId } },
      update: { type: reaction },
      create: { postId, userId, type: reaction },
      select: { id: true, postId: true, userId: true, type: true, updatedAt: true },
    });

    return { postReaction };
  },

  async removePostReaction(userId: string, postId: string) {
    await assertPostExistsAndReadable(postId, userId);
    await prisma.postReaction.deleteMany({ where: { postId, userId } });
    return { deleted: true };
  },

  async reactToComment(userId: string, postId: string, commentId: string, reaction: ReactionType) {
    await assertPostExistsAndReadable(postId, userId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    });
    if (!comment || comment.postId !== postId) {
      throw new NotFoundError({ message: "Comment not found for this post" });
    }

    const commentReaction = await prisma.commentReaction.upsert({
      where: { commentId_userId: { commentId, userId } },
      update: { type: reaction },
      create: { commentId, userId, type: reaction },
      select: { id: true, commentId: true, userId: true, type: true, updatedAt: true },
    });

    return { commentReaction };
  },

  async removeCommentReaction(userId: string, postId: string, commentId: string) {
    await assertPostExistsAndReadable(postId, userId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    });
    if (!comment || comment.postId !== postId) {
      throw new NotFoundError({ message: "Comment not found for this post" });
    }

    await prisma.commentReaction.deleteMany({ where: { commentId, userId } });
    return { deleted: true };
  },

  async uploadFile(userId: string, fileBuffer: Buffer, fileName: string) {
    const extension = fileName.split(".").pop();
    const baseName = fileName.split(".")[0].replace(/[^a-zA-Z0-9]/g, "-");

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "buddy-script",
              public_id: `${baseName}-${Date.now()}`,
              format: extension,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            },
          )
          .end(fileBuffer);
      },
    );

    return { url: result.secure_url, publicId: result.public_id };
  },
};

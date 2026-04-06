import type { NextFunction, Response } from "express";
import { z } from "zod";

import { sendResponse } from "@/http/success/sendResponse";
import type { AuthenticatedRequest } from "@/middleware/requireAuth";
import { postService } from "@/services/postService";
import { BadRequestError } from "@/http/errors/httpErrors";

const VisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);
const ReactionSchema = z.enum(["LIKE", "LOVE", "CARE", "HAHA", "ANGRY", "SAD", "WOW"]);

import multer from "multer";
export const upload = multer({ storage: multer.memoryStorage() });

const PostCreateSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  visibility: VisibilitySchema.default("PUBLIC"),
  imageUrls: z.array(z.string().url()).max(10).default([]),
});

const PostUpdateSchema = z
  .object({
    content: z.string().trim().min(1).max(5000).optional(),
    visibility: VisibilitySchema.optional(),
    imageUrls: z.array(z.string().url()).max(10).optional(),
  })
  .refine(
    (input) =>
      input.content !== undefined ||
      input.visibility !== undefined ||
      input.imageUrls !== undefined,
    {
      message: "At least one field is required for update",
    },
  );

const FeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const PostParamSchema = z.object({
  postId: z.string().min(1),
});

const CommentParamSchema = z.object({
  postId: z.string().min(1),
  commentId: z.string().min(1),
});

const CommentCreateSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentCommentId: z.string().min(1).optional(),
});

const ReactionSchemaBody = z.object({
  type: ReactionSchema,
});

export const postController = {
  async listFeed(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const query = FeedQuerySchema.parse(req.query);
    const payload = await postService.listFeed(userId, query);
    return sendResponse(res, {
      data: payload.posts,
      message: "Feed fetched successfully",
      meta: payload.pagination,
    });
  },

  async getPostById(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const payload = await postService.getPostById(userId, postId);
    return sendResponse(res, { data: payload.post, message: "Post fetched successfully" });
  },

  async createPost(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const body = PostCreateSchema.parse(req.body);
    const payload = await postService.createPost(userId, body);
    return sendResponse(res, {
      statusCode: 201,
      data: payload,
      message: "Post created successfully",
    });
  },

  async updatePost(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const body = PostUpdateSchema.parse(req.body);
    const payload = await postService.updatePost(userId, postId, body);
    return sendResponse(res, { data: payload, message: "Post updated successfully" });
  },

  async deletePost(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const payload = await postService.deletePost(userId, postId);
    return sendResponse(res, { data: payload, message: "Post deleted successfully" });
  },

  async addComment(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const body = CommentCreateSchema.parse(req.body);
    const payload = await postService.addComment(userId, postId, body);
    return sendResponse(res, {
      statusCode: 201,
      data: payload,
      message: "Comment created successfully",
    });
  },

  async reactToPost(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const body = ReactionSchemaBody.parse(req.body);
    const payload = await postService.reactToPost(userId, postId, body.type);
    return sendResponse(res, { data: payload, message: "Post reaction updated successfully" });
  },

  async removePostReaction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId } = PostParamSchema.parse(req.params);
    const payload = await postService.removePostReaction(userId, postId);
    return sendResponse(res, { data: payload, message: "Post reaction removed successfully" });
  },

  async reactToComment(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId, commentId } = CommentParamSchema.parse(req.params);
    const body = ReactionSchemaBody.parse(req.body);
    const payload = await postService.reactToComment(userId, postId, commentId, body.type);
    return sendResponse(res, { data: payload, message: "Comment reaction updated successfully" });
  },

  async removeCommentReaction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;
    const { postId, commentId } = CommentParamSchema.parse(req.params);
    const payload = await postService.removeCommentReaction(userId, postId, commentId);
    return sendResponse(res, { data: payload, message: "Comment reaction removed successfully" });
  },

  async uploadFile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const userId = req.auth!.userId;

    if (!req.file) {
      throw new BadRequestError({ message: "No file uploaded" });
    }

    const payload = await postService.uploadFile(userId, req.file.buffer, req.file.originalname);

    return sendResponse(res, {
      statusCode: 201,
      data: payload,
      message: "File uploaded successfully",
    });
  },
};

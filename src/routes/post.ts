import { Router } from "express";

import { postController, upload } from "../controllers/postController.js";
import { asyncHandler } from "../http/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const postRouter = Router();

postRouter.use(requireAuth);

postRouter.get(
  "/posts",
  asyncHandler(async (req, res, next) => postController.listFeed(req, res, next)),
);

postRouter.get(
  "/posts/:postId",
  asyncHandler(async (req, res, next) => postController.getPostById(req, res, next)),
);

postRouter.post(
  "/posts",
  asyncHandler(async (req, res, next) => postController.createPost(req, res, next)),
);

postRouter.patch(
  "/posts/:postId",
  asyncHandler(async (req, res, next) => postController.updatePost(req, res, next)),
);

postRouter.delete(
  "/posts/:postId",
  asyncHandler(async (req, res, next) => postController.deletePost(req, res, next)),
);

postRouter.post(
  "/posts/:postId/comments",
  asyncHandler(async (req, res, next) => postController.addComment(req, res, next)),
);

postRouter.post(
  "/posts/:postId/reactions",
  asyncHandler(async (req, res, next) => postController.reactToPost(req, res, next)),
);

postRouter.delete(
  "/posts/:postId/reactions",
  asyncHandler(async (req, res, next) => postController.removePostReaction(req, res, next)),
);

postRouter.post(
  "/posts/:postId/comments/:commentId/reactions",
  asyncHandler(async (req, res, next) => postController.reactToComment(req, res, next)),
);

postRouter.delete(
  "/posts/:postId/comments/:commentId/reactions",
  asyncHandler(async (req, res, next) => postController.removeCommentReaction(req, res, next)),
);

postRouter.post(
  "/posts/file-upload",
  upload.single("file"),
  asyncHandler(async (req, res, next) => postController.uploadFile(req, res, next)),
);

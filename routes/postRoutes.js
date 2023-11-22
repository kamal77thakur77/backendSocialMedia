//postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const {
  jwtAuthMiddleware: isLoggedIn,
} = require("../middlewares/jwtAuthMiddleware");
const { postValidation } = require("../middlewares/validationMiddleware");

//route to get all posts
router.get("/", postController.getAllPosts);

//route to get details of single post
router.get("/:postId", postController.getSinglePost);

//route to create a post if user is logged in
router.post("/create", isLoggedIn, postValidation, postController.createPost);

//route to update an existing post
router.patch(
  "/update/:postId",
  isLoggedIn,
  postValidation,
  postController.updatePost
);

//route to delete a post
router.delete("/delete/:postId", isLoggedIn, postController.deletePost);

//route to add comment to a post
router.post("/comment/:postId", isLoggedIn, postController.addComment);

//route to delete a comment from a post
router.delete(
  "/comment/:postId/:commentId",
  isLoggedIn,
  postController.deleteComment
);

//route to add reply to a comment
router.post("/reply/:postId/:commentId", isLoggedIn, postController.addReply);

//route to delete a reply from a comment
router.delete(
  "/reply/:postId/:commentId/:replyId",
  isLoggedIn,
  postController.deleteReply
);

//route to like and unlike a post
router.post("/like/:postId", isLoggedIn, postController.likeUnlikePost);

module.exports = router;

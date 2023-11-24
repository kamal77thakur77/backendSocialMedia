const { validationResult } = require("express-validator");
const Post = require("../models/postSchema");
const User = require("../models/userSchema");
const { paginateResults } = require("../utils/pagination");

const createPost = async (req, res, next) => {
  try {
    //  return res.status(200).json({ req1: req.body });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;

    const newPost = new Post({
      title,
      content,
      author: req.user._id,
    });

    await newPost.save();

    res.status(200).json({ msg: "Post created successfully", data: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req); // validate post request body
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const postId = req.params.postId;

    //find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //check if user is the author of the post

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to update this post" });
    }

    //update if all things are valid
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    return res
      .status(200)
      .json({ msg: "Post updated successfully", data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    //get total count of posts
    const totalCount = await Post.countDocuments();

    //paginate results
    const paginatedResults = await paginateResults(page, limit, totalCount);

    //fetch posts for the current page
    const posts = await Post.find()

      .populate("author", "_id name")
      // .populate("comments.author", "_id name")
      // .populate("comments.replies.author", "_id name")
      .skip(paginatedResults.startIndex)
      .limit(paginatedResults.limit)
      .sort({ createdAt: -1 });

    // add likesCount and commentsCount to each post
    // for (const post of posts) {
    //   post.likesCount = post.likes.length;
    //   post.commentsCount = post.comments.length;
    // }
    // complex way using map so it can handle async operations
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const likesCount = post.likes.length;
        const commentsCount = post.comments.length;

        return {
          //...post.toObject(), //if we use this than whole postdetails are fethced
          _id: post._id, //by using this we can get desired response
          title: post.title,
          content: post.content,
          author: post.author,
          likesCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({
      msg: "Posts fetched successfully",
      data: {
        postsWithCounts,
        totalCount,
        totalPages: paginatedResults.totalPages,
        paginatedResults,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// getting a single post and its details including comments and replies
const getSinglePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId)
      .populate("author", "name")
      .populate({
        path: "likes",
        select: "name -_id", //by default id gets populated in mongoose ...so we have to use select projection to remove
      })
      .populate({
        path: "comments",
        populate: [
          { path: "author", select: "_id name" }, //like here even if i remove id it still will be displayed
          { path: "replies.author", select: "_id name" },
        ],
      });

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const likesCount = post.likes.length;
    const commentsCount = post.comments.length;

    const postData = {
      ...post.toObject(),
      likesCount,
      commentsCount,
    };

    res.status(200).json({ msg: "Post fetched successfully", data: postData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

//add a comment to a post
const addComment = async (req, res, next) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = { text, author: req.user._id, replies: [] };
    post.comments.push(newComment);

    await post.save();

    res.status(200).json({ msg: "Comment added successfully", data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//delete a comment from a post
const deleteComment = async (req, res, next) => {
  const { postId, commentId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId.toString()
    );

    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      post.comments[commentIndex].author.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    res.status(200).json({ msg: "Comment deleted successfully", data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Add a reply to a comment
const addReply = async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "post not found" });

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ error: "comment not found" });

    const newReply = {
      text,
      author: req.user._id,
    };
    comment.replies.push(newReply);
    await post.save();
    res.status(200).json({ msg: "Reply added successfully", data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//delete reply to a comment

const deleteReply = async (req, res, next) => {
  const { postId, commentId, replyId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "post not found" });
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ error: "comment not found" });
    const reply = comment.replies.find((r) => r._id.toString() === replyId);
    if (!reply) return res.status(404).json({ error: "reply not found" });
    const index = comment.replies.indexOf(reply);
    comment.replies.splice(index, 1);
    await post.save();
    res.status(200).json({ msg: "Reply deleted successfully", data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//add like unlike functionality that also returns total number of likes and all the users who liked the postand user can remove his own like
const likeUnlikePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user has already liked the post
    const userId = req.user._id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // User hasn't liked the post yet so we add it to likes array
      post.likes.push(userId);
      await post.save();

      const totalLikes = post.likes.length;

      return res.status(200).json({
        msg: "Like added successfully.",
        likes: {
          totalLikes: totalLikes,
          likesBy: post.likes,
        },
        isLiked: true,
      });
    } else {
      // User has already liked the post so we remove him from likes array
      post.likes.splice(index, 1);
      await post.save();

      const totalLikes = post.likes.length;

      return res.status(200).json({
        msg: "Like removed successfully.",
        likes: {
          totalLikes: totalLikes,
          likesBy: post.likes,
        },
        isLiked: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//add like and unlike

// const likePost = async (req, res, next) => {
//   const { postId } = req.params;
//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "post not found" });
//     post.likes.push(req.user._id);
//     await post.save();
//     res.status(200).json({ msg: "Like added successfully", data: post });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// //unlike a post
// const unLikePost = async (req, res, next) => {
//   const { postId } = req.params;
//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "post not found" });
//     const index = post.likes.indexOf(req.user._id);
//     post.likes.splice(index, 1);
//     await post.save();
//     res.status(200).json({ msg: "Unlike added successfully", data: post });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getSinglePost,
  addComment,
  deleteComment,
  addReply,
  deleteReply,
  likeUnlikePost,
};

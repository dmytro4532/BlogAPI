const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

router.get('/posts', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-userId');

    const total = await Post.countDocuments({ isPublished: true });

    res.status(200).json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/posts/:id', async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    }).select('-userId');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Published post not found'
      });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
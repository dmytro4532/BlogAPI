const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { validateCreatePost, validateUpdatePost } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

router.post('/', validateCreatePost, async (req, res, next) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user._id
    };

    const post = await Post.create(postData);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateUpdatePost, async (req, res, next) => {
  try {
    let post = await Post.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(204).json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
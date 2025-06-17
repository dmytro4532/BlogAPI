const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateUser } = require('../middleware/validation');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    
    const user = await User.create({ email, password });

    
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});


router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/update', auth, validateUpdateUser, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const updateData = {};

    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      
      updateData.email = email;
    }

    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete', auth, async (req, res, next) => {
  try {
    // Delete all user's posts first
    await Post.deleteMany({ userId: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'User and all associated posts deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
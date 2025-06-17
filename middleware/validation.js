const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters long'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const createPostSchema = Joi.object({
  title: Joi.string().max(200).required().messages({
    'string.max': 'Title cannot be longer than 200 characters',
    'any.required': 'Title is required'
  }),
  content: Joi.string().required().messages({
    'any.required': 'Content is required'
  }),
  author: Joi.string().max(100).required().messages({
    'string.max': 'Author name cannot be longer than 100 characters',
    'any.required': 'Author is required'
  }),
  tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  isPublished: Joi.boolean().default(false)
});

const updatePostSchema = Joi.object({
  title: Joi.string().max(200).messages({
    'string.max': 'Title cannot be longer than 200 characters'
  }),
  content: Joi.string(),
  author: Joi.string().max(100).messages({
    'string.max': 'Author name cannot be longer than 100 characters'
  }),
  tags: Joi.array().items(Joi.string().trim().lowercase()),
  isPublished: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateCreatePost: validate(createPostSchema),
  validateUpdatePost: validate(updatePostSchema)
};
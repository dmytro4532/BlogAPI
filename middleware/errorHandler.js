const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    console.error(err);
  
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      return res.status(404).json({
        success: false,
        error: message
      });
    }
  
    if (err.code === 11000) {
      let message = 'Duplicate field value entered';
      
      const field = Object.keys(err.keyValue)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      
      return res.status(400).json({
        success: false,
        error: message
      });
    }
  
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        error: message
      });
    }
  
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };
  
  module.exports = errorHandler;
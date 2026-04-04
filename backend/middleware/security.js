// middleware/security.js

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);
  const maxSize = 10 * 1024 * 1024; // 10 MB
  
  if (contentLength && contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Max size is 10MB.'
    });
  }
  next();
};

// Add security headers
export const customSecurityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Prevent parameter pollution
export const preventParameterPollution = (req, res, next) => {
  const forbiddenParams = ['__proto__', 'constructor', 'prototype'];
  
  const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (let key in obj) {
      if (forbiddenParams.includes(key)) {
        delete obj[key];
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleanObject(obj[key]);
      }
    }
  };
  
  try {
    if (req.body) cleanObject(req.body);
    if (req.query) cleanObject(req.query);
    if (req.params) cleanObject(req.params);
  } catch (err) {
    console.error('Parameter pollution prevention error:', err);
  }
  
  next();
};

// XSS Protection
export const xssProtection = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script/gi, '&lt;script')
      .replace(/<\/script>/gi, '&lt;/script&gt;')
      .replace(/javascript:/gi, 'javascript&#58;')
      .replace(/onerror=/gi, 'onerror&#61;')
      .replace(/onload=/gi, 'onload&#61;')
      .replace(/alert\(/gi, 'alert&#40;')
      .replace(/confirm\(/gi, 'confirm&#40;')
      .replace(/prompt\(/gi, 'prompt&#40;');
  };
  
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  try {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
  } catch (err) {
    console.error('XSS protection error:', err);
  }
  
  next();
};
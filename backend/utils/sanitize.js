/**
 * Zero-dependency input sanitization utility to strip dangerous HTML tags
 * and prevent XSS or script injection in user-submitted text fields
 * (grievances, reviews, chat messages, profiles).
 */

const sanitizeText = (input) => {
  if (typeof input !== 'string') return input;
  // Strip script/iframe tags and their contents
  let clean = input.replace(/<(script|iframe|style|object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Strip inline HTML tags
  clean = clean.replace(/<[^>]+>/g, '');
  // Strip dangerous event handler attributes if any remain
  clean = clean.replace(/on\w+\s*=/gi, '');
  return clean.trim();
};

const sanitizeObject = (obj, fields = []) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = sanitizeText(obj[field]);
    }
  }
  return obj;
};

module.exports = {
  sanitizeText,
  sanitizeObject
};

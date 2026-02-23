const ApiError = require("../utils/ApiError");

function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    for (const [source, rules] of Object.entries(schema)) {
      const data = req[source];
      if (!data) continue;

      for (const [field, checks] of Object.entries(rules)) {
        const value = data[field];

        if (checks.required && (value === undefined || value === null || value === "")) {
          errors.push({ field: `${source}.${field}`, message: `${field} is required` });
          continue;
        }

        if (value === undefined || value === null) continue;

        if (checks.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be a valid email` });
        }

        if (checks.type === "number" && isNaN(Number(value))) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be a number` });
        }

        if (checks.min !== undefined && (typeof value === "string" ? value.length < checks.min : value < checks.min)) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be at least ${checks.min}` });
        }

        if (checks.max !== undefined && (typeof value === "string" ? value.length > checks.max : value > checks.max)) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be at most ${checks.max}` });
        }

        if (checks.enum && !checks.enum.includes(value)) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be one of: ${checks.enum.join(", ")}` });
        }

        if (checks.pattern && !checks.pattern.test(value)) {
          errors.push({ field: `${source}.${field}`, message: checks.patternMessage || `${field} format is invalid` });
        }

        if (checks.isDate && isNaN(Date.parse(value))) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be a valid date` });
        }

        if (checks.isFuture && new Date(value) <= new Date()) {
          errors.push({ field: `${source}.${field}`, message: `${field} must be in the future` });
        }
      }
    }

    if (errors.length > 0) {
      throw ApiError.badRequest("Validation failed", errors);
    }

    next();
  };
}

module.exports = validate;

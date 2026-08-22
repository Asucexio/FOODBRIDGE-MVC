const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// Reusable schemas
const schemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      role: z.enum(['donor', 'recipient']),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
  donationId: z.object({
    params: z.object({
      id: z.string().uuid('Invalid donation ID'),
    }),
  }),
  claimDonation: z.object({
    params: z.object({
      donationId: z.string().uuid('Invalid donation ID'),
    }),
  }),
};

module.exports = { validate, schemas };
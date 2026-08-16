const timeoutMiddleware = (ms) => (req, res, next) => {
  req.setTimeout(ms, () => {
    const err = new Error('Request timeout');
    err.code = 'ETIMEDOUT';
    next(err);
  });

  res.setTimeout(ms, () => {
    const err = new Error('Response timeout');
    err.code = 'ETIMEDOUT';
    next(err);
  });

  next();
};

module.exports = timeoutMiddleware;
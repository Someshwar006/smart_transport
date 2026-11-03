const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role forbidden: ${req.user.role} does not have access to this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };

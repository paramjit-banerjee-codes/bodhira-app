/**
 * Authorization Middleware
 * Checks if user owns a resource or has appropriate access
 */

export const requireOwnership = (resourceField) => {
  return (req, res, next) => {
    const resource = req.resource;
    if (!resource) {
      console.warn(`⚠️ requireOwnership middleware: no resource found on req.resource`);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    const ownerId = resource[resourceField];
    if (!ownerId || ownerId.toString() !== req.userId.toString()) {
      console.warn(`⚠️ Unauthorized access attempt: user ${req.userId} tried to access ${resourceField} ${ownerId}`);
      return res.status(403).json({ success: false, error: 'You do not have permission to access this resource' });
    }

    next();
  };
};

/**
 * Middleware to load and attach a resource to req.resource
 */
export const loadResource = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];
      const resource = await Model.findById(id);

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Error loading resource: ${error.message}`);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };
};

export default { requireOwnership, loadResource };

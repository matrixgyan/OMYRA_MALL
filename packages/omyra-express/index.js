export function omyraAuthMiddleware(omyraClient) {
  return async (req, res, next) => {
    try {
      let token = '';
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/omyra_session=([^;]+)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }

      if (!token) {
        return next();
      }

      const user = await omyraClient.validateSession(token);
      req.omyraUser = user;
      req.omyraSessionToken = token;
    } catch (err) {
      // Session validation failed, do not attach user
    }
    next();
  };
}

export function requireOmyraSession(req, res, next) {
  if (!req.omyraUser) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid OMYRA Auth session is required to access this resource.'
    });
  }
  next();
}

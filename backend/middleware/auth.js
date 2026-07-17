import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler.js";

export function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) throw new ApiError(401, "Missing authentication token");

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        throw new ApiError(403, "Not authorized for this resource");
      }
      req.user = payload;
      next();
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      next(new ApiError(401, "Invalid or expired token"));
    }
  };
}

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password").populate("shop");
    if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials");

    const match = await user.comparePassword(password);
    if (!match) throw new ApiError(401, "Invalid credentials");

    if (user.role === "shop") {
      if (!user.shop) {
        throw new ApiError(401, "This account is not associated with any shop.");
      }
      if (user.shop.isApproved === false) {
        throw new ApiError(403, "Your shop registration request is pending admin approval.");
      }
      if (!user.shop.isActive) {
        throw new ApiError(403, "Your shop account has been suspended by the administrator.");
      }
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, "User not found");
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

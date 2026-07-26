import multer from "multer";
import { ApiError } from "./errorHandler.js";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/rtf",
]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 10 }, // 25MB per file, up to 10 files
  fileFilter: (req, file, cb) => {
    // If MIME type isn't standard in browser, check file extension fallback
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    const allowedExts = new Set(["pdf", "jpg", "jpeg", "png", "webp", "gif", "svg", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "rtf"]);
    
    if (!ALLOWED_TYPES.has(file.mimetype) && !allowedExts.has(ext)) {
      return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

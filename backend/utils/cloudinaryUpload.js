import path from "path";
import cloudinary from "../config/cloudinary.js";

/** Uploads a single in-memory file buffer to Cloudinary and resolves with the result. */
export function uploadBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filename || "").toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext);

    const resourceType = isImage ? "image" : "raw";

    const options = {
      folder: "printbridge/orders",
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    if (!isImage) {
      const nameWithoutExt = path.parse(filename || "file").name.replace(/[^a-zA-Z0-9_-]/g, "_");
      options.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);

      if (isImage && result && result.secure_url && ext && !result.secure_url.toLowerCase().endsWith(ext)) {
        result.secure_url = `${result.secure_url}${ext}`;
      }
      resolve(result);
    });
    stream.end(buffer);
  });
}

/** Deletes a resource from Cloudinary by its public ID. */
export function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (error, result) => {
      if (error || (result && result.result !== "ok")) {
        // Retry with raw resource type if image fails
        return cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      }
      resolve(result);
    });
  });
}

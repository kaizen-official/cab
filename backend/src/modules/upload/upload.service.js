const crypto = require("crypto");
const { getSupabase } = require("../../config/supabase");
const { prisma } = require("../../config/database");
const ApiError = require("../../utils/ApiError");

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

class UploadService {
  async uploadAvatar(userId, file) {
    this._validateFile(file, 5 * 1024 * 1024);

    const ext = file.originalname.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw ApiError.internal("Failed to upload avatar: " + error.message);

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
      select: { id: true, avatarUrl: true },
    });

    return user;
  }

  async uploadStudentId(userId, file) {
    this._validateFile(file, 10 * 1024 * 1024);

    const ext = file.originalname.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from("student-ids")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw ApiError.internal("Failed to upload student ID: " + error.message);

    const { data: urlData } = supabase.storage.from("student-ids").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { studentIdUrl: publicUrl, studentIdStatus: "PENDING" },
      select: { id: true, studentIdUrl: true, studentIdStatus: true },
    });

    return user;
  }

  _validateFile(file, maxSize) {
    if (!file) throw ApiError.badRequest("No file provided");
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw ApiError.badRequest("Only JPEG, PNG and WebP images are accepted");
    }
    if (file.size > maxSize) {
      throw ApiError.badRequest(`File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }
  }
}

module.exports = new UploadService();

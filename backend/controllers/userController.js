import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import professions from "../data/professions.js";
import { createPresignedUpload, buildPublicUrl, uploadFileToS3, getFileFromS3 } from "../utils/awsS3.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 5) {
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters long" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "User already exists" });

    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: "Name is already taken" });
    }

    if (!/^[A-Za-z0-9]+$/.test(name)) {
      return res.status(400).json({
        message: "Name must contain only alphabets and numbers",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const message = `
      <p>Your OTP for password reset is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: message,
    });

    res.json({ message: "OTP sent successfully to your email" });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 5)
      return res
        .status(400)
        .json({ message: "Password must be at least 5 characters long" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful! Please login." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    // Ensure req.body exists before destructuring
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const {
      name,
      profession,
      bio,
      location,
      city,
      country,
      timing,
      fee,
      contact,
      removeProfilePic,
    } = req.body || {};

    const updateData = {
      ...(name && { name }),
      ...(profession !== undefined && profession !== null && { profession }),
      ...(bio !== undefined && bio !== null && { bio }),
      ...(location !== undefined && location !== null && { location }),
      ...(city !== undefined && city !== null && { city }),
      ...(country !== undefined && country !== null && { country }),
      ...(timing !== undefined && timing !== null && { timing }),
      ...(fee !== undefined && { fee }),
      ...(contact !== undefined && contact !== null && { contact }),
    };

    if (removeProfilePic === "true" || removeProfilePic === true) {
      updateData.profilePic = "";
    }

    const profilePicUrl = req.body.profilePicUrl;
    if (typeof profilePicUrl === "string" && profilePicUrl.trim().length > 0) {
      updateData.profilePic = profilePicUrl.trim();
    }

    if (name) {
      const existingUser = await User.findOne({ name });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Name already taken" });
      }
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating profile:", error.message, error.stack);
    return res.status(500).json({
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};


export const uploadContent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const { title, description } = req.body || {};
    let images = [];
    let videos = [];
    try {
      const bodyImages = req.body?.images;
      const bodyVideos = req.body?.videos;
      if (Array.isArray(bodyImages)) images = bodyImages.filter(Boolean);
      else if (typeof bodyImages === "string" && bodyImages) images = JSON.parse(bodyImages);
      if (Array.isArray(bodyVideos)) videos = bodyVideos.filter(Boolean);
      else if (typeof bodyVideos === "string" && bodyVideos) videos = JSON.parse(bodyVideos);
    } catch (e) {
      images = images || [];
      videos = videos || [];
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newSection = { title, description, images, videos };
    user.sections = user.sections || [];
    user.sections.push(newSection);

    await user.save();

    res.json({ message: "Content uploaded successfully", user });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ message: "filename and contentType are required" });
    }
    
    if (!process.env.AWS_S3_BUCKET) {
      console.error("AWS_S3_BUCKET is not configured");
      return res.status(500).json({ message: "File upload service is not configured" });
    }
    
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${timestamp}-${randomBytes}-${safeName}`;
    
    const url = await createPresignedUpload({
      bucket: process.env.AWS_S3_BUCKET,
      key,
      contentType,
    });
    
    const publicUrl = buildPublicUrl({ 
      bucket: process.env.AWS_S3_BUCKET, 
      key,
      region: process.env.AWS_REGION 
    });
    
    res.json({ url, key, publicUrl });
  } catch (err) {
    console.error("Presign error:", err.message, err.stack);
    res.status(500).json({ 
      message: "Failed to create upload URL",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const uploadFileProxy = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    
    if (!filename || !contentType) {
      return res.status(400).json({ message: "filename and contentType are required as query parameters" });
    }
    
    let fileBuffer;
    if (req.body instanceof Buffer) {
      fileBuffer = req.body;
    } else if (req.body && typeof req.body === 'object') {
      fileBuffer = req.body;
    } else {
      return res.status(400).json({ message: "File data is required" });
    }
    
    if (!fileBuffer || (Buffer.isBuffer(fileBuffer) && fileBuffer.length === 0)) {
      return res.status(400).json({ message: "File data is empty" });
    }
    
    if (!process.env.AWS_S3_BUCKET) {
      console.error("AWS_S3_BUCKET is not configured");
      return res.status(500).json({ message: "File upload service is not configured" });
    }
    
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${timestamp}-${randomBytes}-${safeName}`;
    
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    
    await uploadFileToS3({
      bucket: process.env.AWS_S3_BUCKET,
      key,
      contentType,
      body: buffer,
    });
    
    const publicUrl = buildPublicUrl({ 
      bucket: process.env.AWS_S3_BUCKET, 
      key,
      region: process.env.AWS_REGION 
    });
    
    res.json({ key, publicUrl });
  } catch (err) {
    console.error("File upload proxy error:", err.message, err.stack);
    res.status(500).json({ 
      message: "Failed to upload file",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const getImageProxy = async (req, res) => {
  try {
    const { key } = req.query;
    
    console.log('Image proxy requested with key:', key);
    
    if (!key) {
      return res.status(400).json({ message: "Key parameter is required" });
    }
    
    if (!process.env.AWS_S3_BUCKET) {
      console.error('AWS_S3_BUCKET not configured');
      return res.status(500).json({ message: "S3 bucket not configured" });
    }
    
    const decodedKey = decodeURIComponent(key);
    console.log('Decoded key:', decodedKey, 'Bucket:', process.env.AWS_S3_BUCKET);
    
    const result = await getFileFromS3({
      bucket: process.env.AWS_S3_BUCKET,
      key: decodedKey,
    });
    
    console.log('File retrieved from S3, ContentType:', result.ContentType);

    const contentType = result.ContentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (result.Body) {
      const chunks = [];
      for await (const chunk of result.Body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      console.log('Sending file buffer, size:', buffer.length);
      res.send(buffer);
    } else {
      console.error('No body in S3 result');
      res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    console.error("Image proxy error:", err.message, err.name, err.code);
    if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.code === 'NoSuchKey') {
      return res.status(404).json({ message: "Image not found", error: err.message });
    }
    res.status(500).json({ message: "Failed to retrieve image", error: err.message });
  }
};

export const likeUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "You cannot like yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const alreadyLiked = user.likedUsers.includes(targetId);
    if (alreadyLiked) {
      user.likedUsers.pull(targetId);
      target.likes = Math.max(target.likes - 1, 0);
    } else {
      user.likedUsers.push(targetId);
      target.likes += 1;
    }

    await user.save();
    await target.save();

    return res.status(200).json(target);
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLikedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "likedUsers",
      "name profilePic profession"
    );
    res.json(user.likedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching liked users" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { userId, sectionId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const section = user.sections.find((s) => s._id.toString() === sectionId);

    if (!section) return res.status(404).json({ message: "Section not found" });
    user.sections = user.sections.filter((s) => s._id.toString() !== sectionId);
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error("Error deleting section:", err);
    res.status(500).json({ message: "Failed to delete section" });
  }
};

export const suggest = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.json({ suggestions: [] });

    const professionSuggestions = professions
      .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((p) => ({ type: "profession", value: p }));

    const users = await User.find({
      name: { $regex: query, $options: "i" },
    })
      .limit(5)
      .select("name");

    const nameSuggestions = users.map((u) => ({
      type: "user",
      value: u.name,
    }));

    res.json({ suggestions: [...professionSuggestions, ...nameSuggestions] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};

export const searchUser = async (req, res) => {
  try {
    const {
      profession,
      minFee,
      maxFee,
      locationFilter,
      likesSort,
      accountAgeSort,
    } = req.query;

    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId).select(
      "city country"
    );

    const filters = {};

    if (
      profession &&
      typeof profession === "string" &&
      profession !== "[object Object]"
    ) {
      filters.$or = [
        { profession: { $regex: profession, $options: "i" } },
        { name: { $regex: profession, $options: "i" } },
      ];
    } else {
      return res.json({ users: [] });
    }

    if (minFee && maxFee)
      filters.fee = { $gte: Number(minFee), $lte: Number(maxFee) };

    if (locationFilter === "same-city" && currentUser?.city) {
      filters.city = { $regex: new RegExp(`^${currentUser.city}$`, "i") };
    } else if (locationFilter === "same-country" && currentUser?.country) {
      filters.country = { $regex: new RegExp(`^${currentUser.country}$`, "i") };
    } else if (locationFilter === "different-country" && currentUser?.country) {
      filters.country = {
        $not: { $regex: new RegExp(`^${currentUser.country}$`, "i") },
      };
    }

    let queryDb = User.find(filters).select("-password");

    if (likesSort === "highest") queryDb = queryDb.sort({ likes: -1 });
    if (accountAgeSort === "new") queryDb = queryDb.sort({ createdAt: -1 });
    if (accountAgeSort === "old") queryDb = queryDb.sort({ createdAt: 1 });

    const users = await queryDb;
    res.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

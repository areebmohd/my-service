import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

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

    if (req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this profile" });
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
    } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(profession && { profession }),
      ...(bio && { bio }),
      ...(location && { location }),
      ...(city && { city }),
      ...(country && { country }),
      ...(timing && { timing }),
      ...(fee !== undefined && { fee }),
      ...(contact && { contact }),
    };
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) {
      const existingUser = await User.findOne({ name });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Name already taken" });
      }
    }
    const getLocalPathFromUrl = (fileUrl) => {
      if (!fileUrl) return null;
      try {
        const parsed = new URL(fileUrl);
        const idx = parsed.pathname.indexOf("/uploads/");
        if (idx !== -1)
          return path.join(path.resolve(), parsed.pathname.slice(idx + 1));
      } catch (err) {
        const idx2 = fileUrl.indexOf("/uploads/");
        if (idx2 !== -1)
          return path.join(path.resolve(), fileUrl.slice(idx2 + 1));
      }
      return null;
    };

    const removeFlag =
      req.body &&
      (req.body.removeProfilePic === "true" ||
        req.body.removeProfilePic === true);

    if (removeFlag && user.profilePic) {
      const localPath = getLocalPathFromUrl(user.profilePic);
      if (localPath) {
        fs.unlink(localPath, (err) => {
          if (err)
            console.warn(
              "Failed to delete old profile pic:",
              localPath,
              err.message
            );
        });
      }
      updateData.profilePic = "";
    }

    if (req.file) {
      if (user.profilePic) {
        const oldPath = getLocalPathFromUrl(user.profilePic);
        if (oldPath) {
          fs.unlink(oldPath, (err) => {
            if (err)
              console.warn(
                "Failed to delete previous profile pic:",
                oldPath,
                err.message
              );
          });
        }
      }
      updateData.profilePic = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    return res.json({ message: "Profile updated", user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/mkv",
    "video/quicktime",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

export const upload = multer({ storage, fileFilter });

export const uploadContent = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description } = req.body;

    const files = req.files || [];

    const images = files
      .filter((f) => f.mimetype.startsWith("image"))
      .map((f) => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);

    const videos = files
      .filter((f) => f.mimetype.startsWith("video"))
      .map((f) => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);

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

    const allFiles = [...(section.images || []), ...(section.videos || [])];
    allFiles.forEach((fileUrl) => {
      if (fileUrl.includes("uploads")) {
        const filePath = path.join(
          path.resolve(),
          fileUrl.replace(/^.*\/uploads/, "uploads")
        );
        fs.unlink(filePath, (err) => {
          if (err) console.log("Failed to delete:", filePath, err.message);
        });
      }
    });
    user.sections = user.sections.filter((s) => s._id.toString() !== sectionId);
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error("Error deleting section:", err);
    res.status(500).json({ message: "Failed to delete section" });
  }
};

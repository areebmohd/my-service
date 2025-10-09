import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
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

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    const {
      name,
      profession,
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
      ...(location && { location }),
      ...(city && { city }),
      ...(country && { country }),
      ...(timing && { timing }),
      ...(fee !== undefined && { fee }),
      ...(contact && { contact }),
    };

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// --- Multer setup exported for route usage (kept simple) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mkv", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

export const upload = multer({ storage, fileFilter });

// Upload Content Controller (expects upload.array('files') in route)
export const uploadContent = async (req, res) => {
  try {
    const { id } = req.params;

    // parse title/description from body
    const { title, description } = req.body;

    // req.files should be an array
    const files = req.files || [];

    // convert stored files to full public URLs
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

    // return updated user object
    res.json({ message: "Content uploaded successfully", user });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Like and getLikedUsers unchanged...
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

// ✅ Example for /user/liked
export const getLikedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "likedUsers",
      "name profilePic profession" // 👈 include profession here
    );
    res.json(user.likedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching liked users" });
  }
};// adjust path if needed

export const deleteSection = async (req, res) => {
  try {
    const { userId, sectionId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find section to delete
    const section = user.sections.find(
      (s) => s._id.toString() === sectionId
    );

    if (!section) return res.status(404).json({ message: "Section not found" });

    // 🧹 Delete associated files (images + videos)
    const allFiles = [...(section.images || []), ...(section.videos || [])];
    allFiles.forEach((fileUrl) => {
      // Only delete local files (ignore hosted/CDN URLs)
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

    // Remove section from DB
    user.sections = user.sections.filter(
      (s) => s._id.toString() !== sectionId
    );
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error("Error deleting section:", err);
    res.status(500).json({ message: "Failed to delete section" });
  }
};



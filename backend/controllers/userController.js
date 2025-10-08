import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

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

// 🧾 Update profile info
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Allow only the logged-in user to edit their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    // ✅ Pick only allowed fields
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
      ...(fee && { fee }),
      ...(contact && { contact }),
    };

    // ✅ Update and return new user
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};


// 🖼️ Upload or delete content (photo, text, video)

// 🗂 Setup Multer storage (for uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// 📸 Filter to accept only image and video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mkv"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

// Initialize multer
export const upload = multer({ storage, fileFilter });

// 🧠 Upload Content Controller
export const uploadContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse text fields
    const { title, description } = req.body;

    // Collect uploaded file paths
    const images = req.files
      .filter((f) => f.mimetype.startsWith("image"))
      .map((f) => `/uploads/${f.filename}`);

    const videos = req.files
      .filter((f) => f.mimetype.startsWith("video"))
      .map((f) => `/uploads/${f.filename}`);

    // Find user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Push new section
    const newSection = { title, description, images, videos };
    user.sections.push(newSection);

    await user.save();
    res.json({ message: "Content uploaded successfully", user });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};


// 💙 Like or unlike a user
export const likeUser = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user
    const targetId = req.params.id; // user being liked

    if (userId === targetId) {
      return res.status(400).json({ message: "You cannot like yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // if already liked, unlike
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

// 💙 Get all liked users for current user
export const getLikedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("likedUsers", "name email");
    res.status(200).json(user.likedUsers);
  } catch (err) {
    console.error("Liked users fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



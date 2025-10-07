import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
export const uploadContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, images, videos } = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Push new section into customSections array
    user.customSections.push({
      title,
      description,
      images,
      videos,
    });

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Upload content error:", error);
    res.status(500).json({ message: "Error uploading content", error: error.message });
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



import express from "express";
import { registerUser, loginUser, updateUser, uploadContent, likeUser, getLikedUsers } from "../controllers/userController.js";
import User from "../models/userModel.js";
import professions from "../data/professions.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.put("/update/:id", protect, updateUser);
router.post("/upload/:id", protect, uploadContent);

router.put("/like/:id", protect, likeUser);
router.get("/liked", protect, getLikedUsers);

router.post("/suggest", (req, res) => {
  try {
    const query = (req.body.query || "").trim().toLowerCase();

    if (!query) {
      return res.json({ suggestions: [] });
    }

    const suggestions = professions
      .filter((p) => p.toLowerCase().includes(query))
      .slice(0, 10); // limit to 10

    return res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Suggestion failed" });
  }
});

// Search Users by Profession, Fee, Location
router.get("/search", protect, async (req, res) => {
  try {
    const { profession, minFee, maxFee, locationFilter, likesSort, accountAgeSort } = req.query;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId).select("city country");
    const filters = {};

    // Profession
    if (profession) filters.profession = { $regex: profession, $options: "i" };

    // Fee range
    if (minFee && maxFee) filters.fee = { $gte: Number(minFee), $lte: Number(maxFee) };

    // 🔹 Location Filter
    if (locationFilter === "same-city" && currentUser.city) {
      filters.city = { $regex: new RegExp(`^${currentUser.city}$`, "i") }; // case-insensitive
    } else if (locationFilter === "same-country" && currentUser.country) {
      filters.country = { $regex: new RegExp(`^${currentUser.country}$`, "i") };
    } else if (locationFilter === "different-country" && currentUser.country) {
      filters.country = { $not: { $regex: new RegExp(`^${currentUser.country}$`, "i") } };
    }
    

    // Query + Sorting
    let query = User.find(filters).select("-password");
    if (likesSort === "highest") query = query.sort({ likes: -1 });
    if (accountAgeSort === "new") query = query.sort({ createdAt: -1 });
    if (accountAgeSort === "old") query = query.sort({ createdAt: 1 });

    const users = await query;
    res.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

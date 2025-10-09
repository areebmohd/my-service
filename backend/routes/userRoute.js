import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  uploadContent,
  likeUser,
  getLikedUsers,
  deleteSection,
  upload, // multer instance exported from controller
} from "../controllers/userController.js";
import User from "../models/userModel.js";
import professions from "../data/professions.js";
import { protect } from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();

// ensure uploads folder exists (once)
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", protect, updateUser);

// upload content: expect multipart form with field name 'files' (multiple)
router.post(
  "/upload/:id",
  protect,
  upload.array("files", 10), // front sends files under 'files'
  uploadContent
);

router.put("/like/:id", protect, likeUser);
router.get("/liked", protect, getLikedUsers);
router.delete("/section/:userId/:sectionId", deleteSection);

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

// search route and single profile get route unchanged...
// (I assume you already have the search and /:id routes below — keep them)
router.get("/search", protect, async (req, res) => {
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

    const currentUser = await User.findById(currentUserId).select("city country");
    const filters = {};

    if (profession) filters.profession = { $regex: profession, $options: "i" };
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
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  searchUser,
  uploadContent,
  getUser,
  likeUser,
  getLikedUsers,
  sendResetOtp,
  resetPasswordWithOtp,
  deleteSection,
  suggest,
  upload,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", protect, upload.single("profilePic"), updateUser);
router.post("/upload/:id", protect, upload.array("files", 10), uploadContent);
router.put("/like/:id", protect, likeUser);
router.get("/liked", protect, getLikedUsers);
router.delete("/section/:userId/:sectionId", deleteSection);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/suggest", suggest);
router.get("/search", protect, searchUser);
router.get("/:id", getUser);

export default router;

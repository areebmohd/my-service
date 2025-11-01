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
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getUploadUrl } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/upload-url", protect, getUploadUrl);
router.put("/update/:id", protect, updateUser);
router.post("/upload/:id", protect, uploadContent);
router.put("/like/:id", protect, likeUser);
router.get("/liked", protect, getLikedUsers);
router.delete("/section/:userId/:sectionId", deleteSection);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/suggest", suggest);
router.get("/search", protect, searchUser);
router.get("/:id", getUser);

export default router;

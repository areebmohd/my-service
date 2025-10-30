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
import uploadcld from "../cloudinaryConfig.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", protect, uploadcld.single("profilePic"), updateUser);
router.post("/upload/:id", protect, uploadcld.array("files", 10), uploadContent);
router.put("/like/:id", protect, likeUser);
router.get("/liked", protect, getLikedUsers);
router.delete("/section/:userId/:sectionId", deleteSection);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/suggest", suggest);
router.get("/search", protect, searchUser);
router.get("/:id", getUser);
router.post("/upload-image", uploadcld.single("image"), (req, res) => {
  try {
    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;

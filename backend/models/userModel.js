import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Za-z0-9]+$/,
    },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    profession: { type: String },
    bio: { type: String, default: "" },
    location: { type: String },
    city: { type: String },
    country: { type: String },
    timing: { type: String },
    fee: { type: Number },
    contact: { type: String },
    resetPasswordOTP: { type: String },
    resetPasswordExpire: { type: Date },
    profilePic: { type: String },
    sections: [
      {
        title: String,
        description: String,
        images: [String],
        videos: [String],
      },
    ],
    likes: { type: Number, default: 0 },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, // 👈 This line adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("User", userSchema);

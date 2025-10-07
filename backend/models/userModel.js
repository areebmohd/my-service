import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  profession: { type: String },
  location: { type: String },
  city: { type: String },
  country: { type: String },
  timing: { type: String },
  fee: { type: Number },
  contact: { type: String },
  profilePic: { type: String },
  customSections: [
    {
      title: String,
      description: String,
      images: [String],
      videos: [String],
    },
  ],
  likes: { type: Number, default: 0 }, // 💙 count of likes
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 💙 who they liked
});

export default mongoose.model("User", userSchema);

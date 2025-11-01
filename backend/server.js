import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
// Parse JSON bodies - with increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

const __dirname = path.resolve();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

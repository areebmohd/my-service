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

app.use("/api/user", userRoutes);
app.use("/uploads", express.static("uploads"));

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

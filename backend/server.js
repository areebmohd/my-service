import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

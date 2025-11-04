import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import busRoutes from "./routes/busRoutes.js";
import carRoutes from "./routes/carRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Example test route
app.use("/api/bus", busRoutes);
app.use("/api/car", carRoutes);

app.get("/", (req, res) => {
  res.send("Travel Booking API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

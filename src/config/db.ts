import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI!;
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
}


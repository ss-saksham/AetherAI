import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is missing.");
    }

    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000
    });
   
    console.log("✅ DB Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
  }
};

export default connectDB
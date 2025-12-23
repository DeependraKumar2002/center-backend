import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ No MONGO_URI found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "mydb", // your database name
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

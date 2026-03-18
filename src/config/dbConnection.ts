import mongoose from "mongoose";


const connectDB = async() : Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_STRING as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

} catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection error:", error.message);
    } else {
      console.error("Unknown error while connecting to MongoDB");
    }

    process.exit(1);
  
  }
};



export default connectDB;
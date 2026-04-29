import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

export const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✓ Cloudinary connected:", result);
  } catch (err) {
    console.error("✗ Cloudinary failed:", err);
  }
};

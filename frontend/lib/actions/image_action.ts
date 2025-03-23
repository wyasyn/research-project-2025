"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imageFile: File) => {
  if (!imageFile) {
    return { error: "No file uploaded" };
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        );
        uploadStream.end(buffer);
      }
    );

    const { secure_url } = uploadResult;

    if (!secure_url) {
      return { error: "Failed to upload image" };
    }

    return { imageUrl: secure_url };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return { error: "Error uploading image" };
  }
};

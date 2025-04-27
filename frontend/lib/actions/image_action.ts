"use server";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (imageFile: File) => {
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

export const uploadImage = async (imageFile: File) => {
  if (!imageFile) {
    return { error: "No file uploaded" };
  }

  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${serverApi}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return { imageUrl: data.url };
  } catch (error) {
    console.error("Error uploading to Flask:", error);
    return { error: (error as Error).message || "Error uploading image" };
  }
};

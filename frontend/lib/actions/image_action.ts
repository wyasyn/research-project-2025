const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;
export const uploadImage = async (imageFile: File) => {
  if (!imageFile) {
    return { error: "No file uploaded" };
  }

  if (!serverApi) {
    return { error: "Backend URL not configured" };
  }

  const formData = new FormData();
  formData.append("file", imageFile, imageFile.name);

  try {
    const response = await fetch(`${serverApi}/upload/`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        // Don't set Content-Type header - it will be set automatically with boundary for multipart/form-data
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();

    return { imageUrl: data.url };
  } catch (error) {
    console.error("Error uploading to Flask:", error);
    return { error: (error as Error).message || "Error uploading image" };
  }
};

export const uploadImageToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "tenant");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Cloudinary response:", errorText);
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
};

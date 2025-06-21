import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "./Input";
import Button from "./Button";
import Card from "./Card";
import { type Post } from "../models/Post";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, "id"> | Post) => Promise<void>;
  postToEdit?: Post | null;
}

type FormInputs = {
  title: string;
  content: string;
};

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  postToEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (postToEdit) {
      reset({ title: postToEdit.title, content: postToEdit.content });
      setPreviewUrl(postToEdit.imageUrl || null);
    } else {
      reset({ title: "", content: "" });
      setPreviewUrl(null);
    }
    setImageFile(null);
  }, [postToEdit, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    let imageUrl = postToEdit?.imageUrl || "";

    if (imageFile) {
      try {
        const result = await uploadImageToCloudinary(imageFile);
        imageUrl = result.url; // Asegúrate de que tu función devuelva { url, publicId }
      } catch (err) {
        console.error("Error uploading image:", err);
        alert("Hubo un error al subir la imagen. Intenta nuevamente.");
        return;
      }
    }

    const postData = postToEdit
      ? { ...postToEdit, ...data, imageUrl }
      : { ...data, createdAt: new Date(), ownerId: "", imageUrl };

    await onSave(postData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <Card title={postToEdit ? "Editar Post" : "Crear Post"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="title"
              label="Título"
              error={errors.title?.message}
              {...register("title", { required: "El título es obligatorio" })}
            />
            <div>
              <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700">
                Contenido
              </label>
              <textarea
                id="content"
                className="block w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-y"
                {...register("content", { required: "El contenido es obligatorio" })}
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            </div>
            <div>
              <label htmlFor="image" className="block mb-1 text-sm font-medium text-gray-700">
                Imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="mt-2 max-h-40 rounded border"
                />
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1">
                {postToEdit ? "Actualizar" : "Crear"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

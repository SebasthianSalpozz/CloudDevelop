import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "./Input";
import Button from "./Button";
import Card from "./Card";
import { type Post } from "../models/Post";

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

  useEffect(() => {
    if (postToEdit) {
      reset({ title: postToEdit.title, content: postToEdit.content });
    } else {
      reset({ title: "", content: "" });
    }
  }, [postToEdit, reset]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const postData = postToEdit
      ? { ...postToEdit, ...data }
      : { ...data, createdAt: new Date(), ownerId: "" };
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
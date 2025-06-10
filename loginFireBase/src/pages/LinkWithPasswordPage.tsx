import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { useNavigate } from "react-router-dom";

type Inputs = {
  email: string;
  password: string;
};

export const LinkWithPasswordPage = () => {
  const { user, linkWithPassword, error, isLoading } = useFirebaseUser();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setValue("email", user.email || "");
  }, [user, setValue, navigate]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await linkWithPassword(data.email, data.password);
    navigate("/");
  };

  return (
    <Container>
      <Card className="my-3" title="Link with username and password">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            readOnly={!!user}
            disabled={!!user}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", { required: "El correo es obligatorio" })}
          />
          <Input
            label="Password"
            type="password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", { required: "La contraseña es obligatoria" })}
          />
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Link with user
          </Button>
        </form>
      </Card>
    </Container>
  );
};
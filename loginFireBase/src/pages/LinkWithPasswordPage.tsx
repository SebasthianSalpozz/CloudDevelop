import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { useFirebaseUser } from "../hooks/useFirebaseUser";

type Inputs = {
  email: string;
  password: string;
};

export const LinkWithPasswordPage = () => {
  const { user, linkWithPassword, error } = useFirebaseUser();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (!user) return;
    setValue("email", user.email || "");
  }, [user, setValue]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    linkWithPassword(data.email, data.password);
  };

  return (
    <Container>
      <Card className="my-3" title="Link with username and password">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            readOnly={!!user}
            disabled={!!user}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", { required: true })}
          />
          {errors.email && <span>This field is required</span>}
          <Input
            label="Password"
            type="password"
            {...register("password", { required: true })}
          />
          {errors.password && <span>This field is required</span>}
          <Button variant="primary" type="submit">
            Link with user
          </Button>
        </form>
      </Card>
    </Container>
  );
};
import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import Card from "../components/Card";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import Button from "../components/Button";
import { useFirebaseUser } from "../hooks/useFirebaseUser";

type RegisterFormInputs = {
  fullname: string;
  email: string;
  password: string;
  address: string;
  birthdate: string; // formato YYYY-MM-DD
};

export const RegisterPage = () => {
  const { registerWithFirebase, error, isLoading, user } = useFirebaseUser();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    registerWithFirebase(
      data.email,
      data.password,
      data.fullname,
      data.address,
      data.birthdate ? new Date(data.birthdate) : null
    );
  };

  return (
    <>
      <Menu />
      <Container className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Crear una Cuenta
          </h2>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="fullname"
              label="Nombre Completo"
              type="text"
              error={errors.fullname?.message}
              {...register("fullname", {
                required: "Tu nombre es obligatorio",
              })}
            />
            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              error={errors.email?.message}
              {...register("email", { required: "El correo es obligatorio" })}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              error={errors.password?.message}
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Debe tener al menos 6 caracteres",
                },
              })}
            />
            {/* NUEVOS CAMPOS */}
            <Input
              id="address"
              label="Dirección"
              type="text"
              error={errors.address?.message}
              {...register("address")}
            />
            <Input
              id="birthdate"
              label="Fecha de Nacimiento"
              type="date"
              error={errors.birthdate?.message}
              {...register("birthdate")}
            />
            {/* FIN NUEVOS CAMPOS */}
            <Button
              variant="primary"
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Registrarse
            </Button>
          </form>
          <div className="text-sm text-center mt-6">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </>
  );
};

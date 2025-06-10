import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Card from "../components/Card";
import { Container } from "../components/Container";
import Menu from "../components/Menu";
import { Input } from "../components/Input";
import Button from "../components/Button";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { AccountLinkingModal } from "../components/AccountLinkingModal";

type LoginFormInputs = {
  email: string;
  password: string;
};

export const LoginPage = () => {
  const { 
    loginWithFirebase, 
    loginWithGoogle, 
    loginWithFacebook, 
    linkExistingAccount,
    error, 
    isLoading, 
    user, 
    existingEmail,
    pendingCredential,
    clearError 
  } = useFirebaseUser();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    loginWithFirebase(data.email, data.password);
  };

  const handleLinkAccount = async (password: string) => {
    await linkExistingAccount(password);
  };

  return (
    <>
      <Menu />
      <Container className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Iniciar Sesión</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
                <span 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" 
                  onClick={clearError}
                >
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {...register("password", { required: "La contraseña es obligatoria" })}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continuar con</span>
            </div>
          </div>

          <div className="space-y-3">
             <Button variant="google" className="w-full" onClick={loginWithGoogle}>
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73.2 0 136.2 29.2 182.4 75.2l-67.8 65.8C335.5 110.1 292.8 88 244 88c-88.3 0-160 71.7-160 160s71.7 160 160 160c96.8 0 138.2-72.3 144.8-109.8H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Google
            </Button>
            <Button variant="facebook" className="w-full" onClick={loginWithFacebook}>
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
                Facebook
            </Button>
          </div>
          
           <div className="text-sm text-center mt-6">
            <p className="text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Regístrate aquí
                </Link>
            </p>
          </div>
        </Card>
      </Container>

      {/* Modal para vincular cuentas */}
      {existingEmail && pendingCredential && (
        <AccountLinkingModal
          email={existingEmail}
          onLinkAccount={handleLinkAccount}
          onCancel={clearError}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
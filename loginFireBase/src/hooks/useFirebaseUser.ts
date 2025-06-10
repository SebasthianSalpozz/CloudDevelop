/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  type User,
} from "firebase/auth";

const getFriendlyErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo electrónico o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/account-exists-with-different-credential":
      return "Ya existe una cuenta con este correo. Te sugerimos vincular las cuentas.";
    case "auth/credential-already-in-use":
      return "Este método de autenticación ya está vinculado a tu cuenta.";
    case "auth/provider-already-linked":
      return "Este proveedor ya está vinculado a tu cuenta.";
    case "auth/requires-recent-login":
      return "Para realizar esta acción, necesitas iniciar sesión nuevamente.";
    default:
      return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
  }
};

export const useFirebaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCredential, setPendingCredential] = useState<any>(null);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => {
    setError(null);
    setPendingCredential(null);
    setExistingEmail(null);
  };

  const executeAuthAction = async <T,>(action: () => Promise<T>): Promise<T | void> => {
    clearError();
    setIsLoading(true);
    try {
      return await action();
    } catch (err: any) {
      console.error("Auth error:", err);
      
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        if (email) {
          setExistingEmail(email);
          setPendingCredential(err.credential);
          
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          setError(`Ya existe una cuenta con ${email}. Métodos disponibles: ${signInMethods.join(", ")}. ¿Quieres vincular las cuentas?`);
        } else {
          setError(getFriendlyErrorMessage(err.code));
        }
      } else {
        setError(getFriendlyErrorMessage(err.code));
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFirebase = (email: string, password: string) =>
    executeAuthAction(() => signInWithEmailAndPassword(auth, email, password));

  const registerWithFirebase = (email: string, password: string, fullname: string) =>
    executeAuthAction(async () => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullname });
      return userCredential;
    });

  const loginWithGoogle = () =>
    executeAuthAction(() => signInWithPopup(auth, new GoogleAuthProvider()));

  const loginWithFacebook = () =>
    executeAuthAction(() => signInWithPopup(auth, new FacebookAuthProvider()));

  
  const linkWithPassword = (email: string, password: string) =>
    executeAuthAction(async () => {
      if (!user) throw new Error("No user logged in");
      const credential = EmailAuthProvider.credential(email, password);
      return await linkWithCredential(user, credential);
    });

  const linkWithGoogle = () =>
    executeAuthAction(async () => {
      if (!user) throw new Error("No user logged in");
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    });

  const linkWithFacebook = () =>
    executeAuthAction(async () => {
      if (!user) throw new Error("No user logged in");
      const provider = new FacebookAuthProvider();
      return await signInWithPopup(auth, provider);
    });

  const linkExistingAccount = async (password?: string) => {
    if (!existingEmail || !pendingCredential) {
      setError("No hay información de cuenta pendiente para vincular");
      return;
    }

    return executeAuthAction(async () => {
      if (password) {
        const userCredential = await signInWithEmailAndPassword(auth, existingEmail, password);
        await linkWithCredential(userCredential.user, pendingCredential);
        return userCredential;
      } else {
        throw new Error("Contraseña requerida para vincular cuentas");
      }
    });
  };

  const logout = () => executeAuthAction(() => signOut(auth));

  return {
    user,
    error,
    isLoading,
    pendingCredential,
    existingEmail,
    loginWithFirebase,
    registerWithFirebase,
    loginWithGoogle,
    loginWithFacebook,
    linkWithPassword,
    linkWithGoogle,
    linkWithFacebook,
    linkExistingAccount,
    logout,
    clearError,
  };
};
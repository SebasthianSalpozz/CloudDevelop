/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Input } from "./Input";
import Button from "./Button";
import Card from "./Card";

interface AccountLinkingModalProps {
  email: string;
  onLinkAccount: (password: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const AccountLinkingModal: React.FC<AccountLinkingModalProps> = ({
  email,
  onLinkAccount,
  onCancel,
  isLoading
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("La contraseña es requerida");
      return;
    }
    
    try {
      await onLinkAccount(password);
    } catch (err) {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <Card title="Vincular Cuentas">
          <p className="text-gray-600 mb-4">
            Ya tienes una cuenta con <strong>{email}</strong>. 
            Para vincular tus cuentas, ingresa la contraseña de tu cuenta existente.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              label="Contraseña de la cuenta existente"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
            
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isLoading}
              >
                Vincular Cuentas
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
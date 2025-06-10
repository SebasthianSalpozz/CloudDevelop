import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export const GuestUser = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
      <Button
        variant="primary"
        className="mt-3"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
    </>
  );
};
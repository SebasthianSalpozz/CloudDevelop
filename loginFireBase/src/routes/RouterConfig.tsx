import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { LinkWithPasswordPage } from "../pages/LinkWithPasswordPage";
import PostsPage from "../pages/post/PostsPage";

export const RouterConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/linkpassword" element={<LinkWithPasswordPage />} />
      <Route path="/posts" element={<PostsPage />} /> {/* Nueva ruta */}
    </Routes>
  );
};
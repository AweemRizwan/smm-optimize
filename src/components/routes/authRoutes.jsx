import { lazy } from "react";

const Login = lazy(() => import("../../pages/Auth/LoginForm"));
const ForgotPassword = lazy(() => import("../../pages/Auth/ForgotPassword"));
const ResetPasswordLink = lazy(() => import("../../pages/Auth/ResetPasswordLink"));
const NewPassword = lazy(() => import("../../pages/Auth/NewPassword"));
const SuccessPassword = lazy(() => import("../../pages/Auth/SuccessPassword"));
const Register = lazy(() => import("../../pages/Auth/Register"));

const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-link-sent", element: <ResetPasswordLink /> },
  { path: "/set-password/:token/:uid", element: <NewPassword /> },
  { path: "/success-password", element: <SuccessPassword /> },
  { path: "/:agencySlug/register", element: <Register /> },
];

export default authRoutes;

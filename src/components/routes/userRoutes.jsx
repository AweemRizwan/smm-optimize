import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const UsersPage = lazy(() => import("../../pages/Users/UsersPage"));
const CreateUser = lazy(() => import("../../pages/Users/CreateUser"));
const UpdateUser = lazy(() => import("../../pages/Users/UpdateUser"));

const userRoutes = [
  { path: "/users", element: <ProtectedRoute><UsersPage /></ProtectedRoute> },
  { path: "/users/new", element: <ProtectedRoute><CreateUser /></ProtectedRoute> },
  { path: "/users/:userId/view", element: <ProtectedRoute><UpdateUser /></ProtectedRoute> },
];

export default userRoutes;
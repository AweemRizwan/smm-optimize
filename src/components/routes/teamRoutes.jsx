import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const TeamPage = lazy(() => import("../../pages/Teams/TeamsPage"));
const CreateTeamPage = lazy(() => import("../../pages/Teams/CreateTeam"));
const EditTeamPage = lazy(() => import("../../pages/Teams/EditTeamPage"));

const teamRoutes = [
  { path: "/teams", element: <ProtectedRoute><TeamPage /></ProtectedRoute> },
  { path: "/teams/new", element: <ProtectedRoute><CreateTeamPage /></ProtectedRoute> },
  { path: "/teams/:teamId/view", element: <ProtectedRoute><EditTeamPage /></ProtectedRoute> },
];

export default teamRoutes;

import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const ProfileSettings = lazy(() => import("../../pages/Profile/ProfileSettings"));
const CalendarVariables = lazy(() => import("../../pages/Profile/CalendarVariables"));
const CreatePlanSets = lazy(() => import("../../pages/Admin/CreatePlanSets"));
const PlanSets = lazy(() => import("../../pages/Admin/PlanSets"));
const UpdatePlanSets = lazy(() => import("../../pages/Admin/UpdatePlanSets"));

const settingsRoutes = [
  { path: "/settings/profile", element: <ProtectedRoute><ProfileSettings /></ProtectedRoute> },
  { path: "/settings/calendar-variables", element: <ProtectedRoute><CalendarVariables /></ProtectedRoute> },
  { path: "/settings/plan-sets/new", element: <ProtectedRoute><CreatePlanSets /></ProtectedRoute> },
  { path: "/settings/plan-sets", element: <ProtectedRoute><PlanSets /></ProtectedRoute> },
  { path: "/settings/plan-sets/:planId/view", element: <ProtectedRoute><UpdatePlanSets /></ProtectedRoute> },
];

export default settingsRoutes;

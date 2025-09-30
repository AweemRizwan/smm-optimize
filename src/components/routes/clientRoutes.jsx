import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const ClientsPage = lazy(() => import("../../pages/Clients/ClientsPage"));
const NewClient = lazy(() => import("../../pages/Clients/NewCLient"));
const BusinessDetails = lazy(() => import("../../pages/Clients/BusinessDetails"));
const PlanForm = lazy(() => import("../../pages/Clients/Plan"));
const ThreadPage = lazy(() => import("../../pages/Clients/Threads"));
const NotesPage = lazy(() => import("../../pages/Clients/Notes"));
const ContentCalendars = lazy(() => import("../../pages/Clients/ContentCalendars"));
const Proposal = lazy(() => import("../../pages/Clients/Proposal"));
const Invoices = lazy(() => import("../../pages/Clients/Invoices"));
const Strategy = lazy(() => import("../../pages/Clients/Strategy"));
const Reports = lazy(() => import("../../pages/Clients/Reports"));
const CalendarPage = lazy(() => import("../../pages/Clients/CalendarPage"));
const CustomTasks = lazy(() => import("../../pages/Clients/CustomTasks"));
const CalendarMonthlyView = lazy(() => import("../../pages/Clients/CalendarMonthlyView"));

const clientRoutes = [
  { path: "/", element: <ProtectedRoute><ClientsPage /></ProtectedRoute> },
  { path: "/clients/new", element: <ProtectedRoute><NewClient /></ProtectedRoute> },
  { path: "/clients/:clientId/view", element: <ProtectedRoute><BusinessDetails /></ProtectedRoute> },
  { path: "/clients/:clientId/plan", element: <ProtectedRoute><PlanForm /></ProtectedRoute> },
  { path: "/clients/:clientId/threads", element: <ProtectedRoute><ThreadPage /></ProtectedRoute> },
  { path: "/clients/:clientId/notes", element: <ProtectedRoute><NotesPage /></ProtectedRoute> },
  { path: "/clients/:clientId/content-calendars", element: <ProtectedRoute><ContentCalendars /></ProtectedRoute> },
  { path: "/clients/:clientId/proposal", element: <ProtectedRoute><Proposal /></ProtectedRoute> },
  { path: "/clients/:clientId/invoices", element: <ProtectedRoute><Invoices /></ProtectedRoute> },
  { path: "/clients/:clientId/strategy", element: <ProtectedRoute><Strategy /></ProtectedRoute> },
  { path: "/clients/:clientId/reports", element: <ProtectedRoute><Reports /></ProtectedRoute> },
  { path: "/clients/:clientId/custom-tasks", element: <ProtectedRoute><CustomTasks /></ProtectedRoute> },
  { path: "/clients/:clientId/content-calendars/calendar/:calendarId", element: <ProtectedRoute><CalendarPage /></ProtectedRoute> },
  { path: "/:accountManagerName/:businessName/:yearMonth", element: <ProtectedRoute><CalendarMonthlyView /></ProtectedRoute> },
];

export default clientRoutes;

import authRoutes from "./authRoutes";
import clientRoutes from "./clientRoutes";
import teamRoutes from "./teamRoutes";
import userRoutes from "./userRoutes";
import settingsRoutes from "./settingsRoutes";

const routes = {
  auth: [...authRoutes],
  protected: [
    ...clientRoutes,
    ...teamRoutes,
    ...userRoutes,
    ...settingsRoutes,
  ],
};

export default routes;

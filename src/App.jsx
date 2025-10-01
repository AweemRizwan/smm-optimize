import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "./components/Loader/SkeletonLoader";
import Layout from "./layouts/shared/Layout";
import routes from "./components/routes";
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import webSocketService from './services/websocket/WebSocketService';
import { addNotification } from './features/notifications/notificationsSlice';
import useCurrentUser from './hooks/useCurrentUser'
import { apiSlice } from './services/api/apiSlice'
import CalendarMonthlyView from './pages/Clients/CalendarMonthlyView'
import CustomTasks from './pages/Clients/CustomTasks'
import AssignedTasks from './pages/Tasks/AssignedTasks'
import Meetings from './pages/Meetings/Meetings'
import CreateMeetings from './pages/Meetings/MeetingCreate'
import CustomAssignedTasks from './pages/Tasks/CustomAssignedTasks'
import { getAccessToken, getRefreshToken } from './utils/tokenUtils'
import { useGetProfileQuery } from './services/api/profileApiSlice'
import { setUser } from './features/auth/authSlice'
import ProtectedRoute from "./components/routes/ProtectedRoute";
const WS_URL = import.meta.env.VITE_WS_URL

function App() {
  const dispatch = useDispatch();
  const { userId, role } = useCurrentUser()
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // Optionally, use an RTK Query hook to fetch the profile
  const { data: profileData, refetch: fetchProfile } = useGetProfileQuery(null, {
    skip: !(accessToken || refreshToken), // ✅ correct condition
  });

  useEffect(() => {
    // If user is not in Redux, but tokens exist, try fetching the profile
    if (!userId && (accessToken || refreshToken)) {
      fetchProfile()
        .then((profile) => {
          if (profile?.data) {
            // console.log('Rehydrated user:', profile.data);
            dispatch(setUser({ user: profile.data, access_token: accessToken, refresh_token: refreshToken }));
          }
        })
        .catch((err) => {
          console.error('Failed to rehydrate user:', err);
        });
    }
  }, [userId, accessToken, refreshToken, dispatch, fetchProfile]);

  useEffect(() => {
    if (userId) {
      // Connect WebSocket with user ID
      webSocketService.connect(WS_URL, userId);

      const handleWebSocketMessage = (message) => {
        dispatch(addNotification(message));

        // Invalidate task cache for the associated client
        if (message.client_id) {
          dispatch(
            apiSlice.util.invalidateTags([{ type: 'ClientTasks', id: message.client_id }, { type: 'Task', id: 'LIST' }])
          );
        }
      };


      webSocketService.addListener(handleWebSocketMessage);

      return () => {
        // Clean up WebSocket connection and listeners on unmount
        webSocketService.removeListener(handleWebSocketMessage);
        webSocketService.disconnect();
      };
    }
  }, [dispatch, userId]);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public/Auth routes */}
        {routes.auth.map(({ path, element }, idx) => (
          <Route key={idx} path={path} element={element} />
        ))}

        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          {routes.protected.map(({ path, element }, idx) => (
            <Route key={idx} path={path} element={element} />
          ))}
          {/* Missing routes directly yahan add kar lo */}
          <Route path="/assigned-task" element={<ProtectedRoute><AssignedTasks /></ProtectedRoute>} />
          <Route path="/custom-assigned-task" element={<ProtectedRoute><CustomAssignedTasks /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/meetings/new" element={<ProtectedRoute><CreateMeetings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App

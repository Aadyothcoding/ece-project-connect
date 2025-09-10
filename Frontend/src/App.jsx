import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import StudentDashboard from "./pages/StudentDahboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import TeacherProfile from "./pages/TeacherProfile.jsx";
import TeacherApplications from "./pages/TeacherApplications.jsx";
import UpdateProject from "./pages/UpdateProject.jsx";
import Notifications from "./pages/Notifications.jsx";
import MyTeams from "./pages/MyTeams.jsx"; // Import the new page
import SetGlobalDeadline from "./pages/SetGlobalDeadline.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StatisticsReport from "./pages/StatisticsReport.jsx";
import { useEffect, useState } from "react";

// Wrapper to inject user prop from getCurrentUser API
function SetGlobalDeadlineWrapper() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    import("./api").then(({ getCurrentUser }) => {
      getCurrentUser().then(res => setUser(res.data)).catch(() => setUser(null));
    });
  }, []);
  return <SetGlobalDeadline user={user} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-profile" element={<TeacherProfile />} />
        <Route
          path="/teacher/applications/:id"
          element={<TeacherApplications />}
        />
        <Route
          path="/teacher/update-project/:projectId"
          element={<UpdateProject />}
        />
        <Route path="/teacher/my-teams" element={<MyTeams />} />
        <Route path="/teacher/set-global-deadline" element={<SetGlobalDeadlineWrapper />} />
    <Route path="/teacher/statistics-report" element={<StatisticsReport />} />
      </Routes>
    </Router>
  );
}
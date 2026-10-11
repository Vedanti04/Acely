import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register.jsx";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard.jsx";
import Upload from "../pages/Upload";
import Notes from "../pages/Notes";
import Flashcards from "../pages/Flashcards";
import Quiz from "../pages/Quiz";
import MindMap from "../pages/MindMap";
import Results from "../pages/Results";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Progress from "../pages/Progress";

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Dashboard application */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/notes/:documentId"
          element={<Notes />}
        />

        <Route
          path="/flashcards/:documentId"
          element={<Flashcards />}
        />

        <Route
          path="/quiz/:documentId"
          element={<Quiz />}
        />

        <Route
          path="/mindmap/:documentId"
          element={<MindMap />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
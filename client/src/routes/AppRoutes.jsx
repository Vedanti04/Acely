import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import Upload from "../pages/Upload";
import Notes from "../pages/Notes";
import Flashcards from "../pages/Flashcards";
import MindMap from "../pages/MindMap";
import Quiz from "../pages/Quiz";
import Profile from "../pages/Profile";
import Progress from "../pages/Progress";
import Results from "../pages/Results";
import Settings from "../pages/Settings";

function AppRoutes() {

  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:documentId" element={<Notes />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/flashcards/:documentId" element={<Flashcards />} />
        <Route path="/mindmap" element={<MindMap />} />
        <Route path="/mindmap/:documentId" element={<MindMap />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:documentId" element={<Quiz />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/results" element={<Results />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

    </Routes>
  );
}

export default AppRoutes;

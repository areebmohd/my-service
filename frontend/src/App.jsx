import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from "./pages/ProfilePage";
import { useState } from "react";

function App() {
  const token = localStorage.getItem("token");
  const [activeSection, setActiveSection] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <HomePage activeSection={activeSection} setActiveSection={setActiveSection}/> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginRegisterPage activeSection={activeSection} setActiveSection={setActiveSection}/>} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;

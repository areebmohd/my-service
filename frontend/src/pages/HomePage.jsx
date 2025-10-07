import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 1) {
      try {
        const res = await API.post("/user/suggest", { query: value });
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  // ✅ Go to search results page
  const handleSelectSuggestion = (profession) => {
    navigate(`/search?profession=${profession}`);
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Go to profile
  const goToProfile = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id){
      navigate(`/profile/${user.id}`);
    }else{
      navigate("/login");
    }
  };

  return (
    <div className="homepage">
      {/* 🔹 Navbar */}
      <nav className="navbar">
        <div className="logo">MyService.com</div>
        <div className="nav-links">
          <button onClick={goToProfile}>My Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* 🔹 Main Section */}
      <div className="main-content">
        <h1 className="main-heading">Find the Right Service, Instantly ⚡</h1>
        <p className="description">
          Welcome to <span>MyService.com</span> — a platform where you can find
          trusted professionals for anything you need, from home repairs to tech help.
        </p>

        {/* 🔹 Search Box */}
        <div className="search-section">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search for a service... e.g. someone who can fix lights"
            className="search-bar"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSelectSuggestion(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useEffect, useState } from "react";
import API from "../api/api.js";
import "./SearchResultsPage.css";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResultsPage = () => {
  const [users, setUsers] = useState([]);
  const [feeFilter, setFeeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [likesSort, setLikesSort] = useState("");
  const [accountAgeSort, setAccountAgeSort] = useState("");
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search);
  const profession = query.get("profession") || "";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Extract fee range if selected
        let minFee = "";
        let maxFee = "";
        if (feeFilter) {
          [minFee, maxFee] = feeFilter.split("-").map(Number);
        }

        const res = await API.get("/user/search", {
          params: {
            profession,
            minFee,
            maxFee,
            locationFilter,
            likesSort,
            accountAgeSort,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    // 🔹 Refetch whenever any filter/sort changes
    fetchResults();
  }, [profession, feeFilter, locationFilter, likesSort, accountAgeSort]);

  return (
    <div className="search-results-page">
      <header className="results-header">
        <h1>
          Results for: <span>{profession}</span>
        </h1>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </header>

      <div className="filters">
        {/* 💰 Fee */}
        <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)}>
          <option value="">Filter by Fee</option>
          <option value="0-500">₹0 - ₹500</option>
          <option value="501-1000">₹501 - ₹1000</option>
          <option value="1001-5000">₹1001 - ₹5000</option>
          <option value="5001-10000">₹5001 - ₹10000</option>
        </select>

        {/* 📍 Location */}
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">Filter by Location</option>
          <option value="same-city">Same City</option>
          <option value="same-country">Same Country</option>
          <option value="different-country">Different Country</option>
        </select>

        {/* ❤️ Likes */}
        <select value={likesSort} onChange={(e) => setLikesSort(e.target.value)}>
          <option value="">Sort by Likes</option>
          <option value="highest">Highest Likes</option>
        </select>

        {/* 🕓 Account Age */}
        <select value={accountAgeSort} onChange={(e) => setAccountAgeSort(e.target.value)}>
          <option value="">Sort by Account Age</option>
          <option value="new">New Accounts</option>
          <option value="old">Old Accounts</option>
        </select>
      </div>

      <div className="results-grid">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              className="user-card"
              key={user._id}
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <img
                src={
                  user.profilePic ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s"
                }
                alt={user.name}
                className="profile-pic"
              />
              <h3>{user.name}</h3>
              <p className="profession">{user.profession}</p>
              <p className="location">
                {user.city}, {user.country}
              </p>
              <p className="fee">Fee: ₹{user.fee || "N/A"}</p>
              <p className="likes">❤️ {user.likes || 0} Likes</p>
              <p className="joined">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="no-results">No professionals found 😕</p>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

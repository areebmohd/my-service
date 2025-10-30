import React, { useEffect, useState } from "react";
import API from "../api/api.js";
import "./SearchResultsPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

const SearchResultsPage = () => {
  const [users, setUsers] = useState([]);
  const [feeFilter, setFeeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [likesSort, setLikesSort] = useState("");
  const [accountAgeSort, setAccountAgeSort] = useState("");
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search);
  const profession = query.get("profession") || "";

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "transparent",
      border: "2px solid #1e90ff",
      borderRadius: "10px",
      width: "300px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#1e90ff",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "white",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(4, 15, 45)",
      borderRadius: "10px",
      paddingTop: "5px",
      paddingBottom: "5px",
      zIndex: 10,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgb(6, 22, 66)" : "transparent",
      color: state.isFocused ? "white" : "#63a4ff",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#63a4ff",
    }),
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
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

    fetchResults();
  }, [profession, feeFilter, locationFilter, likesSort, accountAgeSort]);

  if (!users) return <p className="loading">Loading...</p>;

  return (
    <div className="search-results-page">
      <header className="results-header">
        <p>Results for {decodeURIComponent(profession)}</p>

        <button className="backBtn" onClick={() => navigate("/")}>
          Back
        </button>
      </header>

      <div className="filters">
        <Select
          value={
            feeFilter
              ? {
                  value: feeFilter,
                  label: `₹${feeFilter.replace("-", " - ₹")}`,
                }
              : null
          }
          onChange={(option) =>
            setFeeFilter(
              option && option.value === feeFilter ? "" : option?.value || ""
            )
          }
          options={[
            { value: "0-500", label: "₹0 - ₹500" },
            { value: "500-1000", label: "₹500 - ₹1000" },
            { value: "1000-5000", label: "₹1000 - ₹5000" },
            { value: "5000-10000", label: "₹5000 - ₹10000" },
          ]}
          placeholder="Filter by Fee"
          styles={customSelectStyles}
        />

        <Select
          value={
            locationFilter
              ? {
                  value: locationFilter,
                  label:
                    locationFilter === "same-city"
                      ? "Same City"
                      : locationFilter === "same-country"
                      ? "Same Country"
                      : "Different Country",
                }
              : null
          }
          onChange={(option) =>
            setLocationFilter(
              option && option.value === locationFilter
                ? ""
                : option?.value || ""
            )
          }
          options={[
            { value: "same-city", label: "Same City" },
            { value: "same-country", label: "Same Country" },
            { value: "different-country", label: "Different Country" },
          ]}
          placeholder="Filter by Location"
          styles={customSelectStyles}
        />

        <Select
          value={
            likesSort ? { value: likesSort, label: "Highest Likes" } : null
          }
          onChange={(option) =>
            setLikesSort(
              option && option.value === likesSort ? "" : option?.value || ""
            )
          }
          options={[{ value: "highest", label: "Highest Likes" }]}
          placeholder="Sort by Likes"
          styles={customSelectStyles}
        />

        <Select
          value={
            accountAgeSort
              ? {
                  value: accountAgeSort,
                  label:
                    accountAgeSort === "new" ? "New Accounts" : "Old Accounts",
                }
              : null
          }
          onChange={(option) =>
            setAccountAgeSort(
              option && option.value === accountAgeSort
                ? ""
                : option?.value || ""
            )
          }
          options={[
            { value: "new", label: "New Accounts" },
            { value: "old", label: "Old Accounts" },
          ]}
          placeholder="Sort by Account Age"
          styles={customSelectStyles}
        />
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
                  "https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg"
                }
                alt={user.name}
                className="profile-pic"
                loading="lazy"
              />
              <div className="details">
                <p className="username">{user.name}</p>
                <p className="profession">{user.profession}</p>
                <p className="likes">{user.likes || 0} Likes</p>
              </div>
            </div>
          ))
        ) : (
          <p>No professionals found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

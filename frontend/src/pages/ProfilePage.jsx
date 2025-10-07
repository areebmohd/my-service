import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { id } = useParams(); // profile being viewed
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [contentMode, setContentMode] = useState(false);
  const [showLikedUsers, setShowLikedUsers] = useState(false);
  const [likedUsersList, setLikedUsersList] = useState([]); // objects
  const [myLikedIds, setMyLikedIds] = useState([]); // ids that current user liked
  const [isLiked, setIsLiked] = useState(false); // whether current user liked this profile
  const [form, setForm] = useState({});
  const [newSection, setNewSection] = useState({
    title: "",
    description: "",
    images: [],
    videos: [],
  });
  const [suggestions, setSuggestions] = useState([]);
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch profile + my liked users in parallel
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profilePromise = API.get(`/user/${id}`);
        const likedPromise = token
          ? API.get("/user/liked")
          : Promise.resolve({ data: [] });

        const [profileRes, likedRes] = await Promise.all([
          profilePromise,
          likedPromise,
        ]);

        const profile = profileRes.data;
        setUser(profile);

        // init edit form fields
        setForm({
          name: profile.name || "",
          profession: profile.profession || "",
          location: profile.location || "",
          city: profile.city || "",
          country: profile.country || "",
          timing: profile.timing || "",
          fee: profile.fee || "",
          contact: profile.contact || "",
        });

        // owner check
        if (
          loggedInUser &&
          (loggedInUser.id === profile._id || loggedInUser._id === profile._id)
        ) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }

        // get my liked users ids
        const likedArr = likedRes.data || [];
        const likedIds = likedArr.map((u) => u._id || u.id);
        setMyLikedIds(likedIds);
        setLikedUsersList(likedArr);

        // set isLiked based on whether the profile id is present in my liked ids
        setIsLiked(likedIds.includes(profile._id));
      } catch (err) {
        console.error("Fetch profile / liked list error:", err);
      }
    };

    fetchAll();
  }, [id, token]); // rerun when profile changes or token changes

  // Profession suggestion handler (same as before)
  const handleProfessionInput = async (e) => {
    const value = e.target.value;
    setForm({ ...form, profession: value });

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

  const handleSelectProfession = (profession) => {
    setForm({ ...form, profession });
    setSuggestions([]);
  };

  const handleEditChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/user/update/${user._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditMode(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  // Add content
  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/user/upload/${user._id}`, newSection, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setContentMode(false);
      setNewSection({ title: "", description: "", images: [], videos: [] });
      alert("Content added!");
    } catch (err) {
      console.error(err);
      alert("Failed to add content");
    }
  };

  // Fetch my liked users (used after like/unlike to refresh local list)
  const fetchMyLikedUsers = async () => {
    if (!token) {
      setMyLikedIds([]);
      setLikedUsersList([]);
      setIsLiked(false);
      return;
    }

    try {
      const res = await API.get("/user/liked", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const likedArr = res.data || [];
      const likedIds = likedArr.map((u) => u._id || u.id);
      setMyLikedIds(likedIds);
      setLikedUsersList(likedArr);
      setIsLiked(likedIds.includes(id));
    } catch (err) {
      console.error("Error fetching my liked users:", err);
    }
  };

  // Like / Unlike toggle
  const handleLikeUser = async () => {
    if (!token) {
      alert("Please login to like users");
      navigate("/login");
      return;
    }

    try {
      // toggle like on backend
      const res = await API.put(
        `/user/like/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend returns updated target user (your controller returns target)
      // setUser accordingly (be defensive)
      if (res.data && (res.data._id || res.data.likes !== undefined)) {
        // if whole user returned
        if (res.data._id) setUser(res.data);
        // if only likes returned, update likes count
        else if (res.data.likes !== undefined)
          setUser((prev) => ({ ...prev, likes: res.data.likes }));
      }

      // refresh my liked list and toggle button state
      await fetchMyLikedUsers();
    } catch (err) {
      console.error("Like/unlike error:", err);
      alert("Could not toggle like. Try again.");
    }
  };

  // show liked users modal/list
  const openLikedUsers = async () => {
    await fetchMyLikedUsers();
    setShowLikedUsers(true);
  };

  if (!user) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <img
          src={
            user.profilePic ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s"
          }
          alt="Profile"
          className="profile-picture"
        />
        <div className="profile-info">
          <div className="profile-name-row">
            <h1>{user.name}</h1>

            {/* Like button: show only if not owner */}
            {!isOwner && (
              <button
                className={`like-btn ${isLiked ? "liked" : ""}`}
                onClick={handleLikeUser}
              >
                {isLiked ? "💖 Liked" : "🤍 Like"}
              </button>
            )}
          </div>

          <p className="likes">Likes: {user.likes || 0}</p>
          <p className="detail">Profession: {user.profession || "N/A"}</p>
          <p className="detail">Location: {user.location || "N/A"}</p>
          <p className="detail">City: {user.city || "N/A"}</p>
          <p className="detail">Country: {user.country || "N/A"}</p>
          <p className="detail">Timing: {user.timing || "N/A"}</p>
          <p className="detail">Fee: ₹{user.fee || "N/A"}</p>
          <p className="detail">Contact: {user.contact || "N/A"}</p>

          {isOwner && (
            <div className="owner-buttons">
              <button onClick={() => setEditMode(!editMode)}>
                {editMode ? "Cancel Edit" : "Edit Profile"}
              </button>
              <button onClick={() => setContentMode(!contentMode)}>
                {contentMode ? "Cancel Add" : "Add Content"}
              </button>
              <button onClick={openLikedUsers}>💙 Liked Users</button>
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <form className="edit-form" onSubmit={handleUpdateProfile}>
          <h3>Edit Profile Info</h3>
          <div className="profession-input">
            <input
              type="text"
              name="profession"
              placeholder="Profession"
              value={form.profession}
              onChange={handleProfessionInput}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => handleSelectProfession(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="text"
            name="location"
            placeholder="Address or Area"
            value={form.location}
            onChange={handleEditChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city || ""}
            onChange={handleEditChange}
          />

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country || ""}
            onChange={handleEditChange}
          />

          <input
            type="text"
            name="timing"
            placeholder="Timing"
            value={form.timing}
            onChange={handleEditChange}
          />

          <input
            type="number"
            name="fee"
            placeholder="Fee"
            value={form.fee}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={form.contact}
            onChange={handleEditChange}
          />
          <button type="submit">Save Changes</button>
        </form>
      )}

      {/* Add content */}
      {contentMode && (
        <form className="content-form" onSubmit={handleAddContent}>
          <h3>Add Custom Section</h3>
          <input
            type="text"
            placeholder="Section Title"
            value={newSection.title}
            onChange={(e) =>
              setNewSection({ ...newSection, title: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newSection.description}
            onChange={(e) =>
              setNewSection({ ...newSection, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Image URLs (comma separated)"
            value={newSection.images.join(",")}
            onChange={(e) =>
              setNewSection({
                ...newSection,
                images: e.target.value.split(","),
              })
            }
          />
          <input
            type="text"
            placeholder="Video URLs (comma separated)"
            value={newSection.videos.join(",")}
            onChange={(e) =>
              setNewSection({
                ...newSection,
                videos: e.target.value.split(","),
              })
            }
          />
          <button type="submit">Add Section</button>
        </form>
      )}

      {/* Custom sections */}
      <div className="custom-sections">
        {user.customSections?.length ? (
          user.customSections.map((sec, i) => (
            <div className="section" key={i}>
              <h2>{sec.title}</h2>
              <p>{sec.description}</p>
              <div className="media">
                {sec.images?.map((img, idx) => (
                  <img src={img} alt="custom" key={idx} />
                ))}
                {sec.videos?.map((vid, idx) => (
                  <video key={idx} src={vid} controls />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="no-content">No additional content yet.</p>
        )}
      </div>

      {/* Liked users modal */}
      {showLikedUsers && (
        <div className="liked-users-modal">
          <div className="modal-content">
            <h3>💙 Users You Liked</h3>
            <button
              className="close-btn"
              onClick={() => setShowLikedUsers(false)}
            >
              ✖ Close
            </button>
            {likedUsersList.length > 0 ? (
              likedUsersList.map((u) => (
                <div key={u._id} className="liked-user-row">
                  <img
                    src={u.profilePic || "https://via.placeholder.com/40"}
                    alt={u.name}
                    className="liked-user-pic"
                  />
                  <span>{u.name}</span>
                </div>
              ))
            ) : (
              <p>No liked users yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

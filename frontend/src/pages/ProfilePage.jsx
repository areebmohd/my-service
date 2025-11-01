import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./ProfilePage.css";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [contentMode, setContentMode] = useState(false);
  const [showLikedUsers, setShowLikedUsers] = useState(false);
  const [likedUsersList, setLikedUsersList] = useState([]);
  const [myLikedIds, setMyLikedIds] = useState([]);
  const [isValidProfession, setIsValidProfession] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.includes("s3.amazonaws.com")) {
      try {
        const urlObj = new URL(url);
        const key = urlObj.pathname.startsWith("/")
          ? urlObj.pathname.slice(1)
          : urlObj.pathname;

        if (key) {
          const proxyUrl = `${
            API.defaults.baseURL
          }/user/image?key=${encodeURIComponent(key)}`;
          console.log("Converting S3 URL:", url, "to proxy URL:", proxyUrl);
          return proxyUrl;
        }
      } catch (e) {
        console.error("Error parsing URL:", url, e);
        const match = url.match(/s3[^\/]*\/\/[^\/]+\/(.+)$/);
        if (match) {
          const proxyUrl = `${
            API.defaults.baseURL
          }/user/image?key=${encodeURIComponent(match[1])}`;
          return proxyUrl;
        }
      }
    }
    return url;
  };

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

        setForm({
          name: profile.name || "",
          profession: profile.profession || "",
          bio: profile.bio || "",
          location: profile.location || "",
          city: profile.city || "",
          country: profile.country || "",
          timing: profile.timing || "",
          fee: profile.fee || "",
          contact: profile.contact || "",
        });

        if (
          loggedInUser &&
          (loggedInUser.id === profile._id || loggedInUser._id === profile._id)
        ) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }

        const likedArr = likedRes.data || [];
        const likedIds = likedArr.map((u) => u._id || u.id);
        setMyLikedIds(likedIds);
        setLikedUsersList(likedArr);
        setIsLiked(likedIds.includes(profile._id));
      } catch (err) {
        console.error("Fetch profile / liked list error:", err);
      }
    };

    fetchAll();
  }, [id, token]);

  const confirmToast = (message, onConfirm) => {
    const toastId = toast.info(
      ({ closeToast }) => (
        <div>
          <p>{message}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              style={{
                background: "blue",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                color: "white",
                outline: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                onConfirm();
                toast.dismiss(toastId);
              }}
            >
              Yes
            </button>
            <button
              style={{
                background: "red",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                color: "white",
                outline: "none",
                cursor: "pointer",
              }}
              onClick={() => toast.dismiss(toastId)}
            >
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const handleProfessionInput = async (e) => {
    const value = e.target.value;
    setForm({ ...form, profession: value });
    setIsValidProfession(false);

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
    setIsValidProfession(true);
  };

  const handleEditChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      [
        "name",
        "profession",
        "bio",
        "location",
        "city",
        "country",
        "timing",
        "fee",
        "contact",
      ].forEach((k) => {
        if (form[k] !== undefined && form[k] !== null) payload[k] = form[k];
      });

      if (form.removeProfilePic) {
        payload.removeProfilePic = true;
      }

      if (form.profilePicFile) {
        const file = form.profilePicFile;
        const arrayBuffer = await file.arrayBuffer();

        const response = await fetch(
          `${
            API.defaults.baseURL
          }/user/upload-file?filename=${encodeURIComponent(
            file.name
          )}&contentType=${encodeURIComponent(file.type)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": file.type,
            },
            body: arrayBuffer,
          }
        );

        if (!response.ok) {
          throw new Error("Profile picture upload failed");
        }

        const data = await response.json();
        payload.profilePicUrl = data.publicUrl;
      }

      if (form.profession === user.profession) {
      } else if (!isValidProfession) {
        toast.warning("Please select a valid profession from suggestions.");
        return;
      }

      const safePayload = payload || {};

      const res = await API.put(`/user/update/${user._id}`, safePayload);

      const updatedUser = res.data?.user || res.data;
      setUser(updatedUser);
      setForm({
        name: updatedUser.name || "",
        profession: updatedUser.profession || "",
        bio: updatedUser.bio || "",
        location: updatedUser.location || "",
        city: updatedUser.city || "",
        country: updatedUser.country || "",
        timing: updatedUser.timing || "",
        fee: updatedUser.fee || "",
        contact: updatedUser.contact || "",
      });
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed update:", err);
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.message === "Name already taken"
      ) {
        toast.warn(
          "This name is already taken. Please choose a different name."
        );
      } else {
        toast.error("Failed to update profile. Try again later.");
      }
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const uploadFile = async (file) => {
        const arrayBuffer = await file.arrayBuffer();

        const response = await fetch(
          `${
            API.defaults.baseURL
          }/user/upload-file?filename=${encodeURIComponent(
            file.name
          )}&contentType=${encodeURIComponent(file.type)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": file.type,
            },
            body: arrayBuffer,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.publicUrl;
      };

      const imageUrls = await Promise.all(
        (newSection.images || []).map(uploadFile)
      );
      const videoUrls = await Promise.all(
        (newSection.videos || []).map(uploadFile)
      );

      const contentPayload = {
        title: newSection.title || "",
        description: newSection.description || "",
        images: imageUrls || [],
        videos: videoUrls || [],
      };

      const res = await API.post(`/user/upload/${user._id}`, contentPayload);

      setUser(res.data.user);
      setContentMode(false);
      setNewSection({ title: "", description: "", images: [], videos: [] });
      toast.success("Content added!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add content");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    confirmToast("Are you sure you want to delete this post?", async () => {
      try {
        const res = await API.delete(`/user/section/${user._id}/${sectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        toast.success("Post deleted successfully!");
      } catch (err) {
        console.error("Error deleting section:", err);
        toast.error("Failed to delete post.");
      }
    });
  };

  const handleShareSection = (sectionId) => {
    const link = `${window.location.origin}/profile/${user._id}?section=${sectionId}`;
    navigator.clipboard.writeText(link);
    toast.info("Post link copied to clipboard!");
  };

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

  const handleLikeUser = async () => {
    if (!token) {
      toast.warn("Please login to like users");
      navigate("/login");
      return;
    }

    try {
      const res = await API.put(`/user/like/${user._id}`, {});

      if (res.data && (res.data._id || res.data.likes !== undefined)) {
        if (res.data._id) setUser(res.data);
        else if (res.data.likes !== undefined)
          setUser((prev) => ({ ...prev, likes: res.data.likes }));
      }

      await fetchMyLikedUsers();
    } catch (err) {
      console.error("Like/unlike error:", err);
      toast.error("Could not toggle like. Try again.");
    }
  };

  const openLikedUsers = async () => {
    await fetchMyLikedUsers();
    setShowLikedUsers(true);
  };

  if (!user) return <p className="loading">Loading...</p>;

  return (
    <div className="profile-page">
      <div className="nav">
        {isOwner ? <p>My Profile</p> : <p>Profile</p>}
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="profile-header">
        <img
          src={(() => {
            if (!user.profilePic) {
              return "https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg";
            }
            const proxyUrl = getImageUrl(user.profilePic);
            return proxyUrl || user.profilePic;
          })()}
          alt="Profile"
          className="profile-picture"
          loading="lazy"
        />
        <div className="profile-info">
          <div className="profile-main-row">
            <p className="name">{user.name}</p>
            <p className="likes">{user.likes || 0} Likes</p>
          </div>

          <div className="profession-bio">
            <p className="profession heading">{user.profession}</p>
            <p className="bio">{user.bio}</p>
          </div>

          <div className="address">
            <div className="location-box">
              <p className="heading">Location</p>
              <p className="detail">{user.location || "N/A"}</p>
            </div>
            <div className="city-box">
              <p className="heading">City</p>
              <p className="detail">{user.city || "N/A"}</p>
            </div>
            <div className="country-box">
              <p className="heading">Country</p>
              <p className="detail">{user.country || "N/A"}</p>
            </div>
          </div>

          <div className="time-fee">
            <div className="time-box">
              <p className="heading">Timings</p>
              <p className="detail">{user.timing || "N/A"}</p>
            </div>
            <div className="fee-box">
              <p className="heading">Fee</p>
              <p className="detail">₹{user.fee || "N/A"}</p>
            </div>
          </div>

          <div className="contact">
            <p className="heading">Contacts</p>
            <p className="detail">{user.contact || "N/A"}</p>
          </div>

          {isOwner && (
            <div className="owner-buttons">
              <button onClick={() => setEditMode(!editMode)}>
                {editMode ? "Cancel Edit" : "Edit Profile"}
              </button>
              <button onClick={() => setContentMode(!contentMode)}>
                {contentMode ? "Cancel Add" : "Add Content"}
              </button>
              <button onClick={openLikedUsers}>Liked Users</button>
            </div>
          )}
          {!isOwner && (
            <button
              className={`like-btn ${isLiked ? "liked" : ""}`}
              onClick={handleLikeUser}
            >
              {isLiked ? "Liked" : "Like"}
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <form className="edit-form" onSubmit={handleUpdateProfile}>
          <p className="heading">Edit Profile Info</p>
          <div className="pair">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleEditChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email || ""}
              readOnly
              style={{ cursor: "not-allowed" }}
            />
          </div>

          <div className="profile-pic-edit">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setForm((prev) => ({
                  ...prev,
                  profilePicFile: file,
                  removeProfilePic: false,
                }));
                setUser((prev) => ({
                  ...prev,
                  profilePic: file
                    ? URL.createObjectURL(file)
                    : prev.profilePic,
                }));
              }}
            />

            {user.profilePic && (
              <div className="edit-profile-pic">
                <img
                  src={user.profilePic}
                  alt="Current"
                  style={{ width: "100px", borderRadius: "10px" }}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      removeProfilePic: true,
                      profilePicFile: null,
                    }));
                    setUser((prev) => ({ ...prev, profilePic: "" }));
                  }}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Remove Picture
                </button>
              </div>
            )}
          </div>
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
                {suggestions
                  .filter((s) => s.type === "profession")
                  .map((s, i) => (
                    <li key={i} onClick={() => handleSelectProfession(s.value)}>
                      {s.value}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <textarea
            name="bio"
            placeholder="Write something about yourself"
            value={form.bio || ""}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Address or Area"
            value={form.location}
            onChange={handleEditChange}
          />
          <div className="pair">
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
          </div>

          <div className="pair">
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
          </div>

          <textarea
            name="contact"
            placeholder="Contact"
            value={form.contact}
            onChange={handleEditChange}
          />
          <button type="submit">Save Changes</button>
        </form>
      )}

      {contentMode && (
        <form className="content-form" onSubmit={handleAddContent}>
          <p className="heading">Add Custom Section</p>
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

          <div className="upload-section">
            <label>Upload Images (max 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files);
                const all = [...newSection.images, ...selected].slice(0, 4);
                setNewSection({ ...newSection, images: all });
              }}
            />
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {newSection.images.map((file, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{
                      height: "200px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewSection({
                        ...newSection,
                        images: newSection.images.filter((_, i) => i !== index),
                      })
                    }
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "transparent",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="upload-section">
            <label>Upload Videos (max 4)</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files);
                const all = [...newSection.videos, ...selected].slice(0, 4);
                setNewSection({ ...newSection, videos: all });
              }}
            />

            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {newSection.videos.map((file, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    style={{
                      height: "200px",
                      borderRadius: "10px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewSection({
                        ...newSection,
                        videos: newSection.videos.filter((_, i) => i !== index),
                      })
                    }
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "transparent",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit">Add Section</button>
        </form>
      )}

      <div className="custom-sections">
        {user.sections?.length ? (
          user.sections.map((sec, i) => (
            <div className="section" key={i}>
              <div className="section-header">
                <p className="title">{sec.title}</p>
                <div className="menu-container">
                  <button
                    className="menu-btn"
                    onClick={() =>
                      setUser((prev) => ({
                        ...prev,
                        sections: prev.sections.map((s, idx) =>
                          idx === i
                            ? { ...s, showMenu: !s.showMenu }
                            : { ...s, showMenu: false }
                        ),
                      }))
                    }
                  >
                    ⋮
                  </button>

                  {sec.showMenu && (
                    <div className="menu-dropdown">
                      {isOwner && (
                        <button onClick={() => handleDeleteSection(sec._id)}>
                          Delete
                        </button>
                      )}
                      <button onClick={() => handleShareSection(sec._id)}>
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="desc">{sec.description}</p>

              <div className="media">
                {sec.images?.map((img, idx) => {
                  const imageUrl = getImageUrl(img) || img;
                  return (
                    <img
                      key={idx}
                      src={imageUrl}
                      alt="user content"
                      loading="lazy"
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          img,
                          "Proxy URL:",
                          imageUrl
                        );
                        e.target.style.display = "none";
                      }}
                    />
                  );
                })}
                {sec.videos?.map((vid, idx) => {
                  const videoUrl = getImageUrl(vid) || vid;
                  return (
                    <video
                      key={idx}
                      src={videoUrl}
                      controls
                      onError={(e) => {
                        console.error(
                          "Video failed to load:",
                          vid,
                          "Proxy URL:",
                          videoUrl
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="no-content">No additional content yet.</p>
        )}
      </div>

      {showLikedUsers && (
        <div className="liked-users-modal">
          <div className="modal-content">
            <div className="like-head">
              <p>Liked Users</p>
              <button
                className="close-btn"
                onClick={() => setShowLikedUsers(false)}
              >
                ✖
              </button>
            </div>
            {likedUsersList.length > 0 ? (
              likedUsersList.map((u) => (
                <div
                  key={u._id}
                  className="liked-user-row"
                  onClick={() => {
                    setShowLikedUsers(false);
                    navigate(`/profile/${u._id}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={
                      u.profilePic
                        ? getImageUrl(u.profilePic) || u.profilePic
                        : "https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg"
                    }
                    alt={u.name}
                    className="liked-user-pic"
                    loading="lazy"
                  />
                  <div className="liked-user-info">
                    <span className="liked-user-name">{u.name}</span>
                    <span className="liked-user-profession">
                      {u.profession || "No profession added"}
                    </span>
                  </div>
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

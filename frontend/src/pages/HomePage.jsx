import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import "./HomePage.css";
import Footer from "../../components/Footer";
import PrivacyPolicy from "../../components/Policy";
import TermsConditions from "../../components/TermsConditions";
import ContactUs from "../../components/ContactUs";

const HomePage = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      const fetchInfo = async () => {
        try {
          const res = await API.get(`/user/${parsed.id}`);
          setUserInfo(res.data || {});
          console.log(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchInfo();
    }
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
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

  const handleSelectSuggestion = (profession) => {
    navigate(`/search?profession=${encodeURIComponent(profession)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goToProfile = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="homepage">
      <nav className="navbar">
        <img
          src={
            userInfo.profilePic ||
            "https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg"
          }
          alt="profile"
          onClick={goToProfile}
        />
        <div className="logo">MyService</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="main-content">
        <h1 className="main-heading">Find the Right Service, Instantly ⚡</h1>
        <p className="description">
          Welcome to MyService.com — a platform where you can find trusted
          professionals for anything you need, from home repairs to tech help.
        </p>

        <div className="search-section">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search for a profession or professional..."
            className="search-bar"
          />
          {suggestions.length > 0 && (
            <ul className="suggestion-box">
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSelectSuggestion(s.value)}>
                  {s.type === "user" ? (
                    <div className="suggestion">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                      >
                        <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                      </svg>
                      <p>{s.value}</p>
                    </div>
                  ) : (
                    <div className="suggestion">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                      >
                        <path d="M264 112L376 112C380.4 112 384 115.6 384 120L384 160L256 160L256 120C256 115.6 259.6 112 264 112zM208 120L208 160L128 160C92.7 160 64 188.7 64 224L64 320L576 320L576 224C576 188.7 547.3 160 512 160L432 160L432 120C432 89.1 406.9 64 376 64L264 64C233.1 64 208 89.1 208 120zM576 368L384 368L384 384C384 401.7 369.7 416 352 416L288 416C270.3 416 256 401.7 256 384L256 368L64 368L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 368z" />
                      </svg>
                      <p>{s.value}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer setActiveSection={setActiveSection} />
      {activeSection === "privacy" && (
        <PrivacyPolicy setActiveSection={setActiveSection} />
      )}
      {activeSection === "terms" && (
        <TermsConditions setActiveSection={setActiveSection} />
      )}
      {activeSection === "contact" && (
        <ContactUs setActiveSection={setActiveSection} />
      )}
    </div>
  );
};

export default HomePage;

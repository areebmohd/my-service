import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./LoginRegister.css";
import Footer from "../../components/Footer";
import PrivacyPolicy from "../../components/Policy";
import TermsConditions from "../../components/TermsConditions";
import ContactUs from "../../components/ContactUs";
import { toast } from "react-toastify";

const LoginRegisterPage = ({ activeSection, setActiveSection }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [otpMode, setOtpMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "", otp: "", newPassword: "" });
    setIsForgot(false);
    setOtpMode(false);
  };

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
                outline:"none",
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
                outline:"none",
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

  const handleForgotPassword = async () => {
    if (!form.email) {
      toast.warn("Please enter your email first!");
      return;
    }
    confirmToast("Do you want to reset your password?", async () => {
      try {
        const res = await API.post("/user/send-reset-otp", { email: form.email });
        toast.success(res.data.message || "OTP sent successfully!");
        setOtpMode(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error sending OTP");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpMode) {
      if (form.newPassword.length < 5) {
        toast.warn("Password must be at least 5 characters long");
        return;
      }
      try {
        const res = await API.post("/user/reset-password-otp", {
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        });
        toast.success(res.data.message || "Password reset successful!");
        setOtpMode(false);
        setIsForgot(false);
        setIsLogin(true);
        setForm({ name: "", email: "", password: "" });
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Wrong OTP or error resetting password"
        );
      }
      return;
    }

    try {
      const endpoint = isLogin ? "/user/login" : "/user/register";
      const res = await API.post(endpoint, form);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.success("Registration successful! Please login now.");
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message;
      toast.error(msg || "Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <p className="site-title">MyService</p>
        <p>
          {otpMode
            ? "Reset your password"
            : isLogin
            ? "Login to your account"
            : "Create your account"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && !otpMode && (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          {!otpMode ? (
            <>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                required
              />
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
            </>
          )}

          <button type="submit" className="submit-btn">
            {otpMode ? "Submit" : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {!otpMode && isLogin && (
          <p className="forgot-text" onClick={handleForgotPassword}>
            Forgot password?
          </p>
        )}

        {!otpMode && (
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={toggleMode}>
              {isLogin ? "Register here" : "Login here"}
            </span>
          </p>
        )}
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

export default LoginRegisterPage;

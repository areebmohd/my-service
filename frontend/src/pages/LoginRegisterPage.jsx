import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./LoginRegister.css";

const LoginRegisterPage = () => {
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

  // 🌀 Toggle login/register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "", otp: "", newPassword: "" });
    setIsForgot(false);
    setOtpMode(false);
  };

  // 🚨 Forgot password clicked
  const handleForgotPassword = async () => {
    if (!form.email) return alert("Please enter your email first!");

    const confirmReset = window.confirm(
      "Do you want to reset your password?"
    );
    if (!confirmReset) return;

    try {
      const res = await API.post("/user/send-reset-otp", { email: form.email });
      alert(res.data.message);
      setOtpMode(true); // switch UI to OTP mode
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  // 🧠 Handle login or register or reset
  const handleSubmit = async (e) => {
    e.preventDefault();

    // OTP reset mode
    if (otpMode) {
      if (form.newPassword.length < 5) {
        return alert("Password must be at least 5 characters long");
      }
      try {
        const res = await API.post("/user/reset-password-otp", {
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        });
        alert(res.data.message);
        // Reset to login mode
        setOtpMode(false);
        setIsForgot(false);
        setIsLogin(true);
        setForm({ name: "", email: "", password: "" });
      } catch (err) {
        alert(err.response?.data?.message || "Wrong OTP or error resetting");
      }
      return;
    }

    // Normal login/register
    try {
      const endpoint = isLogin ? "/user/login" : "/user/register";
      const res = await API.post(endpoint, form);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      } else {
        alert("Registration successful! Please login now.");
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message;
      alert(msg || "Something went wrong");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="site-title">MyService.com</h1>
        <h2>
          {otpMode
            ? "Reset your password"
            : isLogin
            ? "Login to your account"
            : "Create your account"}
        </h2>

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
            {otpMode
              ? "Submit"
              : isLogin
              ? "Login"
              : "Register"}
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
    </div>
  );
};

export default LoginRegisterPage;

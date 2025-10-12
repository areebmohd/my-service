import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./LoginRegister.css";

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "" });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 🚨 Check for minimum password length (only on register)
    if (!isLogin && form.password.length < 5) {
      alert("Password must be at least 5 characters long!");
      return;
    }
  
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
      console.error("Login/Register error:", err);
  
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Something went wrong!";
  
      if (isLogin) {
        if (message === "User not found") {
          alert("No account found with this email. Please register first.");
        } else if (message === "Invalid password") {
          alert("Incorrect password. Please try again!");
        } else {
          alert(message);
        }
      } else {
        alert(message);
      }
    }
  };  
  

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="site-title">MyService.com</h1>
        <h2>{isLogin ? "Login to your account" : "Create your account"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
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

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={toggleMode}>
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginRegisterPage;

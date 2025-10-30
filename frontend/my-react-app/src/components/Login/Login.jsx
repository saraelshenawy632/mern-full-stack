import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Joi from "joi";
import { toast, ToastContainer, Slide } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

export default function Login({ setData = () => {}, data = null }) { 
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = schema.validate(formData, { abortEarly: false });
    if (error) {
      error.details.forEach(err => toast.error(err.message, { autoClose: 3000 }));
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/user/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        const decoded = jwtDecode(res.data.token);
        setData(decoded);
        toast.success("Login successful! Redirecting...", { autoClose: 1500, transition: Slide });
        setTimeout(() => window.location.href = "/", 1500);
      } else {
        toast.error("Login failed: Token not received");
      }

      setFormData({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong!", { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer transition={Slide} />
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button type="submit" disabled={isLoading}>{isLoading ? <div className="spinner"></div> : "Log In"}</button>

        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

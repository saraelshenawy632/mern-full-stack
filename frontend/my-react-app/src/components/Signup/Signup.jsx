import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Joi from "joi";
import "./Signup.css";

export default function Signup({ setData }) {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const schema = Joi.object({
    fname: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Za-z]+$/)
      .required()
      .messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name must be less than 20 characters",
        "string.pattern.base": "First name must contain only letters",
      }),
    lname: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Za-z]+$/)
      .required()
      .messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name must be less than 20 characters",
        "string.pattern.base": "Last name must contain only letters",
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email",
      }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
    role: Joi.string().valid("user", "admin").default("user"),
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = schema.validate(formData, { abortEarly: false });
    if (error) {
      error.details.forEach((err) => {
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/user/register",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Account created successfully! Redirecting to login...", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      console.log(res.data);
      setFormData({
        fname: "",
        lname: "",
        email: "",
        password: "",
        role: "user",
      });
      setData();

      setTimeout(() => {
        navigate("/login");
      }, 2000);
       setTimeout(() => {
        window.location.href = "/login";
      }, 2000);;
    } catch (err) {
      console.error("Server response:", err.response?.data);
      toast.error(err.response?.data?.error || "Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer />
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Sign Up</h2>

        <input
          type="text"
          name="fname"
          placeholder="First Name"
          value={formData.fname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lname"
          placeholder="Last Name"
          value={formData.lname}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";
import "./Profile.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = {
          fname: decoded.fname,
          lname: decoded.lname,
          email: decoded.email,
          role: decoded.role,
          fullName: `${decoded.fname} ${decoded.lname}`,
        };
        setUser(userData);
        setFormData({
          fname: userData.fname,
          lname: userData.lname,
          email: userData.email,
          password: "",
        });
      } catch (err) {
        toast.error("Failed to load user data");
      }
    } else {
      toast.error("Please log in first");
    }
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch("http://localhost:5000/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profile updated successfully!");
      setUser({
        ...user,
        fname: res.data.user.fname,
        lname: res.data.user.lname,
        email: res.data.user.email,
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card loading">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p className="error-text">No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-circle">
            <span className="avatar-text">
              {user.fname[0].toUpperCase()}
              {user.lname[0].toUpperCase()}
            </span>
          </div>
          <h2 className="user-name">
            {user.fname} {user.lname}
          </h2>
          <span className={`role-badge ${user.role}`}>
            {user.role === "admin" ? "Admin" : "User"}
          </span>
        </div>

        {!isEditing ? (
          <div className="profile-body">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">First Name</span>
              <span className="info-value">{user.fname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Name</span>
              <span className="info-value">{user.lname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Type</span>
              <span className="info-value capitalize">{user.role}</span>
            </div>

            <div className="profile-footer">
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form className="edit-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to keep old password"
              />
            </div>

            <div className="edit-actions">
              <button type="submit" className="save-btn">
                Save
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
  <ToastContainer
    position="top-right"
    autoClose={2000}      
    className="custom-toast"
  />
    </div>
    
  );
}

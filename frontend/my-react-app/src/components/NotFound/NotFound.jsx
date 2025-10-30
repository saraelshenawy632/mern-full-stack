import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  useEffect(() => {
    // Uncomment if you want to use react-toastify for a 404 toast
    /*
    toast.info("Oops! This page doesn't exist.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    */
  }, []);

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <button onClick={handleGoHome}>Go to Homepage</button>
        <p>
          Or return to <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
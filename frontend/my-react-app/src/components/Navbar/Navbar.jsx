// src/components/Navbar/Navbar.jsx
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaHome,
  FaBox,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaReceipt,
  FaTachometerAlt,
  FaUserCircle,
} from "react-icons/fa";
import "./Navbar.css";
import { CartContext } from "../../Context/CartContext";

export default function Navbar({ data, setData }) {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
        setData(null);

  }

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container d-flex justify-content-between align-items-center">
        <NavLink className="navbar-brand" to={data ? "/" : "/login"}>
          Aura
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav mb-2 mb-lg-0 text-center">
            {!data ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    <FaSignInAlt /> Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/signup">
                    <FaUserPlus /> Signup
                  </NavLink>
                </li>
                      <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    <FaHome /> Home
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                 <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    <FaHome /> Home
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/products">
                    <FaBox /> Products
                  </NavLink>
                </li>

                <li className="nav-item cart-link">
                  <NavLink className="nav-link position-relative" to="/cart">
                    <FaShoppingCart /> Cart
                    {cartItems?.length > 0 && (
                      <span className="cart-count">{cartItems.length}</span>
                    )}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/order">
                    <FaReceipt /> Orders
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    <FaUserCircle /> Profile
                  </NavLink>
                </li>
         

                {data?.role === "admin" && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/dashboard">
                      <FaTachometerAlt /> Dashboard
                    </NavLink>
                  </li>
                )}

                <li className="nav-item">
                  <span className="nav-link logout-link" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

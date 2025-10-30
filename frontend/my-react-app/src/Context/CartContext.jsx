import React, { createContext, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/cart/allcart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.cart.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (product) => {
    try {
      if (product.stock <= 0) return;
      const res = await axios.post(
        "http://localhost:5000/cart/add",
        { products: [{ productId: product._id, quantity: 1 }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.updatedCart.products);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCartQuantity = async (productId, action) => {
    try {
      setUpdatingId(productId);
      const res = await axios.put(
        "http://localhost:5000/cart/change-quantity",
        { productId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Server Response:", res.data);

      setCartItems(res.data.updatedCart.products);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteFromCart = async (productId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/cart/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.updatedCart.products);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        updatingId,
        fetchCart,
        addToCart,
        updateCartQuantity,
        deleteFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

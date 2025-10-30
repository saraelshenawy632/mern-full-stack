import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Cart.css";

export default function Cart() {
  console.log("Cart component rendered!");

  const {
    cartItems,
    updateCartQuantity,
    deleteFromCart,
    fetchCart,
    updatingId,
  } = useContext(CartContext);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleChangeQuantity = async (productId, action) => {

    try {
      await updateCartQuantity(productId, action);

    } catch (error) {
      console.error("Error updating quantity:", error);

      toast.error("Failed to update quantity.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteFromCart(productId);
      toast.success("Product removed from cart!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove product.");
    }
  };

  const handleBuy = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      triggerShake();
      return;
    }

    for (const item of cartItems) {
      const product = item.productData || {};
      if (item.quantity > (product.stock || 0)) {
        toast.error(
          `Insufficient stock for ${product.name || "Unnamed Product"}`
        );
        triggerShake();
        return;
      }
    }

    toast.success("Redirecting to checkout...");
    setTimeout(() => navigate("/order"), 1200);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.productData?.price || 0) * item.quantity,
    0
  );

  return (
    <div className={`cart-container ${isShaking ? "shake" : ""}`}>
      <Toaster position="top-center" />
      <h2>Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => {
            const product = item.productData || {};
            return (
              <div key={product._id || Math.random()} className="cart-card">
                <img
                  src={product.image_url || "/placeholder.png"}
                  alt={product.name || "Product"}
                  className="cart-img"
                />
                <div className="cart-info">
                  <h4>{product.name || "Unnamed Product"}</h4>
                  <p>${product.price?.toFixed(2) || "0.00"}</p>
                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() => handleChangeQuantity(product._id, "dec")}
                      disabled={
                        item.quantity <= 1 || updatingId === product._id
                      }
                    >
                      {updatingId === product._id ? "..." : "-"}
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleChangeQuantity(product._id, "inc")}
                      disabled={
                        item.quantity >= (product.stock || 0) ||
                        updatingId === product._id
                      }
                    >
                      {updatingId === product._id ? "..." : "+"}
                    </button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleDelete(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <h3>Total: ${totalPrice.toFixed(2)}</h3>
          <button className="checkout-btn" onClick={handleBuy}>
            Check Out
          </button>
        </>
      )}
    </div>
  );
}

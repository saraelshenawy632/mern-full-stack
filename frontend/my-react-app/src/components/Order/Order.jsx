import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CartContext } from "../../Context/CartContext";
import LocationPicker from "../Location/LocationPicker";
import { useNavigate } from "react-router-dom";
import "./Order.css";

const detectCardType = (number) => {
  const cleaned = number.replace(/\s/g, "");
  if (!cleaned) return "unknown";
  if (/^4/.test(cleaned)) return "visa";
  if (/^5[1-5]/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return "diners";
  return "unknown";
};

export default function Order() {
  const { cartItems, fetchCart, removeFromCart } = useContext(CartContext);
  const [shipping, setShipping] = useState({ street: "", city: "", phone: "" });
  const [location, setLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [cardNumber, setCardNumber] = useState(["", "", "", ""]);
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardType, setCardType] = useState("unknown");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 18;
      const rotateY = ((centerX - x) / centerX) * 18;

      card.style.transform = `perspective(3000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.03)`;
      card.style.transition = "transform 0.12s ease-out";
    };

    const handleMouseLeave = () => {
      card.style.transform = "perspective(3000px) rotateX(0) rotateY(0) translateY(-20px) scale(1)";
      card.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const fullNumber = cardNumber.join("");
    setCardType(detectCardType(fullNumber));
  }, [cardNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e, index) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    const newNumber = [...cardNumber];
    newNumber[index] = val;
    setCardNumber(newNumber);

    if (val.length === 4 && index < 3) {
      document.getElementById(`num-${index + 1}`)?.focus();
    }
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length > 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setExpiry(val);
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, cardType === "amex" ? 4 : 3);
    setCvv(val);
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "AURA10") {
      setDiscount(totalPrice * 0.1);
      toast.success("Discount 10%  ");
    } else {
      toast.error("Invalid Couponcode");
    }
  };

  const handleOrder = async () => {
    if (!token) {
      toast.error("You must be logged in!");
      setTimeout(() => (window.location.href = "/login"), 1500);
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!shipping.street || !shipping.city || !shipping.phone) {
      toast.error("Please fill in all shipping details.");
      return;
    }

    if (!location) {
      toast.error("Please select your location on the map.");
      return;
    }

    if (paymentMethod === "card") {
      const allFilled = cardNumber.every((n) => n.length === 4);
      const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
      const cvvLength = cardType === "amex" ? 4 : 3;
      const cvvValid = cvv.length === cvvLength;

      if (!allFilled) {
        toast.error("Please enter complete 16-digit card number.");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter card holder name.");
        return;
      }
      if (!expiryValid) {
        toast.error("Enter expiry as MM/YY.");
        return;
      }
      if (!cvvValid) {
        toast.error(`Enter ${cvvLength}-digit CVV.`);
        return;
      }
    }

    try {
      const shippingCost = shippingMethod === "express" ? 10 : 0; 
      const finalPrice = totalPrice - discount + shippingCost;
      const orderData = {
        shippingAddress: {
          ...shipping,
          location: { type: "Point", coordinates: [location.lng, location.lat] },
        },
        paymentMethod,
        shippingMethod, 
        totalPrice: finalPrice,
        discount,
        shippingCost, 
        ...(paymentMethod === "card" && {
          cardInfo: {
            number: cardNumber.join(""),
            name: cardName.trim().toUpperCase(),
            expiry,
            cvv,
            type: cardType,
          },
        }),
      };

      const response = await axios.post(
        "http://localhost:5000/order/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newOrder = response.data?.order;
      toast.success("Order placed successfully!");
      fetchCart();

      setTimeout(() => {
        if (newOrder?._id) {
          navigate(`/summaryorder/${newOrder._id}`, { state: { orderData: newOrder } });
        }
      }, 1500);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order.");
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.productData?.price) || 0) * item.quantity,
    0
  );

  const shippingCost = shippingMethod === "express" ? 10 : 0;
  const finalPrice = totalPrice - discount + shippingCost;

  const formatCardNumber = () => {
    return cardNumber.map((part) => part.padEnd(4, "•")).join(" ");
  };

  return (
    <div className="order-page">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <div className="order-steps">
        <div className="step completed">
          <div className="step-icon">1</div>
          <div className="step-text">
            <div className="step-title">Address</div>
            <div className="step-sub">Completed</div>
          </div>
        </div>
        <div className="step-line"></div>
        <div className="step completed">
          <div className="step-icon">2</div>
          <div className="step-text">
            <div className="step-title">Shipping</div>
            <div className="step-sub">Completed</div>
          </div>
        </div>
        <div className="step-line"></div>
        <div className="step active">
          <div className="step-icon">3</div>
          <div className="step-text">
            <div className="step-title">Payment</div>
            <div className="step-sub">Final Step</div>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-message">Your cart is empty. Start shopping now!</p>
      ) : (
        <>
          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="products-grid">
              {cartItems.map((item) => (
                <div key={item.productData?._id} className="product-card">
                  <div className="product-image-wrapper">
                    <img
                      src={item.productData?.image_url || "/placeholder.jpg"}
                      alt={item.productData?.name}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="quantity-badge">{item.quantity}</div>
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{item.productData?.name}</h4>
                    <p className="product-price">
                      ${Number(item.productData?.price).toFixed(2)} each
                    </p>
                    <p className="product-total">
                      Total: ${(Number(item.productData?.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
               
                </div>
              ))}
            </div>
            <div className="summary-footer">
              <h3 className="order-total">
                Subtotal: <span className="total-price">${totalPrice.toFixed(2)}</span>
              </h3>
              {discount > 0 && (
                <p className="discount-msg">Discount Applied: -${discount.toFixed(2)}</p>
              )}
              <p className="shipping-cost">
                Shipping ({shippingMethod === "standard" ? "Standard" : "Express"}): 
                <span className="total-price">${shippingCost.toFixed(2)}</span>
              </p>
              <h3 className="order-total">
                Grand Total: <span className="total-price">${finalPrice.toFixed(2)}</span>
              </h3>
            </div>
            <div className="coupon-section">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button className="apply-coupon-btn" onClick={applyCoupon}>
                Apply
              </button>
            </div>
          </div>

          <div className="shipping-method">
            <h3>Shipping Method</h3>
            <label className={shippingMethod === "standard" ? "active" : ""}>
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
              <span>Standard Shipping (Free)</span>
            </label>
            <label className={shippingMethod === "express" ? "active" : ""}>
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={shippingMethod === "express"}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
              <span>Express Shipping ($10)</span>
            </label>
          </div>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <label className={paymentMethod === "card" ? "active" : ""}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit Card</span>
            </label>
            <label className={paymentMethod === "cash" ? "active" : ""}>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>

          {paymentMethod === "card" && (
            <>
              <div
                ref={cardRef}
                className={`credit-card-container ${isFlipped ? "flipped" : ""} ${cardType}`}
              >
                <div className="credit-card front">
                  <div className="card-chip"></div>
                  <div className="card-number">
                    {formatCardNumber()}
                  </div>
                  <div className="card-name-expiry">
                    <span>{cardName || "CARDHOLDER NAME"}</span>
                    <span>{expiry || "MM/YY"}</span>
                  </div>
                  <div className={`card-type ${cardType}`}>
                    {cardType === "visa" && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" />
                    )}
                    {cardType === "mastercard" && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MasterCard" />
                    )}
                    {cardType === "amex" && (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_(2018).svg" alt="Amex" width="70" />
                    )}
                    {cardType === "discover" && (
                      <span className="text-xl font-bold">Discover</span>
                    )}
                    {cardType === "unknown" && <span className="text-sm opacity-60">Card</span>}
                  </div>
                </div>
                <div className="credit-card back">
                  <div className="magnetic-strip"></div>
                  <div className="cvv-signature">
                    <div className="cvv">{cvv.padEnd(cardType === "amex" ? 4 : 3, "•")}</div>
                  </div>
                </div>
              </div>

              <div className="card-inputs">
                <div className="number-fields">
                  {cardNumber.map((num, i) => (
                    <div className="input-group" key={i}>
                      <input
                        id={`num-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={num}
                        onChange={(e) => handleNumberChange(e, i)}
                        maxLength={4}
                        placeholder="0000"
                        autoComplete="cc-number"
                      />
                      {i === 0 && <label>Card Number</label>}
                    </div>
                  ))}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="JOHN DOE"
                    autoComplete="cc-name"
                  />
                  <label>Card Holder</label>
                  <div className="card-type-icon">
                    {cardType === "visa" && "VISA"}
                    {cardType === "mastercard" && "MC"}
                    {cardType === "amex" && "AMEX"}
                    {cardType === "discover" && "DISC"}
                    {cardType === "unknown" && "CARD"}
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <input
                      type="text"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                    />
                    <label>Expiry</label>
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cvv}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      onChange={handleCvvChange}
                      maxLength={cardType === "amex" ? 4 : 3}
                      placeholder="CVV"
                      autoComplete="cc-csc"
                    />
                    <label>CVV</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {paymentMethod === "cash" && (
            <p className="cash-msg">
              You will pay <strong>${finalPrice.toFixed(2)}</strong> in cash upon delivery.
            </p>
          )}

          <div className="shipping-form">
            <h3>Shipping Address</h3>
            <div className="input-group">
              <input
                type="text"
                name="street"
                value={shipping.street}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4B"
                required
              />
              <label>Street Address</label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="city"
                value={shipping.city}
                onChange={handleChange}
                placeholder="New York"
                required
              />
              <label>City</label>
            </div>
            <div className="input-group">
              <input
                type="tel"
                name="phone"
                value={shipping.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
              />
              <label>Phone Number</label>
            </div>
            <h4 className="mt-6">Pin your exact location:</h4>
            <div className="mt-3">
              <LocationPicker setLocation={setLocation} />
            </div>
            <button type="button" className="confirm-btn" onClick={handleOrder}>
              <span className="btn-text">Confirm & Pay ${finalPrice.toFixed(2)}</span>
              <span className="btn-glow"></span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
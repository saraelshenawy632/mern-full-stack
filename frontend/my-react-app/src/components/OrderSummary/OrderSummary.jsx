import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";
import axios from "axios";
import "./OrderSummary.css";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

export default function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: orderIdFromParams } = useParams();

  const initialOrder = location.state?.orderData || null;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (initialOrder) {
          setOrder(initialOrder);
          setLoading(false);
          return;
        }

        if (orderIdFromParams) {
          const res = await axios.get(
            `http://localhost:5000/order/${orderIdFromParams}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data?.data) {
            setOrder(res.data.data);
          } else {
            toast.error(" Order not found.");
            setTimeout(() => navigate("/products"), 2000);
          }
        } else {
          toast.error(" No order ID provided.");
          setTimeout(() => navigate("/products"), 2000);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        toast.error("Could not load order details.");
        setTimeout(() => navigate("/products"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdFromParams, navigate, token, initialOrder]);

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );

  if (!order) return <p>No order found.</p>;

  const {
    purchasedItems = [],
    totalOrderPrice,
    shippingAddress = {},
    createdAt,
    _id,
  } = order;

  const coordinates = shippingAddress.location?.coordinates || [0, 0];

  const handleDownloadInvoice = async () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("🧾 Aura Store - Order Invoice", 14, 20);
      doc.setFontSize(12);
      doc.text(`Order ID: ${_id}`, 14, 28);
      doc.text(`Date: ${new Date(createdAt).toLocaleString()}`, 14, 36);
      doc.text(`Street: ${shippingAddress.street || "-"}`, 14, 44);
      doc.text(`City: ${shippingAddress.city || "-"}`, 14, 51);
      doc.text(`Phone: ${shippingAddress.phone || "-"}`, 14, 58);

      const tableData = purchasedItems.map((i) => [
        i.productname,
        i.quantity,
        `$${i.price}`,
        `$${i.totalPrice}`,
      ]);

      doc.autoTable({
        startY: 70,
        head: [["Product", "Qty", "Price", "Total"]],
        body: tableData,
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`Total: $${totalOrderPrice}`, 14, finalY);
      doc.text("Thank you for shopping with Aura Store!", 14, finalY + 10);

      const trackLink = `https://aurastore.com/track/${_id}`;
      const qrDataUrl = await QRCode.toDataURL(trackLink);
      doc.addImage(qrDataUrl, "PNG", 150, 25, 40, 40);

      doc.save(`Invoice_${_id}.pdf`);
      toast.success("📄 Invoice downloaded successfully!");
      setTimeout(() => navigate("/products"), 2000);
    } catch (err) {
      console.error(err);
      toast.error(" Error generating PDF.");
    }
  };

  return (
    <div className="order-summary-page">
      <Toaster position="top-center" />
      <h2>Order Summary</h2>
      <div className="summary-card">
        <div className="order-items">
          {purchasedItems.map((item, i) => (
            <p key={i}>
              <strong>{item.productname}</strong> — {item.quantity} × ${item.price}
            </p>
          ))}
        </div>

        <p className="total">
          <strong>Total:</strong> ${totalOrderPrice}
        </p>

        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <p>
            <strong>Street:</strong> {shippingAddress.street}
          </p>
          <p>
            <strong>City:</strong> {shippingAddress.city}
          </p>
          <p>
            <strong>Phone:</strong> {shippingAddress.phone}
          </p>
        </div>

        {coordinates[0] !== 0 && (
          <div className="map-container" style={{ marginTop: 12 }}>
            <MapContainer
              center={[coordinates[1], coordinates[0]]}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coordinates[1], coordinates[0]]} icon={customIcon} />
            </MapContainer>
          </div>
        )}

        <button onClick={handleDownloadInvoice} className="download-btn">
          Download Invoice (PDF)
        </button>
      </div>
    </div>
  );
}

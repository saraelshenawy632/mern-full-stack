import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import './DetailsProduct.css';

export default function DetailsProduct() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    async function getDetails() {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/products/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched product:", data);
        setDetail(data.data || data); 
      } catch (err) {
        console.error("Error fetching product details:", err);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
  }, [id, token]);

  if (loading) return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );

  if (!detail) return <p className="error">Product not found.</p>;

  return (
    <div className="details-container">
      <div className="details-image">
        <img
          src={detail.image_url ? `/${detail.image_url}` : ''}
          alt={detail.name || "Product"}
        />
      </div>
      <div className="details-info">
        <h2>{detail.name || "No Name"}</h2>
        <p className="details-description">{detail.description || "No Description Available"}</p>
        <p className="details-full-description">{detail.full_description || ""}</p>
        <p className="details-price">Price: ${detail.price || 0}</p>
        <p className="details-rating">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              color={i < Math.round(detail.rating || 0) ? "#ffc107" : "#e4e5e9"}
            />
          ))}{" "}
          ({detail.reviews_count || 0})
        </p>
        <Link to={`/products`}>
          <button className="buy-button">Back to products</button>
        </Link>
      </div>
    </div>
  );
}

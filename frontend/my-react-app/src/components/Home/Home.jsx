import React from "react";
import { FaStar } from "react-icons/fa";
import "./Home.css";
import useRoute from "../../Hooks/useRoute";

export default function Home() {
  const { products, loading, sliderRef } = useRoute("http://localhost:5000/products");

  if (loading)
    return (
      <div className="spinner-containerr">
        <div className="spinnerr"></div>
      </div>
    );

  if (!products || products.length === 0)
    return <p className="no-products">No products found.</p>;

  return (
    <div className="home-containerr">
      <div className="product-sliderr" ref={sliderRef}>
        {products.slice(0, 50).map((product) => (
          <div className="slider-cardd" key={product._id}>
            <img
              src={product.image_url || "4.jpg"}
              alt={product.name || "No name"}
            />
            <p className="slider-namee">{product.name}</p>
          </div>
        ))}
      </div>

      <h2 className="featured-titlee">Featured Products</h2>
      <div className="product-gridd">
        {products.map((product) => (
          <div className="product-cardd" key={product._id}>
            <img
              src={product.image_url || "placeholder.jpg"}
              alt={product.name || "No name"}
              className="product-imagee"
            />
            <div className="product-infoo">
              <h3 className="product-namee">{product.name}</h3>
              <p className="product-descriptionn">{product.description}</p>
              <p className="product-pricee">${product.price}</p>
              <p className="product-ratingg">
                {[...Array(4)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={i < Math.round(product.rating || 0) ? "#ffc107" : "#e4e5e9"}
                  />
                ))}{" "}
                ({product.reviews_count || 0})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

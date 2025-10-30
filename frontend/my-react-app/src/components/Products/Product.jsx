import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import "./Product.css";
import { Link } from "react-router-dom";
import { CartContext } from "../../Context/CartContext";
import toast, { Toaster } from "react-hot-toast";

export default function Product() {
  const { fetchCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 30;
  const token = localStorage.getItem("token");

  const getCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/category/allCategories",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  }, [token]);

 const getProducts = useCallback(
  async (page = 1, category_id = null) => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/products?limit=${limit}&page=${page}`;
      if (category_id) url += `&categoryId=${category_id}`; 
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsData = Array.isArray(data?.products) ? data.products : [];
      setProducts(productsData);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  },
  [token]
);


  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    getProducts(page, selectedCategory);
  }, [getProducts, page, selectedCategory]);

  const handleAddToCart = async (product) => {
    try {
      if (product.stock <= 0) {
        toast.error(`${product.name} is out of stock!`);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/cart/add",
        { products: [{ productId: product._id, quantity: 1 }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        toast.success(`${product.name} added to cart!`, {
          duration: 2000,
          style: { background: "#fff", color: "#202020", fontWeight: "500" },
        });
        fetchCart();
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      const message = err.response?.data?.message || "Error adding to cart.";
      toast.error(message, {
        duration: 2500,
        style: { background: "#ffe0e0", color: "#b00000", fontWeight: "500" },
      });
    }
  };

  return (
    <div className="aura-prod-container">
      <Toaster position="top-center" />
      <div className="aura-cat-buttons">
        <button
          className={!selectedCategory ? "active" : ""}
          onClick={() => {
            setSelectedCategory(null);
            setPage(1);
          }}
        >
          All
        </button>

        {categories.length > 0 &&
 categories.map((cat) => (
  <button
    key={cat._id} 
    className={selectedCategory === cat._id ? "active" : ""}
    onClick={() => {
      setSelectedCategory(cat._id); 
      setPage(1);
    }}
  >
    <i className={cat.icon}></i> {cat.category_name || cat.name}
  </button>
))
}

      </div>

      {loading && (
        <div className="aura-prod-spinner-container">
          <div className="aura-prod-spinner"></div>
        </div>
      )}

      {!loading && (
        <div className="aura-prod-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="aura-prod-card" key={product._id}>
                <div className="aura-prod-img-container">
                  <img
                    src={product.image_url || "8.jpg"}
                    alt={product.name}
                    className="aura-prod-img"
                  />
                  {product.stock <= 0 && (
                    <span className="aura-out-stock">Out of Stock</span>
                  )}
                </div>

                <div className="aura-prod-info">
                  <h3 className="aura-prod-name">{product.name}</h3>
                  <p className="aura-prod-desc">{product.description}</p>
                  <p className="aura-prod-price">${product.price}</p>
                  <p className="aura-prod-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={
                          i < Math.round(product.rating || 0)
                            ? "#ffc107"
                            : "#e4e5e9"
                        }
                      />
                    ))}{" "}
                    ({product.reviews_count || 0})
                  </p>

                  <button
                    className={`aura-buy-btn ${
                      product.stock <= 0 ? "disabled" : ""
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Unavailable" : "Buy"}
                  </button>

                  <Link to={`/detailproduct/${product._id}`}>
                    <button className="aura-details-btn">Details</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No products found for this category.</p>
          )}
        </div>
      )}
    </div>
  );
}

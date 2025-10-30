import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./Dashboard.css";

export default function DashboardFull() {
  const [summary, setSummary] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category_id: "",
    stock: 0,
    image_url: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 15,
  });
  const token = localStorage.getItem("token");

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dash/admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersByDate = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/dash/admin/orders-by-date",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data.map((r) => ({
        date: r._id,
        orders: r.totalOrders,
        revenue: r.totalRevenue,
      }));
      setOrdersByDate(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/category/allCategories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/products?limit=${pagination.limit}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = Array.isArray(res.data.products) ? res.data.products : [];
      setProducts(data);
      if (res.data.pagination) {
        setPagination({
          page: res.data.pagination.page,
          totalPages: res.data.pagination.totalPages,
          limit: res.data.pagination.limit || 15,
        });
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchOrdersByDate();
    fetchCategories();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.category_id) return toast.error("Please select a category");
      const safeStock = Number(formData.stock);
      if (safeStock < 0) return toast.error("Stock cannot be negative");

      const payload = {
        ...formData,
        stock: Number(formData.stock),
        categoryId: formData.category_id,
      };

      if (editProduct) {
        await axios.patch(
          `http://localhost:5000/products/update/${editProduct._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Product updated!");
      } else {
        await axios.post(
          "http://localhost:5000/products/addproducts",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Product added!");
      }

      setShowForm(false);
      setEditProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        brand: "",
        category_id: "",
        stock: 0,
        image_url: "",
      });
      fetchProducts(pagination.page);
      fetchSummary();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      brand: product.brand || "",
      category_id: product.category?._id || "",
      stock: product.stock ?? 0,
      image_url: product.image_url || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleStockChange = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      await axios.patch(
        `http://localhost:5000/products/update/${id}`,
        { stock: newStock },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Stock updated");
      fetchProducts(pagination.page);
      fetchSummary();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock");
    }
  };

  const getCategoryName = (product) => {
    return product.category?.category_name || "-";
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchProducts(newPage);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="chart-card">
        <h2>Orders & Revenue (by date)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={ordersByDate}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#00bcd4"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#ffd700"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Users</h3>
          <p>{summary?.usersCount || "—"}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p>{summary?.ordersCount || "—"}</p>
        </div>
        <div className="card">
          <h3>Products</h3>
          <p>{summary?.productsCount || products.length}</p>
        </div>
        <div className="card">
          <h3>Revenue</h3>
          <p>
            ${summary ? Number(summary.totalRevenue).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      <div className="products-section">
        <div className="products-header">
          <h2>Manage Products ({products.length})</h2>
          <button
            className="add-btn"
            onClick={() => {
              setShowForm(true);
              setEditProduct(null);
            }}
          >
            + Add Product
          </button>
        </div>

        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ minWidth: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.image_url || "https://via.placeholder.com/80"}
                        alt={p.name}
                        className="table-img"
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{getCategoryName(p)}</td>
                    <td>${p.price}</td>
                    <td>
                      <button
                        className="stock-btn"
                        onClick={() =>
                          handleStockChange(p._id, (p.stock || 0) - 1)
                        }
                        disabled={(p.stock || 0) <= 0}
                      >
                        -
                      </button>
                      <span style={{ margin: "0 8px" }}>{p.stock ?? 0}</span>
                      <button
                        className="stock-btn"
                        onClick={() =>
                          handleStockChange(p._id, (p.stock || 0) + 1)
                        }
                      >
                        +
                      </button>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Prev
          </button>
          <span>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h3>{editProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Short Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="0"
                step="0.01"
              />
              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                required
              />
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.category_name || c.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                min="0"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editProduct ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditProduct(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>
            <div className="confirm-actions">
              <button
                className="confirm-yes"
                onClick={async () => {
                  try {
                    await axios.delete(
                      `http://localhost:5000/products/delete/${confirmDelete.id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Product deleted!");
                    fetchProducts(pagination.page);
                    fetchSummary();
                  } catch (err) {
                    toast.error("Failed to delete");
                  }
                  setConfirmDelete({ show: false, id: null });
                }}
              >
                Yes, Delete
              </button>
              <button
                className="confirm-no"
                onClick={() => setConfirmDelete({ show: false, id: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        className="custom-toast"
      />
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function useRoute(url) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const token = localStorage.getItem("token");

  async function getProducts() {
    try {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) {
        setProducts(data.slice(0, 50));
      } else if (Array.isArray(data.products)) {
        setProducts(data.products.slice(0, 50));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, [url, token]);

  useEffect(() => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = 200;
    const interval = setInterval(() => {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += scrollAmount;
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [products]);

  return { products, loading, sliderRef };
}

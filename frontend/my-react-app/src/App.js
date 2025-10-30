import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout/Layout";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import NotFound from "./components/NotFound/NotFound";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Cart from './components/Cart/Cart.jsx'
import Product from "./components/Products/Product";
import Order from "./components/Order/Order.jsx";
import { jwtDecode } from "jwt-decode";
import ProtectedRouter from "./components/ProtectedRouters/ProtectedRouter.jsx";
import DetialsProduct from "./components/DetailsProduct/DetialsProduct.jsx";
import OrderSummary from "./components/OrderSummary/OrderSummary.jsx";
import Profile from "./components/Profile/Profile.jsx";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setData(decoded);
        console.log("Decoded token:", decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        setData(null);
      }
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout data={data} setData={setData} />,
      children: [
        { index: true, element: <Home /> },  // هنا Home مفتوح للجميع
        { path: "products", element: <ProtectedRouter data={data}><Product /></ProtectedRouter> },
        { path: "dashboard", element: <ProtectedRouter data={data}><Dashboard /></ProtectedRouter> },
        { path: "order", element: <ProtectedRouter data={data}><Order /></ProtectedRouter> },
        { path: "cart", element: <ProtectedRouter data={data}><Cart /></ProtectedRouter> },
        { path: "detailproduct/:id", element: <ProtectedRouter data={data}><DetialsProduct /></ProtectedRouter> },
        { path: "summaryorder/:id", element: <ProtectedRouter data={data}><OrderSummary /></ProtectedRouter> },
        { path: "profile", element: <ProtectedRouter data={data}><Profile /></ProtectedRouter> },
        { path: "login", element: <Login setData={setData} data={data} /> },
        { path: "signup", element: <Signup setData={setData} data={data}/> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

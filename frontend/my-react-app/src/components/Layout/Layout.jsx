import React from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import AuraAssistant from "../AuraAssistant/AuraAssistant"; // استدعاء الشات

export default function Layout({ data, setData }) {
  return (
    <>
      <Navbar data={data} setData={setData} />
      <main>
        <Outlet />
      </main>
      <Footer />
      
      {/* Aura Assistant يظهر في كل الصفحات */}
      <AuraAssistant />
    </>
  );
}

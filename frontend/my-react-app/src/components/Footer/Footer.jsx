import React from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import style from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={style.footer}>
      <div className={style.footerContent}>
        <div className={style.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
        <a href="https://wa.me/12345678" target="_blank" rel="noreferrer">
  <FaWhatsapp size={25} />
</a>
        </div>
        <p className={style.copy}>© 2025 Aura. All Rights Reserved</p>
      </div>
    </footer>
  );
}

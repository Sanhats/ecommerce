"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StoreHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return <header className={`gluma-header${scrolled ? " is-scrolled" : ""}`}>
    <Link className="gluma-logo" href="/tienda" onClick={closeMenu}>LUNORA <small>FASHION</small></Link>
    <nav className={menuOpen ? "is-open" : ""}>
      <Link href="/tienda#inicio" onClick={closeMenu}>Inicio</Link>
      <Link href="/tienda/productos" onClick={closeMenu}>Productos</Link>
      <Link href="/tienda#colecciones" onClick={closeMenu}>Colecciones</Link>
    </nav>
    <div className="gluma-header-actions">
      <Link href="/carrito" aria-label="Carrito">🛒</Link>
      <button className="gluma-menu" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>☰</button>
    </div>
  </header>;
}

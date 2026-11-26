"use client";

import Link from "next/link";
import { PointerEvent, useState } from "react";

type HeroStyle = React.CSSProperties & { "--hero-rotate-x": string; "--hero-rotate-y": string; "--hero-shift-x": string; "--hero-shift-y": string };
type HeroProduct = { slug: string; name: string; price: number; image: string; alt: string };

export default function Hero3D({ collectionSlug, featuredProduct }: { collectionSlug: string; featuredProduct: HeroProduct }) {
  const [style, setStyle] = useState<HeroStyle>({ "--hero-rotate-x": "0deg", "--hero-rotate-y": "0deg", "--hero-shift-x": "0px", "--hero-shift-y": "0px" });

  function move(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    setStyle({ "--hero-rotate-x": `${-y * 7}deg`, "--hero-rotate-y": `${x * 9}deg`, "--hero-shift-x": `${x * 16}px`, "--hero-shift-y": `${y * 12}px` });
  }

  function reset() {
    setStyle({ "--hero-rotate-x": "0deg", "--hero-rotate-y": "0deg", "--hero-shift-x": "0px", "--hero-shift-y": "0px" });
  }

  return <section id="inicio" className="gluma-hero gluma-hero-3d" style={style} onPointerMove={move} onPointerLeave={reset}>
    <img className="hero-3d-image" src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800" alt="Colección de moda femenina Lunora" />
    <Link className="hero-product-card" href={featuredProduct.slug ? `/tienda/${featuredProduct.slug}` : "/tienda/productos"} aria-label={`Ver ${featuredProduct.name}`}><div className="hero-product-card-image"><img src={featuredProduct.image} alt={featuredProduct.alt} /></div><div className="hero-product-card-info"><small>En foco · Lunora</small><strong>{featuredProduct.name}</strong><span>{featuredProduct.price ? `$ ${Number(featuredProduct.price).toLocaleString("es-AR")}` : "Ver producto"} ↗</span></div></Link>
    <div className="gluma-hero-copy hero-3d-copy"><span className="gluma-kicker">Primavera / Verano · Tucumán</span><h1>Encontrá tu estilo<br /><em>para todos los días.</em></h1><p>Prendas livianas, colores cálidos y piezas pensadas para acompañarte esta temporada.</p><div className="gluma-actions"><Link className="gluma-button" href={`/tienda/coleccion/${collectionSlug}`}>Ver colección <span>→</span></Link><Link className="gluma-button gluma-button-light" href="/tienda/productos">Explorar novedades</Link></div></div>
  </section>;
}

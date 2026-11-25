"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

type VariantOptionLink = { product_option_values: { value: string; product_options: { name: string }[] } | { value: string; product_options: { name: string }[] }[] };
type Variant = { id: string; sku: string; price: number; compare_at_price: number | null; variant_option_values: VariantOptionLink[] };
type ProductImage = { url: string; alt_text: string | null };
type Product = { id: string; name: string; description: string | null; brand: string | null; product_images: ProductImage[]; product_variants: Variant[] };
type RelatedProduct = { id: string; name: string; slug: string; product_images: ProductImage[]; product_variants: { price: number }[] };

const money = (value: number) => `$ ${Number(value || 0).toLocaleString("es-AR")}`;
const relatedFallbackArtwork = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900",
  "https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=900",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900",
];

export default function ProductDetail({ product, relatedProducts }: { product: Product; relatedProducts: RelatedProduct[] }) {
  const { add } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const getValues = (link: VariantOptionLink) => Array.isArray(link.product_option_values) ? link.product_option_values : [link.product_option_values];
  const images = product.product_images || [];
  const options = useMemo(() => { const map = new Map<string, string[]>(); product.product_variants.forEach(variant => variant.variant_option_values.forEach(link => getValues(link).forEach(value => { const name = value.product_options[0]?.name || "Opción"; map.set(name, [...new Set([...(map.get(name) || []), value.value])]); }))); return [...map.entries()]; }, [product]);
  const variant = product.product_variants.find(item => item.variant_option_values.every(link => getValues(link).every(value => selected[value.product_options[0]?.name || "Opción"] === value.value))) || product.product_variants[0];
  const displayImage = images[selectedImage] || images[0];
  function addToCart() { add({ variantId: variant.id, productName: product.name, sku: variant.sku, price: variant.price, quantity }); setAdded(true); setTimeout(() => setAdded(false), 2200); }

  return <main className="store-shell gluma-detail-store">
    <div className="gluma-shipping-bar">Retiro en showroom en Tucumán · Consultá disponibilidad por WhatsApp <span>ARS $</span></div>
    <header className="gluma-header"><Link className="gluma-logo" href="/tienda">LUNORA <small>FASHION</small></Link><nav><a href="/tienda#inicio">Inicio</a><Link href="/tienda/productos">Shop</Link><a href="/tienda#colecciones">Colecciones</a><a href="/tienda#nosotros">Nosotros</a></nav><div className="gluma-header-actions"><Link href="/login" aria-label="Ingresar">♙</Link><Link href="/carrito" aria-label="Carrito">🛒</Link><button className="gluma-menu" aria-label="Abrir menú">☰</button></div></header>
    <div className="gluma-product-detail">
      <section className="gluma-detail-media"><div className="gluma-thumbnails">{images.length ? images.map((image, index) => <button className={selectedImage === index ? "is-selected" : ""} key={`${image.url}-${index}`} onClick={() => setSelectedImage(index)}><img src={image.url} alt={image.alt_text || `${product.name} vista ${index + 1}`} /></button>) : <div className="gluma-detail-placeholder">Lunora</div>}</div><div className="gluma-main-image">{displayImage ? <img src={displayImage.url} alt={displayImage.alt_text || product.name} /> : <div className="gluma-detail-placeholder">{product.brand || "Lunora"}</div>}<span className="gluma-image-badge">⌕</span></div></section>
      <section className="gluma-purchase"><span className="gluma-product-badge">Selección Lunora</span><h1>{product.name}</h1><span className="gluma-purchase-brand">{product.brand || "Lunora"} · Temporada actual</span><div className="gluma-price-row"><strong>{money(variant.price)}</strong>{variant.compare_at_price ? <><del>{money(variant.compare_at_price)}</del><span>{Math.round((1 - variant.price / variant.compare_at_price) * 100)}% OFF</span></> : null}</div>{product.description && <p className="gluma-purchase-description">{product.description}</p>}{options.map(([name, values]) => <div className="gluma-option-group" key={name}><div><b>{name}</b><span>{selected[name] || "Elegí una opción"}</span></div><div className="gluma-options">{values.map(value => <button type="button" className={selected[name] === value ? "is-selected" : ""} key={value} onClick={() => setSelected(current => ({ ...current, [name]: value }))}>{value}</button>)}</div></div>)}<div className="gluma-purchase-actions"><div className="gluma-quantity"><button type="button" onClick={() => setQuantity(current => Math.max(1, current - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity(current => current + 1)}>+</button></div><button className="gluma-add-button" type="button" onClick={addToCart}>{added ? "Agregado al carrito ✓" : "Agregar al carrito"}</button><button className="gluma-like-button" type="button" aria-label="Agregar a favoritos">♡</button></div><div className="gluma-detail-perks"><span>▱ <b>Retiro en showroom</b><small>Tucumán capital</small></span><span>◌ <b>Pago coordinado</b><small>Compra segura</small></span><span>♧ <b>Atención directa</b><small>Te ayudamos a elegir</small></span></div><div className="gluma-accordions"><details open><summary>Descripción y calce</summary><p>{product.description || "Una pieza seleccionada para el guardarropa de todos los días."}</p></details><details><summary>Materiales y cuidados</summary><p>Revisá la etiqueta de la prenda y seguí las indicaciones de lavado para conservarla mejor.</p></details><details><summary>Disponibilidad y retiro</summary><p>Coordinamos la disponibilidad y el retiro desde nuestro showroom en Tucumán.</p></details></div></section>
    </div>
    {relatedProducts.length ? <section className="gluma-related"><div className="gluma-related-heading"><div><span className="gluma-kicker">Para completar tu look</span><h2>También te puede <em>gustar</em></h2></div><Link href="/tienda/productos">Ver todo →</Link></div><div className="gluma-product-grid">{relatedProducts.map((related, index) => <Link className="gluma-product-card" href={`/tienda/${related.slug}`} key={related.id}><div className="gluma-product-image"><img src={related.product_images?.[0]?.url || relatedFallbackArtwork[index % relatedFallbackArtwork.length]} alt={related.product_images?.[0]?.alt_text || related.name} /><span className="gluma-favorite">♡</span></div><div className="gluma-product-info"><h3>{related.name}</h3><span>{related.product_variants?.[0]?.price ? money(related.product_variants[0].price) : "Consultar"}</span></div></Link>)}</div></section> : null}
    <footer className="gluma-footer"><div className="gluma-footer-brand"><Link className="gluma-logo" href="/tienda">LUNORA <small>FASHION</small></Link><p>Moda femenina para todos los días.</p></div><div><b>Enlaces rápidos</b><Link href="/tienda/productos">Shop</Link><a href="/tienda#colecciones">Colecciones</a><a href="/tienda#nosotros">Nosotros</a></div><div><b>Atención al cliente</b><a href="#">Contacto</a><a href="#">Envíos</a><a href="#">Guía de talles</a></div><div><b>Seguinos</b><a href="#">Instagram</a><a href="#">WhatsApp</a><a href="#">Pinterest</a></div><small className="gluma-copyright">© 2026 Lunora Fashion · Tucumán, Argentina</small></footer>
  </main>;
}

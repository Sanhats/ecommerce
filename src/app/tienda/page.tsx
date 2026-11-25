import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type StoreCategory = { name: string; slug: string; image: string };
type StoreCollection = { name: string; slug: string; description: string | null; image: string };
type HomeProduct = { id: string; name: string; slug: string; product_variants: { price: number }[]; product_images: { url: string; alt_text: string | null }[] };

const categoryArtwork: Record<string, string> = {
  vestidos: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
  tops: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900",
  pantalones: "https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=900",
  accesorios: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900",
  "accesorios-reales": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900",
};

const collectionArtwork: Record<string, string> = {
  "primavera-verano-2026": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
  "nuevos-ingresos": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
  "esenciales-de-verano": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200",
  "looks-de-fiesta": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200",
};

const fallbackProductArtwork = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900",
  "https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=900",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900",
];

const fallbackCategories: StoreCategory[] = [
  { name: "Vestidos", slug: "vestidos", image: categoryArtwork.vestidos },
  { name: "Tops", slug: "tops", image: categoryArtwork.tops },
  { name: "Pantalones", slug: "pantalones", image: categoryArtwork.pantalones },
  { name: "Accesorios", slug: "accesorios", image: categoryArtwork.accesorios },
];

const fallbackCollections: StoreCollection[] = [
  { name: "Primavera Verano 2026", slug: "primavera-verano-2026", description: "Una selección liviana y luminosa para la temporada cálida.", image: collectionArtwork["primavera-verano-2026"] },
  { name: "Nuevos ingresos", slug: "nuevos-ingresos", description: "Las piezas que recién llegan al showroom.", image: collectionArtwork["nuevos-ingresos"] },
  { name: "Esenciales de verano", slug: "esenciales-de-verano", description: "Básicos frescos para armar looks todos los días.", image: collectionArtwork["esenciales-de-verano"] },
  { name: "Looks de fiesta", slug: "looks-de-fiesta", description: "Texturas y siluetas para celebrar las noches cálidas.", image: collectionArtwork["looks-de-fiesta"] },
];

function cleanSlug(slug: string) { return slug.replace(/^categoria\//, "").replace(/^coleccion\//, ""); }

export default async function StorePage() {
  const supabase = await createClient();
  const [{ data: databaseCategories }, { data: databaseCollections }, { data: databaseProducts }] = await Promise.all([
    supabase.from("categories").select("name, slug, image_url").order("sort_order"),
    supabase.from("collections").select("name, slug, description").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, slug, product_variants(price), product_images(url, alt_text)").eq("status", "active").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(8),
  ]);
  const categories = (databaseCategories || []).filter(category => !category.slug.startsWith("demo-") && category.name.toLowerCase() !== "mujer").map(category => ({ name: category.name, slug: cleanSlug(category.slug), image: category.image_url || categoryArtwork[category.slug] || categoryArtwork[cleanSlug(category.slug)] || fallbackCategories[0].image }));
  const collections = (databaseCollections || []).filter(collection => !collection.slug.startsWith("demo-")).map(collection => ({ ...collection, slug: cleanSlug(collection.slug), image: collectionArtwork[cleanSlug(collection.slug)] || collectionArtwork["primavera-verano-2026"] }));
  const visibleCategories = categories.length ? categories : fallbackCategories;
  const visibleCollections = collections.length ? collections : fallbackCollections;
  const primaryCollection = visibleCollections[0];
  const products = (databaseProducts || []) as HomeProduct[];

  return <main className="store-shell gluma-store">
    <header className="gluma-header">
      <Link className="gluma-logo" href="/tienda">LUNORA <small>FASHION</small></Link>
      <nav><a href="#inicio">Inicio</a><a href="#nosotros">Nosotros</a><Link href="/tienda/productos">Shop</Link><a href="#colecciones">Colecciones</a><a href="#contacto">Contacto</a></nav>
      <div className="gluma-header-actions"><button aria-label="Buscar">⌕</button><Link href="/login" aria-label="Ingresar">♙</Link><Link href="/carrito" aria-label="Carrito">🛒</Link><button className="gluma-menu" aria-label="Abrir menú">☰</button></div>
    </header>

    <section id="inicio" className="gluma-hero">
      <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800" alt="Colección de moda femenina Lunora" />
      <div className="gluma-hero-copy"><span className="gluma-kicker">Primavera / Verano · Tucumán</span><h1>Encontrá tu estilo<br /><em>para todos los días.</em></h1><p>Prendas livianas, colores cálidos y piezas pensadas para acompañarte esta temporada.</p><div className="gluma-actions"><Link className="gluma-button" href={`/tienda/coleccion/${primaryCollection.slug}`}>Ver colección <span>→</span></Link><Link className="gluma-button gluma-button-light" href="/tienda/productos">Explorar novedades</Link></div></div>
    </section>

    <section id="nosotros" className="gluma-story"><div className="gluma-story-image"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200" alt="Prendas de Lunora" /></div><div className="gluma-story-copy"><span className="gluma-kicker">Nuestra mirada</span><h2>Hecho para tu<br /><em>estilo cotidiano.</em></h2><p>En Lunora elegimos prendas versátiles, cómodas y especiales para que armes looks que se sientan propios.</p><Link className="gluma-outline-button" href="/tienda/productos">Conocé la colección</Link></div></section>

    <section id="colecciones" className="gluma-style-banner"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1800" alt="Texturas y colores de la temporada" /><div><span className="gluma-kicker">Tu temporada, tu forma</span><h2>Tu estilo.<br /><em>Tu manera.</em></h2><p>Encontrá prendas para expresarte y moverte con libertad.</p><Link className="gluma-button" href={`/tienda/coleccion/${primaryCollection.slug}`}>Explorar colección</Link></div></section>

    <section id="shop" className="gluma-favorites"><div className="gluma-section-heading"><div><span className="gluma-kicker">Selección Lunora</span><h2>Nuestros <em>favoritos</em></h2><p>Las piezas más elegidas del showroom.</p></div><Link href="/tienda/productos">Ver todos los productos →</Link></div><div className="gluma-product-grid">{(products.length ? products : fallbackCategories.map((category, index) => ({ id: category.slug, name: category.name, slug: category.slug, product_variants: [{ price: 0 }], product_images: [{ url: fallbackProductArtwork[index], alt_text: category.name }] }))).slice(0, 4).map((product, index) => <Link className="gluma-product-card" href={products.length ? `/tienda/${product.slug}` : `/tienda/categoria/${product.slug}`} key={product.id}><div className="gluma-product-image"><img src={product.product_images?.[0]?.url || fallbackProductArtwork[index]} alt={product.product_images?.[0]?.alt_text || product.name} /><span className="gluma-favorite" aria-label={`Ver ${product.name}`}>♡</span></div><div className="gluma-product-info"><h3>{product.name}</h3><span>{product.product_variants?.[0]?.price ? `$ ${Number(product.product_variants[0].price).toLocaleString("es-AR")}` : "Ver colección"}</span></div></Link>)}</div><Link className="gluma-outline-button gluma-center-button" href="/tienda/productos">Ver todos los productos</Link></section>

    <section id="contacto" className="gluma-newsletter"><div className="gluma-newsletter-image"><img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1100" alt="Look de moda femenina" /></div><div><span className="gluma-kicker">Lunora notes</span><h2>Quedate en<br /><em>nuestro estilo.</em></h2><p>Recibí novedades, lanzamientos y beneficios del showroom.</p><form><input type="email" placeholder="Tu email" /><button>Suscribirme</button></form></div></section>

    <footer className="gluma-footer"><div className="gluma-footer-brand"><Link className="gluma-logo" href="/tienda">LUNORA <small>FASHION</small></Link><p>Moda femenina para todos los días.</p></div><div><b>Enlaces rápidos</b><Link href="/tienda/productos">Shop</Link><a href="#colecciones">Colecciones</a><a href="#nosotros">Nosotros</a></div><div><b>Atención al cliente</b><a href="#contacto">Contacto</a><a href="#">Envíos</a><a href="#">Guía de talles</a></div><div><b>Seguinos</b><a href="#">Instagram</a><a href="#">WhatsApp</a><a href="#">Pinterest</a></div><small className="gluma-copyright">© 2026 Lunora Fashion · Tucumán, Argentina</small></footer>
  </main>;
}

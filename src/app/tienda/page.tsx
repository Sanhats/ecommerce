import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type StoreCategory = { name: string; slug: string; image: string };
type StoreCollection = { name: string; slug: string; description: string | null; image: string };

const categoryArtwork: Record<string, string> = {
  vestidos: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
  tops: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
  pantalones: "https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=800",
  accesorios: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
  "accesorios-reales": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
};

const collectionArtwork: Record<string, string> = {
  "primavera-verano-2026": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000",
  "nuevos-ingresos": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000",
  "esenciales-de-verano": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1000",
  "looks-de-fiesta": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000",
};

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

function cleanSlug(slug: string) {
  return slug.replace(/^categoria\//, "").replace(/^coleccion\//, "");
}

export default async function StorePage() {
  const supabase = await createClient();
  const [{ data: databaseCategories }, { data: databaseCollections }] = await Promise.all([
    supabase.from("categories").select("name, slug, image_url").order("sort_order"),
    supabase.from("collections").select("name, slug, description").eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  const categories = (databaseCategories || [])
    .filter((category) => !category.slug.startsWith("demo-") && category.name.toLowerCase() !== "mujer")
    .map((category) => ({
      name: category.name,
      slug: cleanSlug(category.slug),
      image: category.image_url || categoryArtwork[category.slug] || categoryArtwork[cleanSlug(category.slug)] || fallbackCategories[0].image,
    }));
  const collections = (databaseCollections || [])
    .filter((collection) => !collection.slug.startsWith("demo-"))
    .map((collection) => ({
    ...collection,
    slug: cleanSlug(collection.slug),
    image: collectionArtwork[cleanSlug(collection.slug)] || collectionArtwork["primavera-verano-2026"],
    }));
  const visibleCategories = categories.length ? categories : fallbackCategories;
  const visibleCollections = collections.length ? collections : fallbackCollections;
  const primaryCollection = visibleCollections[0];
  const secondaryCollection = visibleCollections[1] || visibleCollections[0];

  return (
    <main className="store-shell fashion-store">
      <header className="fashion-header">
        <Link className="fashion-wordmark" href="/tienda">LUNORA <small>FASHION</small></Link>
        <nav>
          <a href="#colecciones">Colecciones</a>
          <a href="#categorias">Categorías</a>
          <Link href="/tienda/productos">Todos los productos</Link>
          <a href="#nosotros">Nosotros</a>
        </nav>
        <div className="header-actions">
          <Link href="/login">Ingresar</Link>
          <Link href="/carrito">Carrito</Link>
          <button aria-label="Abrir menú">☰</button>
        </div>
      </header>

      <section className="fashion-hero">
        <div className="hero-copy">
          <span className="eyebrow">Primavera / Verano · Tucumán</span>
          <h1>Elevá tu estilo cotidiano.</h1>
          <p>Prendas livianas, siluetas frescas y esenciales para los días cálidos.</p>
          <Link className="fashion-button" href={`/tienda/coleccion/${primaryCollection.slug}`}>Ver colección <span>→</span></Link>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1400" alt="Moda femenina de primavera verano" />
          <div className="hero-index"><b>01</b><span>02</span><span>03</span></div>
        </div>
      </section>

      <section id="categorias" className="category-strip">
        {visibleCategories.map((category) => (
          <Link href={`/tienda/categoria/${category.slug}`} key={category.slug}>
            <img src={category.image} alt={category.name} />
            <span>{category.name}</span>
          </Link>
        ))}
      </section>

      <section id="colecciones" className="shop-section">
        <div className="shop-heading">
          <div><span className="eyebrow">Explorá el showroom</span><h2>Encontrá tu<br />estilo perfecto.</h2></div>
          <Link href="/tienda/productos">Ver todo →</Link>
        </div>
        <div className="collection-grid">
          {visibleCollections.slice(0, 4).map((collection) => (
            <Link className="collection-card" href={`/tienda/coleccion/${collection.slug}`} key={collection.slug}>
              <img src={collection.image} alt={collection.name} />
              <div><b>{collection.name}</b><span>Ver colección →</span></div>
            </Link>
          ))}
        </div>
        <div className="promo-grid">
          <Link className="promo-card promo-sale" href={`/tienda/coleccion/${primaryCollection.slug}`}>
            <span>Temporada actual</span><h3>Primavera<br />en movimiento</h3>
          </Link>
          <Link className="promo-card promo-new" href={`/tienda/coleccion/${secondaryCollection.slug}`}>
            <span>Selección del showroom</span><h3>Piezas para<br />los días cálidos</h3>
          </Link>
        </div>
      </section>

      <section className="style-list">
        <img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1000" alt="Look de primavera verano" />
        <div><span className="eyebrow">Lunora notes</span><h2>Sumate a nuestra<br />Style List.</h2><p>Novedades y lanzamientos del showroom.</p><form><input type="email" placeholder="Ingresá tu email" /><button>Suscribirme →</button></form></div>
      </section>

      <footer id="nosotros" className="fashion-footer">
        <div className="footer-brand"><Link className="fashion-wordmark" href="/tienda">LUNORA <small>FASHION</small></Link><p>Moda femenina para todos los días. Diseñada para sentirte vos misma.</p></div>
        <div><b>SHOP</b><Link href="/tienda/productos">Productos</Link><a href="#colecciones">Colecciones</a><a href="#categorias">Categorías</a></div>
        <div><b>AYUDA</b><a href="#">Contacto</a><a href="#">Envíos</a><a href="#">Guía de talles</a></div>
        <div><b>SEGUINOS</b><a href="#">Instagram</a><a href="#">WhatsApp</a><a href="#">Pinterest</a></div>
        <div className="footer-news"><b>RECIBÍ NOVEDADES</b><p>Novedades del showroom.</p><form><input type="email" placeholder="Tu email" /><button>→</button></form></div>
        <small className="copyright">© 2026 Lunora Fashion · Tucumán, Argentina</small>
      </footer>
    </main>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">Showroom Store</span>
        <h1>Una tienda con identidad propia.</h1>
        <p>Catálogo, experiencias de compra y gestión operativa en un solo lugar. Esta es la base del nuevo ecosistema digital del showroom.</p>
        <div className="actions">
          <Link className="button" href="/tienda">Ver tienda pública</Link>
          <Link className="button secondary" href="/admin">Ir a administración</Link>
        </div>
      </section>
    </main>
  );
}

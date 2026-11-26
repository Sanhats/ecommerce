import Link from "next/link";

export default function StoreFooter() {
  return <footer className="gluma-footer">
    <div className="gluma-footer-top">
      <div className="gluma-footer-brand"><Link className="gluma-footer-logo" href="/tienda">LUNORA <small>FASHION</small></Link><p>Moda femenina para todos los días, elegida en Tucumán.</p><a className="gluma-footer-email" href="mailto:hola@lunora.com">hola@lunora.com ↗</a></div>
      <div className="gluma-footer-column"><b>Explorá</b><Link href="/tienda/productos">Productos</Link><a href="/tienda#colecciones">Colecciones</a><a href="/tienda#nosotros">Nuestra mirada</a></div>
      <div className="gluma-footer-column"><b>Ayuda</b><a href="/tienda#contacto">Contacto</a><a href="#">Envíos y retiros</a><a href="#">Guía de talles</a></div>
      <div className="gluma-footer-column"><b>Seguinos</b><a href="#">Instagram ↗</a><a href="#">WhatsApp ↗</a><a href="#">Pinterest ↗</a></div>
    </div>
    <div className="gluma-footer-marquee" aria-hidden="true"><span>LUNORA · MODA FEMENINA · TUCUMÁN · PRIMAVERA / VERANO · LUNORA · MODA FEMENINA · TUCUMÁN · </span></div>
    <div className="gluma-footer-bottom"><small>© 2026 Lunora Fashion</small><small>Hecho para tu estilo cotidiano</small><a href="#inicio">Volver arriba ↑</a></div>
  </footer>;
}

import Link from "next/link";
import ProductImporter from "./product-importer";

export default function ProductImportPage() {
  return <main className="admin-shell"><div className="back-link"><Link href="/admin/products">← Volver al catálogo</Link></div><header className="admin-header"><span className="eyebrow">Catálogo</span><h1>Cargar catálogo</h1><p>Importá varios productos y sus variantes desde un archivo CSV.</p></header><ProductImporter /></main>;
}

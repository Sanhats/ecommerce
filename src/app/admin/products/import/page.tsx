import Link from "next/link";
import ProductImporter from "./product-importer";

export default function ProductImportPage() {
  return <main className="admin-shell"><div className="back-link"><Link href="/admin/products">← Productos</Link></div><header className="admin-header"><h1>Cargar catálogo</h1></header><ProductImporter /></main>;
}

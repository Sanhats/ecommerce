"use client";
import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

type CsvRow = Record<string, string>;
type ImportProduct = { name: string; slug?: string; description?: string; brand?: string; gender?: string; status?: string; category?: string; collections?: string[]; image_url?: string; variants: { sku?: string; price: string; compare_at_price?: string; stock_quantity?: string; size?: string; color?: string }[] };

function parseCsv(input: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [], value = "", quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"' && input[index + 1] === '"' && quoted) { value += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { row.push(value.trim()); value = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && input[index + 1] === "\n") index += 1; row.push(value.trim()); if (row.some(Boolean)) rows.push(row); row = []; value = ""; continue; }
    value += character;
  }
  if (value || row.length) { row.push(value.trim()); rows.push(row); }
  const headers = (rows.shift() || []).map(header => header.trim().toLowerCase());
  return rows.map(columns => headers.reduce<CsvRow>((result, header, index) => { result[header] = columns[index] || ""; return result; }, {}));
}

function groupRows(rows: CsvRow[]): ImportProduct[] {
  const grouped = new Map<string, ImportProduct>();
  rows.forEach(row => {
    const name = (row.name || "").trim();
    if (!name) return;
    const key = (row.slug || name).trim().toLowerCase();
    const current = grouped.get(key) || { name, slug: row.slug, description: row.description, brand: row.brand, gender: row.gender, status: row.status || "draft", category: row.category_slug || row.category, collections: (row.collection_slugs || row.collections || "").split("|").map(value => value.trim()).filter(Boolean), image_url: row.image_url, variants: [] };
    current.variants.push({ sku: row.sku, price: row.price, compare_at_price: row.compare_at_price, stock_quantity: row.stock_quantity, size: row.size, color: row.color });
    grouped.set(key, current);
  });
  return [...grouped.values()];
}

const template = "name,slug,description,brand,gender,status,category_slug,collection_slugs,price,compare_at_price,stock_quantity,size,color,sku,image_url\nVestido Aura,vestido-aura,Vestido midi de lino,Lunora,Mujer,active,vestidos,primavera-verano-2026|nuevos-ingresos,68900,,12,M,Crudo,,https://...";

export default function ProductImporter() {
  const [fileName, setFileName] = useState(""), [rows, setRows] = useState<CsvRow[]>([]), [message, setMessage] = useState(""), [loading, setLoading] = useState(false), [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const products = useMemo(() => groupRows(rows), [rows]);
  function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); setMessage(""); setResult(null); const reader = new FileReader(); reader.onload = () => setRows(parseCsv(String(reader.result || ""))); reader.readAsText(file, "UTF-8"); }
  async function importProducts() { setLoading(true); setMessage(""); setResult(null); const response = await fetch("/api/admin/products/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products }) }); const data = await response.json(); setLoading(false); if (!response.ok && !data.summary) { setMessage(data.error || "No se pudo importar el catálogo"); return; } setResult(data.summary); setMessage(data.errors?.length ? `Importación parcial: ${data.errors.length} fila(s) requieren revisión.` : "Catálogo importado correctamente."); }
  return <section className="import-layout"><div className="editor-card"><div className="editor-card-heading"><div><span className="eyebrow">Formato</span><h2>Prepará el CSV</h2></div><a className="text-button" href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`} download="plantilla-productos.csv">Descargar plantilla</a></div><p className="import-help">Cada fila representa una variante. Para cargar varios talles o colores del mismo producto, repetí el mismo <b>slug</b>. Separá varias colecciones con el símbolo <b>|</b>.</p><pre className="import-template">{template}</pre><label className="upload-drop">{fileName || "Seleccionar archivo CSV"}<input type="file" accept=".csv,text/csv" onChange={handleFile} /></label></div><div className="editor-card"><div className="editor-card-heading"><div><span className="eyebrow">Vista previa</span><h2>{products.length} productos agrupados</h2></div></div>{rows.length ? <div className="import-preview"><p>{rows.length} filas leídas · {products.reduce((total, product) => total + product.variants.length, 0)} variantes</p>{products.slice(0, 8).map(product => <div className="import-row" key={product.slug || product.name}><div><strong>{product.name}</strong><span>{product.category || "Sin categoría"} · {product.collections?.join(", ") || "Sin colección"}</span></div><b>{product.variants.length} variante(s)</b></div>)}</div> : <p className="notice">Seleccioná un CSV para revisar el catálogo antes de importarlo.</p>}{result && <p className="notice">Importados: {result.imported} · Con errores: {result.errors}</p>}{message && <p className="notice">{message}</p>}<div className="import-actions"><button className="button" onClick={importProducts} disabled={loading || !products.length}>{loading ? "Importando…" : "Importar catálogo"}</button><Link className="button secondary" href="/admin/products">Volver al catálogo</Link></div></div></section>;
}

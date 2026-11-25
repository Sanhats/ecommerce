"use client";
import { FormEvent, useState } from "react";

type VariantDraft = { size: string; color: string; price: string };

export default function ProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [message, setMessage] = useState(""), [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "", color: "", price: "" }]);
  const [generalImages, setGeneralImages] = useState<File[]>([]), [variantImages, setVariantImages] = useState<Record<number, File[]>>({});

  async function uploadImage(productId: string, file: File, variantId?: string) {
    const form = new FormData();
    form.append("file", file);
    if (variantId) form.append("variant_id", variantId);
    await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: form });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, variants }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "No se pudo crear el producto"); setLoading(false); return; }
    await Promise.all(generalImages.map(file => uploadImage(data.product.id, file)));
    await Promise.all(Object.entries(variantImages).flatMap(([index, files]) => files.map(file => uploadImage(data.product.id, file, data.variants[Number(index)]?.id))));
    setLoading(false);
    setMessage("Producto creado correctamente");
    form.reset();
    setVariants([{ size: "", color: "", price: "" }]);
    setGeneralImages([]);
    setVariantImages({});
  }

  function updateVariant(index: number, field: keyof VariantDraft, value: string) { setVariants(current => current.map((variant, currentIndex) => currentIndex === index ? { ...variant, [field]: value } : variant)); }
  function addVariantFiles(index: number, files: FileList | null) { if (files) setVariantImages(current => ({ ...current, [index]: Array.from(files) })); }

  return <form className="product-editor product-editor-layout" onSubmit={submit}>
    <div className="product-editor-main">
      <section className="editor-card product-form">
        <div className="editor-card-heading"><div><span className="eyebrow">Información</span><h2>Información básica</h2></div><span className="editor-help">Los campos con * son obligatorios</span></div>
        <div className="form-row"><label>Marca<input name="brand" placeholder="Ej. Lunora" /></label><label>Género<select name="gender" defaultValue="Mujer"><option value="Mujer">Mujer</option><option value="Hombre">Hombre</option><option value="Unisex">Unisex</option></select></label></div>
        <div className="form-row"><label>Categoría<select name="category_id" defaultValue=""><option value="">Sin categoría</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Nombre del producto *<input name="name" required placeholder="Ej. Vestido Aura" /></label></div>
        <label>Descripción<textarea name="description" rows={7} placeholder="Describí el producto, sus materiales y calce." /></label>
      </section>
      <section className="editor-card variants-editor">
        <div className="editor-card-heading"><div><span className="eyebrow">Comercial</span><h2>Variantes</h2></div><span className="editor-help">SKU generado automáticamente</span></div>
        {variants.map((variant, index) => <div className="variant-card" key={index}><div className="variant-title"><strong>Variante {index + 1}</strong><span>SKU automático</span></div><div className="variant-fields"><label>Talle<input value={variant.size} onChange={event => updateVariant(index, "size", event.target.value)} placeholder="M" /></label><label>Color<input value={variant.color} onChange={event => updateVariant(index, "color", event.target.value)} placeholder="Crudo" /></label><label>Precio *<input value={variant.price} onChange={event => updateVariant(index, "price", event.target.value)} required type="number" min="0" step="0.01" placeholder="0" /></label></div><label className="variant-upload">Imágenes de esta variante<input type="file" accept="image/*" multiple onChange={event => addVariantFiles(index, event.target.files)} /></label>{variantImages[index]?.length ? <div className="file-list">{variantImages[index].map(file => <div key={file.name}><span>{file.name}</span><span>{Math.round(file.size / 1024)} KB</span></div>)}</div> : null}</div>)}
        <button type="button" className="button secondary" onClick={() => setVariants(current => [...current, { size: "", color: "", price: "" }])}>+ Agregar variante</button>
      </section>
    </div>
    <aside className="product-editor-side">
      <section className="editor-card product-form"><div className="editor-card-heading"><div><span className="eyebrow">Publicación</span><h2>Visibilidad</h2></div></div><label>Estado<select name="status" defaultValue="draft"><option value="draft">Borrador</option><option value="active">Publicado</option></select></label><p className="editor-help">Los borradores no se muestran en la tienda pública.</p></section>
      <section className="editor-card product-form"><div className="editor-card-heading"><div><span className="eyebrow">Multimedia</span><h2>Imagen del producto</h2></div></div><label className="upload-drop">Elegí una o varias imágenes<input type="file" accept="image/*" multiple onChange={event => setGeneralImages(Array.from(event.target.files || []))} /></label>{generalImages.length ? <div className="file-list">{generalImages.map(file => <div key={file.name}><span>{file.name}</span><span>{Math.round(file.size / 1024)} KB</span></div>)}</div> : <p className="editor-help">La primera imagen será la portada del producto.</p>}</section>
    </aside>
    <div className="product-save-bar">{message && <p className="notice">{message}</p>}<button className="button" disabled={loading}>{loading ? "Guardando producto…" : "Guardar producto"}</button></div>
  </form>;
}

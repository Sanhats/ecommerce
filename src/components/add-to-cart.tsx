"use client";
import { useCart } from "./cart-provider";
export default function AddToCart({ variantId, productName, sku, price }: { variantId: string; productName: string; sku: string; price: number }) { const { add } = useCart(); return <button className="button" onClick={() => add({ variantId, productName, sku, price, quantity: 1 })}>Agregar al carrito</button>; }

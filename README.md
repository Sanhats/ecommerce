# Showroom Store

Base para una tienda online pública y un panel de gestión construido con Next.js y Supabase.

## Inicio

1. Copiar `.env.example` a `.env.local` y completar las credenciales de Supabase.
2. Instalar dependencias con `npm install`.
3. Ejecutar `npm run dev`.

## Próximos módulos

El modelo inicial está en `supabase/migrations/0001_initial_schema.sql` e incluye:

- Tiendas, perfiles, miembros y roles.
- Catálogo, categorías, imágenes, opciones, valores y variantes con SKU.
- Locales físicos, inventario por ubicación y movimientos de stock.
- Clientes, direcciones, pedidos y detalle de pedidos.
- Estados de pago, envío/retiro y promociones.

La siguiente fase es conectar autenticación, crear el dashboard de administración y construir catálogo, carrito y checkout sobre este modelo.

Para cargar la tienda pública con contenido realista de moda femenina primavera/verano, ejecutar `supabase/seed_catalogo_femenino.sql` desde el SQL Editor de Supabase. El script crea categorías, productos, imágenes públicas, variantes y las colecciones `Primavera Verano 2026`, `Nuevos ingresos`, `Esenciales de verano` y `Looks de fiesta`.

El script archiva los productos demo anteriores para que no aparezcan en la tienda pública, normaliza la categoría de accesorios y conserva los movimientos de stock históricos.

Desde `/admin/products/import` también se puede cargar un catálogo en CSV. La plantilla incluye nombre, slug, descripción, marca, género, estado, categoría, colecciones, precio, talle, color, SKU e imagen opcional. Cada fila representa una variante; para repetir un producto se utiliza el mismo slug.

## Seguridad

El acceso a `/admin` requiere Supabase Auth. Después de ejecutar `0002_security_policies.sql`, hay que crear el usuario administrador en Supabase Auth y asociarlo a una fila de `store_members`.

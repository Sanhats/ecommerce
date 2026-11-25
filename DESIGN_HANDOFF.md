# Handoff para diseño — Lunora Fashion

## Objetivo

Mejorar la tienda pública de moda femenina para que tenga una experiencia editorial, atractiva y clara, manteniendo el flujo de compra actual y sin modificar la lógica operativa del administrador.

## Stack y límites

- Next.js 15 con App Router.
- Supabase para catálogo, imágenes, colecciones, clientes, pedidos e inventario.
- La lógica de ventas, stock, carrito y pedidos debe conservarse.
- No incluir credenciales ni modificar `.env.local`.
- Las integraciones de pagos y envíos todavía no están implementadas.

## Rutas públicas disponibles

- `/tienda`: portada editorial, categorías y colecciones.
- `/tienda/productos`: catálogo completo con búsqueda y filtros.
- `/tienda/categoria/[slug]`: productos por categoría.
- `/tienda/coleccion/[slug]`: productos por colección.
- `/tienda/[slug]`: detalle de producto y selección de variantes.
- `/carrito`: carrito y checkout actual.

## Dirección visual

- Moda femenina primavera/verano para un showroom en Tucumán, Argentina.
- Estética editorial, aireada y premium.
- Hero con imagen protagonista, tipografía elegante y llamadas a la acción simples.
- Cards de categorías y colecciones con imágenes grandes.
- Animaciones suaves de entrada, hover y transición, sin sobrecargar la navegación.
- Diseño responsive para móvil, tablet y escritorio.
- Mantener una jerarquía clara y evitar textos o botones redundantes.

## Datos existentes

Categorías principales:

- Vestidos
- Tops
- Pantalones
- Accesorios

Colecciones:

- Primavera Verano 2026
- Nuevos ingresos
- Esenciales de verano
- Looks de fiesta

## Puntos a revisar

- Mejorar la carga y presentación de imágenes de producto.
- Diseñar estados vacíos, carga y error para catálogo y detalle.
- Mantener accesibles los filtros, variantes, precio y botón de compra.
- Validar que ningún enlace genere rutas duplicadas como `/categoria/categoria/...`.
- No mostrar productos directamente en la portada principal; deben aparecer dentro de categorías, colecciones o catálogo completo.

## Entrega esperada

- Componentes visuales reutilizables.
- Estilos responsive.
- Animaciones respetando `prefers-reduced-motion`.
- Capturas o preview de las pantallas principales.
- Cambios separados de la lógica de Supabase y del panel administrativo.

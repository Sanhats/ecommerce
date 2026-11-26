function Block({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`ui-skeleton ${className}`} />;
}

function TableRows({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return <div className={`skeleton-table-body columns-${columns}`}>{Array.from({ length: rows }, (_, row) => <div className="skeleton-table-row" key={row}>{Array.from({ length: columns }, (_, column) => <Block className={`skeleton-cell skeleton-cell-${column + 1}`} key={column} />)}</div>)}</div>;
}

export function AdminDashboardSkeleton() {
  return <main className="admin-shell loading-shell"><div className="skeleton-stats">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-stat" key={index}><Block className="skeleton-line short" /><Block className="skeleton-number" /><Block className="skeleton-line" /></div>)}</div><div className="skeleton-dashboard-grid"><div className="skeleton-card"><Block className="skeleton-line medium" /><TableRows rows={4} columns={2} /></div><div className="skeleton-card"><Block className="skeleton-line medium" /><TableRows rows={4} columns={2} /></div></div></main>;
}

export function AdminTableSkeleton({ columns = 6, showHeading = true }: { columns?: number; showHeading?: boolean }) {
  return <main className="admin-shell loading-shell">{showHeading && <div className="skeleton-heading"><Block className="skeleton-title" /></div>}<div className="skeleton-actions"><Block className="skeleton-button wide" /><Block className="skeleton-button" /></div><div className="skeleton-card skeleton-table-card"><div className="skeleton-filters"><Block className="skeleton-input" /><Block className="skeleton-input small" /></div><TableRows columns={columns} /></div></main>;
}

export function AdminProductEditorSkeleton({ edit = false }: { edit?: boolean }) {
  return <main className="admin-shell loading-shell">{edit && <div className="skeleton-heading"><Block className="skeleton-title" /></div>}{edit && <div className="skeleton-controls"><Block className="skeleton-input" /><Block className="skeleton-input" /></div>}<div className="skeleton-editor-layout"><div className="skeleton-editor-main"><div className="skeleton-card"><Block className="skeleton-line medium" /><div className="skeleton-form-grid"><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /></div><Block className="skeleton-textarea" /></div><div className="skeleton-card"><Block className="skeleton-line medium" /><div className="skeleton-variant"><Block className="skeleton-line" /><div className="skeleton-form-grid four"><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /></div><Block className="skeleton-upload small" /></div><Block className="skeleton-button" /></div></div><div className="skeleton-editor-side"><div className="skeleton-card"><Block className="skeleton-line short" /><Block className="skeleton-input" /></div><div className="skeleton-card image-card"><Block className="skeleton-line medium" /><Block className="skeleton-image-drop" /></div></div></div></main>;
}

export function AdminSaleSkeleton() {
  return <main className="admin-shell loading-shell"><div className="skeleton-sale-layout"><div className="skeleton-card"><Block className="skeleton-line short" /><Block className="skeleton-input" /><TableRows rows={3} columns={2} /></div><div className="skeleton-card"><Block className="skeleton-line short" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-textarea small" /><Block className="skeleton-button wide" /></div></div></main>;
}

export function AdminOrderDetailSkeleton() {
  return <main className="admin-shell loading-shell"><Block className="skeleton-line back" /><div className="skeleton-heading"><Block className="skeleton-line short" /><Block className="skeleton-title" /></div><div className="skeleton-order-layout"><div className="skeleton-card"><Block className="skeleton-line medium" /><TableRows rows={5} columns={3} /></div><div className="skeleton-card"><Block className="skeleton-line medium" /><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-textarea small" /></div></div></main>;
}

export function AdminImportSkeleton() {
  return <main className="admin-shell loading-shell"><Block className="skeleton-line back" /><div className="skeleton-heading"><Block className="skeleton-title" /></div><div className="skeleton-import-layout"><div className="skeleton-card"><Block className="skeleton-line medium" /><Block className="skeleton-textarea" /><Block className="skeleton-upload" /></div><div className="skeleton-card"><Block className="skeleton-line medium" /><TableRows rows={5} columns={2} /><Block className="skeleton-button" /></div></div></main>;
}

export function StoreHomeSkeleton() {
  return <main className="store-shell loading-store"><div className="skeleton-store-header"><Block className="skeleton-logo" /><Block className="skeleton-nav" /><Block className="skeleton-icons" /></div><div className="skeleton-store-hero"><Block className="skeleton-hero-copy" /><Block className="skeleton-hero-image" /></div><div className="skeleton-store-section"><Block className="skeleton-section-title" /><div className="skeleton-category-grid">{Array.from({ length: 4 }, (_, index) => <Block className="skeleton-category" key={index} />)}</div></div><div className="skeleton-store-banner"><Block className="skeleton-banner-copy" /></div><div className="skeleton-store-section"><Block className="skeleton-section-title" /><div className="skeleton-product-grid">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-product" key={index}><Block className="skeleton-product-image" /><Block className="skeleton-line" /><Block className="skeleton-line short" /></div>)}</div></div></main>;
}

export function StoreCatalogSkeleton() {
  return <main className="store-shell loading-store"><div className="skeleton-catalog-header"><Block className="skeleton-logo" /><Block className="skeleton-line short" /><Block className="skeleton-section-title" /></div><div className="skeleton-catalog-filters"><Block className="skeleton-input" /><Block className="skeleton-input" /><Block className="skeleton-input" /></div><div className="skeleton-product-grid large">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-product" key={index}><Block className="skeleton-product-image" /><Block className="skeleton-line" /><Block className="skeleton-line short" /></div>)}</div></main>;
}

export function StoreProductSkeleton() {
  return <main className="store-shell loading-store"><div className="skeleton-store-header"><Block className="skeleton-logo" /><Block className="skeleton-nav" /><Block className="skeleton-icons" /></div><div className="skeleton-product-detail"><div className="skeleton-product-gallery"><Block className="skeleton-detail-image" /><div className="skeleton-thumbnails">{Array.from({ length: 4 }, (_, index) => <Block className="skeleton-thumb" key={index} />)}</div></div><div className="skeleton-purchase"><Block className="skeleton-line short" /><Block className="skeleton-detail-title" /><Block className="skeleton-line medium" /><Block className="skeleton-price" /><Block className="skeleton-textarea small" /><Block className="skeleton-input" /><Block className="skeleton-button wide" /></div></div></main>;
}

export function CartSkeleton() {
  return <main className="store-shell loading-store"><div className="skeleton-catalog-header"><Block className="skeleton-logo" /><Block className="skeleton-section-title" /></div><div className="skeleton-cart-layout"><div className="skeleton-card"><Block className="skeleton-line medium" /><TableRows rows={3} columns={2} /></div><div className="skeleton-card"><Block className="skeleton-line medium" /><Block className="skeleton-line" /><Block className="skeleton-line" /><Block className="skeleton-button wide" /></div></div></main>;
}

export function RootSkeleton() {
  return <main className="root-loading"><Block className="skeleton-logo" /><Block className="skeleton-detail-title" /><Block className="skeleton-textarea small" /><Block className="skeleton-button" /></main>;
}

import productSheet from '../../assets/product-photography.png'

export function ProductImage({ index, imageUrl, className = '', alt }: { index: number; imageUrl?: string | null; className?: string; alt: string }) {
  return (
    <span
      className={`product-image${imageUrl ? ' product-image--uploaded' : ` product-image--${index}`} ${className}`}
      style={{ backgroundImage: `url(${imageUrl ?? productSheet})` }}
      role="img"
      aria-label={alt}
    />
  )
}

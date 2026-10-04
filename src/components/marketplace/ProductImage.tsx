import productSheet from '../../assets/product-photography.png'

export function ProductImage({ index, className = '', alt }: { index: number; className?: string; alt: string }) {
  return (
    <span
      className={`product-image product-image--${index} ${className}`}
      style={{ backgroundImage: `url(${productSheet})` }}
      role="img"
      aria-label={alt}
    />
  )
}

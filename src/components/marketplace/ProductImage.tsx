import productSheet from '../../assets/product-photography.png'

export function ProductImage({ index, imageUrl, className = '', alt }: { index: number; imageUrl?: string | null; className?: string; alt: string }) {
  if (imageUrl) {
    return <img className={`product-image product-image--uploaded ${className}`} src={imageUrl} alt={alt} />
  }

  return (
    <span
      className={`product-image product-image--${index} ${className}`}
      style={{ backgroundImage: `url(${productSheet})` }}
      role="img"
      aria-label={alt}
    />
  )
}

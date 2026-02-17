interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ imageUrl, alt, className = '' }: ProductImageProps) {
  const src = imageUrl && imageUrl.trim() !== '' 
    ? imageUrl 
    : '/assets/generated/product-placeholder.dim_800x800.png';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/assets/generated/product-placeholder.dim_800x800.png';
      }}
    />
  );
}

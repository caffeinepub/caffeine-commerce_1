interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ imageUrl, alt, className = '' }: ProductImageProps) {
  // Handle both remote URLs and Data URLs
  const src = imageUrl && imageUrl.trim() !== '' 
    ? imageUrl 
    : '/assets/generated/product-placeholder.dim_800x800.png';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        // Only set fallback if not already showing it
        if (target.src !== window.location.origin + '/assets/generated/product-placeholder.dim_800x800.png') {
          target.src = '/assets/generated/product-placeholder.dim_800x800.png';
        }
      }}
    />
  );
}

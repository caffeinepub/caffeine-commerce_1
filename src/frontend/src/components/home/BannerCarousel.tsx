import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const banners = [
  '/assets/generated/home-banner-1.dim_1600x600.png',
  '/assets/generated/home-banner-2.dim_1600x600.png',
];

export default function BannerCarousel() {
  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg">
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}

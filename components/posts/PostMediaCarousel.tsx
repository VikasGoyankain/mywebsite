import React, { useCallback, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import CarouselArrow from './CarouselArrow';

interface MediaItem {
  url: string;
  caption?: string;
  id?: string | number;
  type?: string;
}

interface PostMediaCarouselProps {
  media: MediaItem[];
}

export const PostMediaCarousel: React.FC<PostMediaCarouselProps> = ({ media }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Update arrow visibility
  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on('select', updateScrollButtons);
    emblaApi.on('reInit', updateScrollButtons);
    return () => {
      emblaApi.off('select', updateScrollButtons);
      emblaApi.off('reInit', updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  if (!media || media.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto h-64 sm:h-96 flex items-center justify-center relative">
      <CarouselArrow direction="left" show={canScrollPrev} onClick={() => emblaApi && emblaApi.scrollPrev()} />
      <CarouselArrow direction="right" show={canScrollNext} onClick={() => emblaApi && emblaApi.scrollNext()} />
      <div className="embla w-full h-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {media.map((item, idx) => (
            <div
              className="embla__slide flex-shrink-0 w-full h-full flex items-center justify-center"
              style={{ minWidth: '100%' }}
              key={item.id || idx}
            >
              <img
                src={item.url}
                alt={item.caption || `Media ${idx + 1}`}
                className="w-full h-full object-contain bg-white"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostMediaCarousel;

import './Carousel.scss';
import { useCarousel, useCarouselParams } from './useCarousel';

export interface CarouselProps extends useCarouselParams {
  gap?: number;
  peek?: number;
  height?: string;
  arrows?: boolean;
}

export const Carousel = ({
  children,
  slidesToShow = 5,
  gap = 16,
  peek = 24,
  height = '260px',
  loop = true,
  autoplayMs = 0,
  pauseOnHover = true,
  arrows = true,
  responsive,
}: CarouselProps) => {
  const {
    onEnter,
    onLeave,
    handlePrevious,
    handleNext,
    count,
    show,
    index,
    viewportW,
    viewportRef,
    trackRef,
    slides,
  } = useCarousel({
    children,
    slidesToShow,
    loop,
    autoplayMs,
    pauseOnHover,
    responsive,
  });

  const slideWidthPx = show > 0 ? (viewportW - (show - 1) * gap) / show : 0;
  const stepPx = slideWidthPx + gap;
  const trackWidthPx = count > 0 ? count * slideWidthPx + (count - 1) * gap : 0;
  const translatePx = -index * stepPx;

  return (
    <div
      className="carousel"
      style={
        {
          ['--gap']: `${gap}px`,
          ['--peek']: `${peek}px`,
          height,
        } as React.CSSProperties
      }
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {arrows && count > show && (
        <>
          <button
            className="carousel__nav carousel__nav--prev"
            onClick={handlePrevious}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className="carousel__nav carousel__nav--next"
            onClick={handleNext}
            aria-label="Siguiente"
          >
            ›
          </button>
        </>
      )}

      <div className="carousel__viewport" ref={viewportRef}>
        <div
          ref={trackRef}
          className="carousel__track"
          style={{
            width: `${trackWidthPx}px`,
            transform: `translateX(${translatePx}px)`,
          }}
        >
          {slides.map((child, i) => (
            <div
              key={`slide-${i}`}
              className="carousel__slide"
              style={{ width: `${slideWidthPx}px` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

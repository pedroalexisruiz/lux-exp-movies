import { useSwipeDrag } from '../../hooks/useSwipDrag';
import './Carousel.scss';
import { useCarousel, useCarouselParams } from './useCarousel';

export interface CarouselProps extends useCarouselParams {
  gap?: number;
  peek?: number;
  height?: string;
  arrows?: boolean;
}

const SLIDES_PER_VIEWPORT = [
  { max: 375, slidesToShow: 1 },
  { min: 376, max: 479, slidesToShow: 2 },
  { min: 480, max: 767, slidesToShow: 3 },
  { min: 768, max: 919, slidesToShow: 5 },
  { min: 920, max: 1239, slidesToShow: 5 },
  { min: 1240, slidesToShow: 6 },
];

export const Carousel = ({
  children,
  slidesToShow = 5,
  gap = 16,
  peek = 24,
  height = '260px',
  loop = true,
  autoplayMs = 3000,
  pauseOnHover = true,
  arrows = true,
  responsive = SLIDES_PER_VIEWPORT,
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

  const { isDragging, dragX, dragBind } = useSwipeDrag({
    stepPx,
    onNext: handleNext,
    onPrev: handlePrevious,
    axis: 'x',
    lockThresholdPx: 8,
    distanceThresholdRatio: 0.25,
    flickVelocityPxPerMs: 0.05,
    enabled: count > show,
    rtl: false,
  });

  const translatePx = -index * stepPx + dragX;
  return (
    <div
      className={`carousel ${isDragging ? 'carousel--dragging' : ''}`}
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

      <div className="carousel__viewport" ref={viewportRef} {...dragBind}>
        <div
          ref={trackRef}
          className="carousel__track"
          style={{ transform: `translateX(${translatePx}px)` }}
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

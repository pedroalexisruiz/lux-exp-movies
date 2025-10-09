import { useEffect, useMemo, useRef, useState } from 'react';

export interface useCarouselParams {
  children: React.ReactNode[];
  slidesToShow?: number;
  loop?: boolean;
  autoplayMs?: number;
  pauseOnHover?: boolean;
  responsive?: Array<{ min?: number; max?: number; slidesToShow: number }>;
}

export const useCarousel = ({
  children,
  slidesToShow = 5,
  loop = true,
  autoplayMs = 0,
  pauseOnHover = true,
  responsive,
}: useCarouselParams) => {
  const slides = useMemo(() => Array.from(children), [children]);
  const count = slides.length;

  const [computedShow, setComputedShow] = useState(slidesToShow);
  const [viewportW, setViewportW] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const hovering = useRef(false);

  const show = computedShow;
  const maxIndex = Math.max(0, count - show);

  const [index, setIndex] = useState(0);

  const goToSlide = (i: number) => {
    if (!loop) {
      setIndex(Math.max(0, Math.min(i, maxIndex)));
      return;
    }
    if (i < 0) setIndex(maxIndex);
    else if (i > maxIndex) setIndex(0);
    else setIndex(i);
  };

  const handleNext = () => goToSlide(index + 1);
  const handlePrevious = () => goToSlide(index - 1);

  const onEnter = () => {
    if (pauseOnHover) hovering.current = true;
  };
  const onLeave = () => {
    if (pauseOnHover) hovering.current = false;
  };

  useEffect(() => {
    const measure = () => {
      if (responsive?.length) {
        const w = window.innerWidth;
        const found = responsive.find(
          (breakpoint) => (breakpoint.min ?? 0) <= w && (breakpoint.max ?? Infinity) >= w,
        );
        setComputedShow(found?.slidesToShow ?? slidesToShow);
      } else {
        setComputedShow(slidesToShow);
      }
      setViewportW(viewportRef.current?.clientWidth ?? 0);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [responsive, slidesToShow]);

  useEffect(() => {
    if (!autoplayMs || autoplayMs <= 0 || count <= show) return;
    const tick = () => {
      if (!hovering.current) handleNext();
    };
    timer.current = window.setInterval(tick, autoplayMs);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [autoplayMs, count, show, index]);

  return {
    count,
    show,
    slides,
    viewportRef,
    trackRef,
    index,
    viewportW,
    loop,
    handlePrevious,
    handleNext,
    onEnter,
    onLeave,
  };
};

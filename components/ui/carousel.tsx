'use client';

import { cn } from '@/lib/utils';
import type { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: EmblaOptionsType;
  plugins?: Parameters<typeof useEmblaCarousel>[1];
  isScale?: boolean;
}

interface CarouselContextType {
  emblaApi: EmblaCarouselType | undefined;
  emblaThumbsApi: EmblaCarouselType | undefined;
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaThumbsRef: ReturnType<typeof useEmblaCarousel>[0];
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
  scrollProgress: number;
  selectedSnap: number;
  snapCount: number;
  isScale: boolean;
  slidesArr: string[];
  setSlidesArr: React.Dispatch<React.SetStateAction<string[]>>;
  onThumbClick: (index: number) => void;
  carouselId: string;
  orientation: 'vertical' | 'horizontal';
  direction: 'ltr' | 'rtl' | undefined;
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined);

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a Carousel component');
  return context;
};

const TWEEN_FACTOR_BASE = 0.52;
const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  ({ children, options = {}, plugins = [], className, isScale = false, dir, ...props }, ref) => {
    const carouselId = useId();
    const [slidesArr, setSlidesArr] = useState<string[]>([]);
    const orientation = options.axis === 'y' ? 'vertical' : 'horizontal';
    const direction = options.direction ?? (dir as 'ltr' | 'rtl' | undefined);

    const [emblaRef, emblaApi] = useEmblaCarousel(
      { ...options, axis: orientation === 'vertical' ? 'y' : 'x', direction },
      plugins
    );
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
      containScroll: 'keepSnaps',
      dragFree: true,
      axis: orientation === 'vertical' ? 'y' : 'x',
      direction,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [snapCount, setSnapCount] = useState(0);

    const onPrevButtonClick = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const onNextButtonClick = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const onDotButtonClick = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
    const onThumbClick = useCallback(
      (index: number) => { if (emblaApi && emblaThumbsApi) emblaApi.scrollTo(index); },
      [emblaApi, emblaThumbsApi]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!emblaApi) return;
        if (event.key === 'ArrowLeft' && orientation === 'horizontal') {
          event.preventDefault();
          direction === 'rtl' ? onNextButtonClick() : onPrevButtonClick();
        } else if (event.key === 'ArrowRight' && orientation === 'horizontal') {
          event.preventDefault();
          direction === 'rtl' ? onPrevButtonClick() : onNextButtonClick();
        }
      },
      [emblaApi, orientation, direction, onPrevButtonClick, onNextButtonClick]
    );

    const onSelect = useCallback(() => {
      if (!emblaApi) return;
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
      emblaThumbsApi?.scrollTo(emblaApi.selectedScrollSnap());
    }, [emblaApi, emblaThumbsApi]);

    const onScroll = useCallback((api: EmblaCarouselType) => {
      setScrollProgress(Math.max(0, Math.min(1, api.scrollProgress())) * 100);
    }, []);

    const tweenFactor = useRef(0);
    const tweenNodes = useRef<HTMLElement[]>([]);

    const setTweenNodes = useCallback((api: EmblaCarouselType) => {
      if (!isScale) return;
      tweenNodes.current = api.slideNodes().map(
        (n) => n.querySelector('.slider_content')
      ) as HTMLElement[];
    }, [isScale]);

    const setTweenFactor = useCallback((api: EmblaCarouselType) => {
      if (!isScale) return;
      tweenFactor.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length;
    }, [isScale]);

    const tweenScale = useCallback((api: EmblaCarouselType, eventName?: EmblaEventType) => {
      if (!isScale) return;
      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const slidesInView = api.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];
        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }
          const scale = numberWithinRange(1 - Math.abs(diffToTarget * tweenFactor.current), 0, 1).toString();
          const node = tweenNodes.current[slideIndex];
          if (node) node.style.transform = `scale(${scale})`;
        });
      });
    }, [isScale]);

    useEffect(() => {
      if (!emblaApi) return;
      setScrollSnaps(emblaApi.scrollSnapList());
      setSnapCount(emblaApi.scrollSnapList().length);
      onSelect();
      onScroll(emblaApi);
      emblaApi.on('reInit', onSelect).on('select', onSelect).on('reInit', onScroll).on('scroll', onScroll);
      if (isScale) {
        setTweenNodes(emblaApi);
        setTweenFactor(emblaApi);
        tweenScale(emblaApi);
        emblaApi
          .on('reInit', setTweenNodes)
          .on('reInit', setTweenFactor)
          .on('reInit', tweenScale)
          .on('scroll', tweenScale);
      }
    }, [emblaApi, onSelect, onScroll, isScale, setTweenNodes, setTweenFactor, tweenScale]);

    return (
      <CarouselContext.Provider value={{
        emblaApi, emblaThumbsApi, emblaRef, emblaThumbsRef,
        prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick,
        selectedIndex, scrollSnaps, onDotButtonClick, scrollProgress,
        selectedSnap: selectedIndex, snapCount, isScale, slidesArr, setSlidesArr,
        onThumbClick, carouselId, orientation, direction, handleKeyDown,
      }}>
        <div
          ref={ref}
          tabIndex={0}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative w-full focus:outline-hidden', className)}
          dir={direction}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

export const SliderContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { emblaRef, orientation } = useCarousel();
    return (
      <div ref={emblaRef} className='overflow-hidden' {...props}>
        <div
          ref={ref}
          className={cn('flex', orientation === 'vertical' ? 'flex-col' : 'flex-row', className)}
          style={{ touchAction: 'pan-y pinch-zoom' }}
        >
          {children}
        </div>
      </div>
    );
  }
);
SliderContainer.displayName = 'SliderContainer';

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  thumbnailSrc?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ children, className, thumbnailSrc, ...props }, ref) => {
    const { isScale, setSlidesArr } = useCarousel();
    useEffect(() => {
      if (thumbnailSrc) {
        setSlidesArr((prev) => prev.includes(thumbnailSrc) ? prev : [...prev, thumbnailSrc]);
      }
    }, [thumbnailSrc, setSlidesArr]);
    return (
      <div ref={ref} className={cn('min-w-0 shrink-0 grow-0', className)} {...props}>
        {isScale ? <div className='slider_content'>{children}</div> : children}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export const SliderPrevButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    const { onPrevButtonClick, prevBtnDisabled } = useCarousel();
    return (
      <button ref={ref} type='button' onClick={onPrevButtonClick} disabled={prevBtnDisabled}
        className={cn('', className)} {...props}>
        {children}
      </button>
    );
  }
);
SliderPrevButton.displayName = 'SliderPrevButton';

export const SliderNextButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    const { onNextButtonClick, nextBtnDisabled } = useCarousel();
    return (
      <button ref={ref} type='button' onClick={onNextButtonClick} disabled={nextBtnDisabled}
        className={cn('', className)} {...props}>
        {children}
      </button>
    );
  }
);
SliderNextButton.displayName = 'SliderNextButton';

export const SliderDotButton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { activeClass?: string }>(
  ({ className, activeClass, ...props }, ref) => {
    const { selectedIndex, scrollSnaps, orientation, onDotButtonClick, carouselId } = useCarousel();
    return (
      <div ref={ref} className={cn('flex gap-2', className)} {...props}>
        {scrollSnaps.map((_, index) => (
          <button key={`${carouselId}-dot-${index}`} type='button' onClick={() => onDotButtonClick(index)}
            className={cn('relative inline-flex p-0 m-0', orientation === 'vertical' ? 'h-6 w-1' : 'w-6 h-1')}>
            <div className={cn('bg-neutral-500/40 rounded-full', orientation === 'vertical' ? 'h-6 w-1' : 'w-6 h-1')} />
            {index === selectedIndex && (
              <AnimatePresence mode='wait'>
                <motion.div
                  transition={{ layout: { duration: 0.4, ease: 'easeInOut', delay: 0.04 } }}
                  layoutId={`hover-${carouselId}`}
                  className={cn(
                    'absolute z-10 w-full h-full left-0 top-0 rounded-full',
                    orientation === 'vertical' ? 'h-6 w-1' : 'w-6 h-1',
                    activeClass ?? 'bg-white'
                  )}
                />
              </AnimatePresence>
            )}
          </button>
        ))}
      </div>
    );
  }
);
SliderDotButton.displayName = 'SliderDotButton';

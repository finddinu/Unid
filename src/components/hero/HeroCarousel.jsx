import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHeroCarousel } from "../../hooks/useHeroCarousel";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import { useResponsiveVideoSource } from "../../hooks/useResponsiveVideoSource";

const carouselIcons = {
  play: "/assets/icons/play.svg",
  pause: "/assets/icons/pause.svg",
  expand: "/assets/icons/Expand.svg",
  minimize: "/assets/icons/Minimize.svg"
};

function ControlIcon({ src }) {
  return <img src={src} alt="" className="h-5 w-5 sm:h-6 sm:w-6 brightness-0 invert" aria-hidden="true" />;
}

function SlideVideo({ slide, active }) {
  const videoRef = useRef(null);
  const { src } = useResponsiveVideoSource(slide.desktopSrc, slide.mobileSrc);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setReady(video.readyState >= 2);

    if (!active) {
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }, [active, src]);

  return (
    <>
      <video
        key={src}
        ref={videoRef}
        src={src}
        className={`hero-carousel__slide-video pointer-events-none block h-full w-full bg-black object-cover ${ready ? "is-ready" : ""}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        draggable={false}
        aria-label={slide.label}
        onLoadedData={() => setReady(true)}
      />
      <div className={`hero-carousel__slide-loader ${ready ? "is-hidden" : ""}`} aria-hidden="true" />
    </>
  );
}

export default function HeroCarousel({
  slides,
  isFullscreen = false,
  onEnterFullscreen,
  onExitFullscreen
}) {
  const { reduceMotion } = useRevealMotion();
  const [isFullscreenIntent, setIsFullscreenIntent] = useState(isFullscreen);
  const {
    containerRef,
    trackX,
    virtualIndex,
    activeIndex,
    paused,
    autoplayProgress,
    extendedIndices,
    togglePaused,
    goToIndex,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
    onFocus,
    onBlur
  } = useHeroCarousel(slides.length);

  const renderedSlides = useMemo(
    () =>
      extendedIndices.map((index, extendedIndex) => ({
        key: `${slides[index].id}-${extendedIndex}`,
        slide: slides[index],
        sourceIndex: index,
        extendedIndex
      })),
    [extendedIndices, slides]
  );

  useEffect(() => {
    setIsFullscreenIntent(isFullscreen);
  }, [isFullscreen]);

  const handleFullscreenToggle = () => {
    if (isFullscreenIntent) {
      setIsFullscreenIntent(false);
      onExitFullscreen?.();
      return;
    }

    setIsFullscreenIntent(true);
    onEnterFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="hero-carousel relative h-full w-full overflow-hidden"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label="Featured work carousel"
      role="region"
    >
      <motion.div
        className="flex h-full will-change-transform"
        style={{
          x: trackX
        }}
      >
        {renderedSlides.map(({ key, slide, sourceIndex, extendedIndex }) => (
          <div
            key={key}
            className="relative h-full w-full min-w-full flex-[0_0_100%] overflow-hidden bg-black"
          >
            <SlideVideo
              slide={slide}
              active={extendedIndex === virtualIndex && sourceIndex === activeIndex}
            />
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={
          reduceMotion
            ? false
            : { opacity: 0.001, x: 20, y: 10 }
        }
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.42 }
        }
        className="hero-carousel__controls absolute bottom-5 right-4 z-10 sm:bottom-7 sm:right-6 lg:bottom-8 lg:right-8"
      >
        <div
          data-carousel-control="true"
          onPointerDown={(event) => event.stopPropagation()}
          className="hero-carousel__controls-shell flex min-h-[52px] items-center gap-4 rounded-full border border-white/10 bg-black/22 px-5 py-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.16)] backdrop-blur-[24px] sm:min-h-[56px] sm:px-5.5 lg:min-h-[60px] lg:px-6 cursor-default"
        >
          <button
            type="button"
            data-carousel-control="true"
            onClick={togglePaused}
            className="hero-carousel__pause-button flex h-12 w-12 items-center justify-center rounded-full cursor-pointer text-white/92 sm:h-14 sm:w-14"
            aria-pressed={paused}
            aria-label={paused ? "Play carousel" : "Pause carousel"}
          >
            {paused ? (
              <ControlIcon src={carouselIcons.play} />
            ) : (
              <ControlIcon src={carouselIcons.pause} />
            )}
          </button>
          <div className="hero-carousel__pagination flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                data-carousel-control="true"
                onClick={() => goToIndex(index)}
                className={`relative h-3 overflow-hidden rounded-full cursor-pointer transition-[width,background-color,transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  activeIndex === index ? "w-10 bg-white/18" : "w-3 bg-white/34"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {activeIndex === index ? (
                  <span
                    className="absolute inset-0 origin-left rounded-full bg-white will-change-transform"
                    style={{ transform: `scaleX(${autoplayProgress})` }}
                  />
                ) : null}
              </button>
            ))}
          </div>
          <span className="h-5 w-px bg-white/14" aria-hidden="true" />
          <button
            type="button"
            data-carousel-control="true"
            onClick={handleFullscreenToggle}
            className="hero-carousel__fullscreen-button flex h-10 w-10 items-center justify-center rounded-full cursor-pointer text-white/92 sm:h-11 sm:w-11"
            aria-label={isFullscreenIntent ? "Exit carousel fullscreen" : "Open carousel fullscreen"}
          >
            {isFullscreenIntent ? (
              <ControlIcon src={carouselIcons.minimize} />
            ) : (
              <ControlIcon src={carouselIcons.expand} />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

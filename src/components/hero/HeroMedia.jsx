import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import HeroCarousel from "./HeroCarousel";

const MOBILE_BREAKPOINT = 768;

export default function HeroMedia({
  slides,
  progress,
  isExpanded,
  onEnterFullscreen,
  onExitFullscreen
}) {
  const { reduceMotion } = useRevealMotion();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredSlides = useMemo(() => {
    if (!isMobile) return slides;
    return slides.filter((slide) => slide.id !== "slide-3");
  }, [slides, isMobile]);

  return (
    <div className="home-hero__media-wrap" data-hero-media>
      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0.001,
                y: 12
              }
        }
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
        }
        className={`home-hero__media ${isExpanded ? "home-hero__media--expanded" : ""}`}
        style={{ "--hero-progress": progress }}
      >
        <HeroCarousel
          slides={filteredSlides}
          isFullscreen={progress > 0.98}
          onEnterFullscreen={onEnterFullscreen}
          onExitFullscreen={onExitFullscreen}
        />
      </motion.div>
    </div>
  );
}

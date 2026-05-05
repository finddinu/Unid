import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../lib/clamp";
import { carouselEase } from "../lib/easing";

function wrapIndex(index, count) {
  return ((index % count) + count) % count;
}

export function useHeroCarousel(
  slideCount,
  {
    autoplayDelay = 6200,
    autoplayDuration = 0.96,
    manualDuration = 0.86,
    dragSnapDuration = 0.74
  } = {}
) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const autoplayFrameRef = useRef(null);
  const autoplayStartRef = useRef(0);
  const autoplayElapsedRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    pointerType: "mouse",
    startX: 0,
    startY: 0,
    startOffset: 0,
    delta: 0,
    intentResolved: false
  });
  const animationControlRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackX = useMotionValue(0);

  const extendedCount = slideCount + 2;

  const syncTrackToIndex = useCallback(
    (nextVirtualIndex) => {
      if (!width) return;
      trackX.set(-nextVirtualIndex * width);
    },
    [trackX, width]
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const measure = () => {
      const nextWidth = node.getBoundingClientRect().width;
      setWidth(nextWidth);
    };

    measure();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new window.ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    syncTrackToIndex(virtualIndex);
  }, [syncTrackToIndex, virtualIndex]);

  const stopAnimation = useCallback(() => {
    animationControlRef.current?.stop?.();
    animationControlRef.current = null;
    setIsTransitioning(false);
  }, []);

  const resetAutoplay = useCallback(() => {
    autoplayElapsedRef.current = 0;
    autoplayStartRef.current = performance.now();
    setAutoplayProgress(0);
  }, []);

  const finishWrappedIndex = useCallback(
    (nextVirtualIndex) => {
      if (nextVirtualIndex === 0) {
        setVirtualIndex(slideCount);
        setActiveIndex(slideCount - 1);
        requestAnimationFrame(() => syncTrackToIndex(slideCount));
        return;
      }

      if (nextVirtualIndex === slideCount + 1) {
        setVirtualIndex(1);
        setActiveIndex(0);
        requestAnimationFrame(() => syncTrackToIndex(1));
        return;
      }

      setVirtualIndex(nextVirtualIndex);
      setActiveIndex(wrapIndex(nextVirtualIndex - 1, slideCount));
    },
    [slideCount, syncTrackToIndex]
  );

  const animateToVirtualIndex = useCallback(
    (nextVirtualIndex, duration) => {
      if (!width) return;

      stopAnimation();
      setIsTransitioning(true);

      animationControlRef.current = animate(trackX, -nextVirtualIndex * width, {
        duration: reducedMotion ? 0.01 : duration,
        ease: reducedMotion ? "linear" : carouselEase,
        onComplete: () => {
          setIsTransitioning(false);
          finishWrappedIndex(nextVirtualIndex);
          resetAutoplay();
        }
      });
    },
    [finishWrappedIndex, reducedMotion, resetAutoplay, stopAnimation, trackX, width]
  );

  const goToIndex = useCallback(
    (nextIndex, duration = manualDuration) => {
      const normalized = wrapIndex(nextIndex, slideCount);
      const current = activeIndex;
      const forwardDistance = (normalized - current + slideCount) % slideCount;
      const backwardDistance = (current - normalized + slideCount) % slideCount;
      const direction = forwardDistance <= backwardDistance ? 1 : -1;

      animateToVirtualIndex(virtualIndex + direction * Math.min(forwardDistance, backwardDistance), duration);
    },
    [activeIndex, animateToVirtualIndex, manualDuration, slideCount, virtualIndex]
  );

  const goByDirection = useCallback(
    (direction, duration = manualDuration) => {
      animateToVirtualIndex(virtualIndex + direction, duration);
    },
    [animateToVirtualIndex, manualDuration, virtualIndex]
  );

  const togglePaused = useCallback(() => {
    setPaused((current) => {
      if (current) {
        autoplayStartRef.current = performance.now() - autoplayElapsedRef.current;
      }
      return !current;
    });
  }, []);

  useEffect(() => {
    if (!slideCount || paused || isDragging || isFocusLocked || isTransitioning) {
      if (autoplayFrameRef.current) {
        cancelAnimationFrame(autoplayFrameRef.current);
      }
      autoplayFrameRef.current = null;
      return undefined;
    }

    autoplayStartRef.current =
      performance.now() - Math.min(autoplayElapsedRef.current, autoplayDelay);

    const tick = (now) => {
      const elapsed = now - autoplayStartRef.current;
      autoplayElapsedRef.current = elapsed;
      const nextProgress = clamp(elapsed / autoplayDelay);
      setAutoplayProgress(nextProgress);

      if (elapsed >= autoplayDelay) {
        autoplayElapsedRef.current = 0;
        goByDirection(1, autoplayDuration);
        return;
      }

      autoplayFrameRef.current = requestAnimationFrame(tick);
    };

    autoplayFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (autoplayFrameRef.current) {
        cancelAnimationFrame(autoplayFrameRef.current);
        autoplayFrameRef.current = null;
      }
    };
  }, [
    autoplayDelay,
    autoplayDuration,
    goByDirection,
    isDragging,
    isFocusLocked,
    isTransitioning,
    paused,
    resetAutoplay,
    slideCount
  ]);

  const endDrag = useCallback(() => {
    const node = containerRef.current;
    const dragState = dragStateRef.current;

    if (!dragState.active || !node || !width) return;

    dragState.active = false;
    setIsDragging(false);
    node.classList.remove("is-dragging");

    if (dragState.pointerId !== null && node.hasPointerCapture?.(dragState.pointerId)) {
      node.releasePointerCapture(dragState.pointerId);
    }

    const threshold = Math.max(10, width * 0.12);
    const delta = dragState.delta;

    if (delta <= -threshold) {
      animateToVirtualIndex(virtualIndex + 1, dragSnapDuration);
    } else if (delta >= threshold) {
      animateToVirtualIndex(virtualIndex - 1, dragSnapDuration);
    } else {
      animateToVirtualIndex(virtualIndex, dragSnapDuration * 0.8);
    }

    dragState.delta = 0;
  }, [animateToVirtualIndex, dragSnapDuration, virtualIndex, width]);

  const handlePointerDown = useCallback(
    (event) => {
      const node = containerRef.current;
      const isTouch = event.pointerType === "touch";
      if (
        !node ||
        isTransitioning ||
        event.button > 0 ||
        event.target instanceof Element && event.target.closest("[data-carousel-control='true']")
      ) {
        return;
      }

      stopAnimation();
      dragStateRef.current = {
        active: true,
        pointerId: event.pointerId,
        pointerType: event.pointerType || "mouse",
        startX: event.clientX,
        startY: event.clientY,
        startOffset: trackX.get(),
        delta: 0,
        intentResolved: !isTouch
      };

      node.setPointerCapture?.(event.pointerId);

      if (!isTouch) {
        setIsDragging(true);
        node.classList.add("is-dragging");
        event.preventDefault();
      }
    },
    [isTransitioning, stopAnimation, trackX]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const node = containerRef.current;
      const dragState = dragStateRef.current;
      if (!dragState.active || !width || !node) return;

      if (dragState.pointerType === "touch" && !dragState.intentResolved) {
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;

        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (dragState.pointerId !== null && node.hasPointerCapture?.(dragState.pointerId)) {
            node.releasePointerCapture(dragState.pointerId);
          }
          dragState.active = false;
          return;
        }

        dragState.intentResolved = true;
        setIsDragging(true);
        node.classList.add("is-dragging");
      }

      const delta = event.clientX - dragState.startX;
      dragState.delta = delta;
      trackX.set(dragState.startOffset + delta);
      event.preventDefault();
    },
    [trackX, width]
  );

  const handlePointerUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePaused();
        return;
      }

      if (isTransitioning) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goByDirection(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goByDirection(-1);
      }
    },
    [goByDirection, isTransitioning, togglePaused]
  );

  const extendedIndices = useMemo(
    () =>
      Array.from({ length: extendedCount }, (_, index) =>
        index === 0 ? slideCount - 1 : index === extendedCount - 1 ? 0 : index - 1
      ),
    [extendedCount, slideCount]
  );

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return {
    containerRef,
    controlsRef,
    trackX,
    virtualIndex,
    activeIndex,
    paused,
    autoplayProgress,
    isDragging,
    extendedIndices,
    togglePaused,
    goToIndex,
    setPaused,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
    onFocus: () => setIsFocusLocked(true),
    onBlur: () => setIsFocusLocked(false)
  };
}

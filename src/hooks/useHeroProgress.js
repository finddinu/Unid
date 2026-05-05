import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { clamp } from "../lib/clamp";

function useMeasuredHeight(ref) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const update = () => {
      const boxHeight = node.getBoundingClientRect().height;
      setHeight(Math.ceil(Math.max(node.scrollHeight || 0, boxHeight || 0)));
    };

    update();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new window.ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}

function getHeroBreakpointMetrics(viewportWidth, viewportHeight) {
  const interpolate = (minWidth, maxWidth, minValue, maxValue) => {
    const ratio = (viewportWidth - minWidth) / (maxWidth - minWidth);
    return minValue + (maxValue - minValue) * ratio;
  };

  if (viewportWidth >= 1920) {
    return {
      topPadding: 112,
      bottomPadding: 48,
      minMediaHeight: viewportHeight >= 1280 ? 260 : 220
    };
  }

  if (viewportWidth >= 1440) {
    return {
      topPadding: interpolate(1440, 1920, 88, 112),
      bottomPadding: 48,
      minMediaHeight: viewportHeight >= 1024 ? 220 : 200
    };
  }

  if (viewportWidth >= 768) {
    return {
      topPadding: 64,
      bottomPadding: 32,
      minMediaHeight: 220
    };
  }

  if (viewportWidth > 390) {
    return {
      topPadding: 50,
      bottomPadding: 24,
      minMediaHeight: 180
    };
  }

  return {
    topPadding: 48,
    bottomPadding: 24,
    minMediaHeight: 180
  };
}

export function useHeroProgress({
  enabled = true,
  scrollFactor = 1 / 720,
  easing = 0.14,
  touchTravel = 280,
  touchToggleThreshold = 28
} = {}) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const animationRef = useRef(null);
  const animationEasingRef = useRef(easing);
  const wasAwayFromTopRef = useRef(false);
  const expandReadyRef = useRef(false);
  const closingLockUntilRef = useRef(0);
  const touchStateRef = useRef({
    tracking: false,
    vertical: false,
    startX: 0,
    startY: 0,
    startProgress: 0
  });
  const [progress, setProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined"
      ? window.visualViewport?.height || window.innerHeight
      : 0
  );
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined"
      ? window.visualViewport?.width || window.innerWidth
      : 0
  );

  const contentHeight = useMeasuredHeight(contentRef);
  const { topPadding, bottomPadding, minMediaHeight } = getHeroBreakpointMetrics(
    viewportWidth,
    viewportHeight
  );
  const fallbackContentHeight =
    viewportWidth >= 1440 ? 260 : viewportWidth >= 768 ? 240 : 228;
  const measuredContentHeight = contentHeight || fallbackContentHeight;
  const contentShellHeight = measuredContentHeight + topPadding + bottomPadding;
  const baseMediaHeight = Math.max(
    minMediaHeight,
    Math.min(viewportHeight, viewportHeight - contentShellHeight)
  );
  const currentMediaHeight =
    baseMediaHeight + (viewportHeight - baseMediaHeight) * progress;

  const applyProgress = useCallback((nextProgress) => {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const animateProgress = useCallback(() => {
    const difference = targetRef.current - progressRef.current;
    const activeEasing = animationEasingRef.current || easing;
    const nextEasing = difference < 0 ? activeEasing * 0.72 : activeEasing;

    if (Math.abs(difference) <= 0.001) {
      applyProgress(targetRef.current);
      animationEasingRef.current = easing;
      animationRef.current = null;
      return;
    }

    applyProgress(progressRef.current + difference * nextEasing);
    animationRef.current = window.requestAnimationFrame(animateProgress);
  }, [applyProgress, easing]);

  const queueProgress = useCallback(
    (nextProgress, options = {}) => {
      targetRef.current = clamp(nextProgress);
      animationEasingRef.current = options.easing || easing;

      if (animationRef.current) return;
      animationRef.current = window.requestAnimationFrame(animateProgress);
    },
    [animateProgress, easing]
  );

  const setProgressImmediate = useCallback(
    (nextProgress) => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      const clamped = clamp(nextProgress);
      targetRef.current = clamped;
      applyProgress(clamped);
    },
    [applyProgress]
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const updateViewport = () =>
      {
        setViewportHeight(window.visualViewport?.height || window.innerHeight);
        setViewportWidth(window.visualViewport?.width || window.innerWidth);
      };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 6) {
        wasAwayFromTopRef.current = true;
        expandReadyRef.current = false;
      } else if (progressRef.current <= 0.001 && wasAwayFromTopRef.current) {
        expandReadyRef.current = false;
        wasAwayFromTopRef.current = false;
      }
    };

    const handleWheel = (event) => {
      const atTop = window.scrollY <= 4;

      if (!atTop) {
        if (progressRef.current > 0.001 || targetRef.current > 0.001) {
          queueProgress(0);
        }
        return;
      }

      if (event.deltaY > 0 && (progressRef.current > 0.001 || targetRef.current > 0.001)) {
        queueProgress(0);
        return;
      }

      if (atTop && progressRef.current <= 0.001 && !expandReadyRef.current) {
        expandReadyRef.current = true;
        return;
      }

      const nextProgress = targetRef.current + -event.deltaY * scrollFactor;
      const clamped = clamp(nextProgress);

      if (Math.abs(clamped - targetRef.current) < 0.001) return;

      event.preventDefault();
      queueProgress(clamped);
    };

    const handleTouchStart = (event) => {
      const target = sectionRef.current;

      if (!target || event.touches.length !== 1) {
        touchStateRef.current.tracking = false;
        touchStateRef.current.vertical = false;
        return;
      }

      const touch = event.touches[0];

      touchStateRef.current = {
        tracking: true,
        vertical: false,
        startX: touch.clientX,
        startY: touch.clientY,
        startProgress: progressRef.current
      };
    };

    const handleTouchMove = (event) => {
      const target = sectionRef.current;
      const touchState = touchStateRef.current;

      if (!target || !touchState.tracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;

      if (!touchState.vertical) {
        if (Math.abs(deltaY) < 8) return;
        if (Math.abs(deltaY) <= Math.abs(deltaX)) {
          touchState.tracking = false;
          return;
        }
        touchState.vertical = true;
      }

      const atTop = window.scrollY <= 16;

      if (!atTop && targetRef.current <= 0.001 && progressRef.current <= 0.001) {
        touchState.tracking = false;
        return;
      }

      if (atTop && progressRef.current <= 0.001 && !expandReadyRef.current && deltaY > touchToggleThreshold * 0.5) {
        expandReadyRef.current = true;
      }

      if ((atTop && deltaY > 8) || progressRef.current > 0.001 || targetRef.current > 0.001) {
        if ((progressRef.current > 0.001 || targetRef.current > 0.001) && window.scrollY !== 0) {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }

        if (atTop && touchState.startProgress <= 0.001 && deltaY > 0) {
          setProgressImmediate(deltaY / touchTravel);
        } else if (touchState.startProgress > 0.001 && deltaY < 0) {
          setProgressImmediate(touchState.startProgress + deltaY / touchTravel);
        }

        event.preventDefault();
      }
    };

    const handleTouchEnd = (event) => {
      const touchState = touchStateRef.current;

      if (
        touchState.tracking &&
        touchState.vertical &&
        event.changedTouches &&
        event.changedTouches.length === 1
      ) {
        const touch = event.changedTouches[0];
        const totalDeltaY = touch.clientY - touchState.startY;
        const atTop = window.scrollY <= 16;

        if (atTop && touchState.startProgress <= 0.001 && progressRef.current > 0.001) {
          expandReadyRef.current = true;
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          queueProgress(progressRef.current > 0.22 || totalDeltaY > touchToggleThreshold ? 1 : 0);
        } else if (touchState.startProgress > 0.001 && progressRef.current < 0.999) {
          closingLockUntilRef.current = performance.now() + 520;
          expandReadyRef.current = true;
          wasAwayFromTopRef.current = false;
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          queueProgress(progressRef.current < 0.78 || totalDeltaY < -touchToggleThreshold ? 0 : 1);
        }
      }

      touchStateRef.current.tracking = false;
      touchStateRef.current.vertical = false;
    };

    const keepAtTopWhenClosing = () => {
      if (
        closingLockUntilRef.current &&
        performance.now() < closingLockUntilRef.current &&
        window.scrollY !== 0
      ) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", keepAtTopWhenClosing, { passive: true });

    const section = sectionRef.current;
    section?.addEventListener("wheel", handleWheel, { passive: false });
    section?.addEventListener("touchstart", handleTouchStart, { passive: true });
    section?.addEventListener("touchmove", handleTouchMove, { passive: false });
    section?.addEventListener("touchend", handleTouchEnd, { passive: true });
    section?.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", keepAtTopWhenClosing);
      section?.removeEventListener("wheel", handleWheel);
      section?.removeEventListener("touchstart", handleTouchStart);
      section?.removeEventListener("touchmove", handleTouchMove);
      section?.removeEventListener("touchend", handleTouchEnd);
      section?.removeEventListener("touchcancel", handleTouchEnd);

      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    enabled,
    queueProgress,
    scrollFactor,
    setProgressImmediate,
    touchToggleThreshold,
    touchTravel
  ]);

  return {
    sectionRef,
    contentRef,
    progress,
    isExpanded: progress > 0.01,
    contentHeight,
    viewportHeight,
    viewportWidth,
    contentShellHeight,
    baseMediaHeight,
    currentMediaHeight,
    setProgressImmediate,
    queueProgress
  };
}

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { premiumEase } from "../lib/easing";

export function useRevealMotion() {
  const reduceMotion = useReducedMotion();

  return useMemo(() => {
    const textTransition = reduceMotion
      ? { duration: 0.01 }
      : { duration: 0.34, ease: premiumEase };

    const mediaTransition = reduceMotion
      ? { duration: 0.01 }
      : { duration: 0.42, ease: premiumEase };

    const reveal = {
      initial: {
        opacity: 0.001,
        y: reduceMotion ? 0 : 10,
        filter: reduceMotion ? "none" : "blur(5px)"
      },
      animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)"
      },
      whileInView: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)"
      },
      viewport: { once: true, amount: 0.01, margin: "0px 0px 120px 0px" },
      transition: textTransition
    };

    const mediaReveal = {
      initial: {
        opacity: 0.12,
        y: reduceMotion ? 0 : 10,
        scale: reduceMotion ? 1 : 0.988,
        filter: reduceMotion ? "none" : "blur(5px)"
      },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)"
      },
      whileInView: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)"
      },
      viewport: { once: true, amount: 0.01, margin: "0px 0px 120px 0px" },
      transition: mediaTransition
    };

    const staggerParent = (delayChildren = 0.02, staggerChildren = 0.04) => ({
      initial: "hidden",
      animate: "show",
      whileInView: "show",
      viewport: { once: true, amount: 0.01, margin: "0px 0px 120px 0px" },
      variants: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { duration: 0.01 }
            : { delayChildren, staggerChildren }
        }
      }
    });

    const intro = (delay = 0) => ({
      initial: reduceMotion
        ? false
        : {
            opacity: 0,
            y: 16,
            filter: "blur(10px)"
          },
      animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)"
      },
      transition: reduceMotion
        ? { duration: 0.01 }
            : { duration: 0.48, ease: premiumEase, delay }
    });

    const introParent = (delayChildren = 0.04, staggerChildren = 0.04) => ({
      initial: "hidden",
      animate: "show",
      variants: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { duration: 0.01 }
            : { delayChildren, staggerChildren }
        }
      }
    });

    const introChild = {
      variants: {
        hidden: {
          opacity: 0.001,
          y: reduceMotion ? 0 : 10,
          filter: reduceMotion ? "none" : "blur(5px)"
        },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.36, ease: premiumEase }
        }
      }
    };

    const staggerChild = {
      variants: {
        hidden: {
          opacity: 0.001,
          y: reduceMotion ? 0 : 8,
          filter: reduceMotion ? "none" : "blur(4px)"
        },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: textTransition
        }
      }
    };

    return {
      reduceMotion,
      reveal,
      mediaReveal,
      intro,
      introParent,
      introChild,
      staggerParent,
      staggerChild
    };
  }, [reduceMotion]);
}

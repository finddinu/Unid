import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRevealMotion } from "../../hooks/useRevealMotion";

export default function HeroText({ hero, progress, contentRef }) {
  const { staggerParent, introParent, reduceMotion } = useRevealMotion();
  const titleRef = useRef(null);
  const [titleFit, setTitleFit] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const desktopLines = hero.titleLines ?? [hero.title];

  const titleLineVariants = reduceMotion
    ? undefined
    : {
        hidden: {
          opacity: 0.001,
          y: 18
        },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] }
        }
      };

  const actionsVariants = reduceMotion
    ? undefined
    : {
        hidden: {
          opacity: 0.001,
          y: 14
        },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.28 }
        }
      };

  useLayoutEffect(() => {
    const node = titleRef.current;
    if (!node) return undefined;

    const updateFit = () => {
      const desktopVariant = node.querySelector(".home-hero__title-variant--desktop");
      const activeTitle =
        desktopVariant && window.getComputedStyle(desktopVariant).display !== "none"
          ? desktopVariant
          : node.querySelector(".home-hero__title-variant--mobile");

      if (!activeTitle) {
        setTitleFit(1);
        return;
      }

      const lines = Array.from(activeTitle.querySelectorAll(".home-hero__title-line"));
      const availableWidth = node.clientWidth;

      if (!lines.length || !availableWidth) {
        setTitleFit(1);
        return;
      }

      const widestLine = Math.max(...lines.map((line) => line.scrollWidth));
      const nextFit = Math.max(0.35, availableWidth / widestLine);
      setTitleFit(nextFit);
    };

    const rafOne = window.requestAnimationFrame(() => {
      updateFit();
      window.requestAnimationFrame(updateFit);
    });

    const observer = new window.ResizeObserver(updateFit);
    observer.observe(node);
    window.addEventListener("resize", updateFit);

    let fontCancel = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!fontCancel) {
          updateFit();
        }
      });
    }

    return () => {
      window.cancelAnimationFrame(rafOne);
      fontCancel = true;
      observer.disconnect();
      window.removeEventListener("resize", updateFit);
    };
  }, [hero.mobileTitleLines, hero.titleLines, viewportWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div
      className="home-hero__content-shell"
      style={{
        "--hero-progress": progress
      }}
    >
      <motion.div
        ref={contentRef}
        {...staggerParent(0.08, 0.08)}
        className="home-hero__description-section flex w-full flex-col"
      >
        <motion.h1
          className="hero-title w-full min-w-0"
          ref={titleRef}
          style={{ "--hero-title-fit": titleFit }}
        >
          <motion.span
            {...introParent(0.1, 0.055)}
            className="home-hero__title-desktop home-hero__title-variant--desktop"
          >
            {desktopLines.map((line) => (
              <motion.span
                key={line}
                className="home-hero__title-line"
                {...(reduceMotion ? {} : { variants: titleLineVariants })}
              >
                {line}
              </motion.span>
            ))}
          </motion.span>
          <motion.span
            {...introParent(0.1, 0.05)}
            className="home-hero__title-mobile home-hero__title-variant--mobile"
          >
            {(hero.mobileTitleLines ?? [hero.mobileTitle]).map((line) => (
              <motion.span
                key={line}
                className="home-hero__title-line"
                {...(reduceMotion ? {} : { variants: titleLineVariants })}
              >
                {line}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>

        <motion.div
          {...(reduceMotion ? {} : { initial: "hidden", animate: "show", variants: actionsVariants })}
          className="home-hero__actions flex flex-wrap items-center text-[#0ba5ec]"
        >
          <div className="home-hero__actions-icons flex items-center">
            <a
              href="mailto:finddinu@gmail.com"
              className="home-hero__icon-button inline-flex items-center justify-center rounded-full"
              aria-label="Email"
            >
              <img src="/assets/ui/mail-hero.svg" alt="" className="home-hero__icon-asset" aria-hidden="true" />
            </a>
            <a
              href="https://t.me/finddinu"
              target="_blank"
              rel="noreferrer"
              className="home-hero__icon-button inline-flex items-center justify-center rounded-full"
              aria-label="Telegram"
            >
              <img src="/assets/ui/telegram-hero.svg" alt="" className="home-hero__icon-asset" aria-hidden="true" />
            </a>
          </div>

          <a
            href="mailto:finddinu@gmail.com"
            className="home-hero__availability inline-flex items-center font-medium tracking-[-0.01em]"
          >
            <span className="home-hero__availability-indicator grid h-6 w-6 place-items-center">
              <span className="home-hero__availability-ring home-hero__availability-ring--primary col-start-1 row-start-1 h-6 w-6 rounded-full bg-[#0ba5ec]/22" />
              <span className="home-hero__availability-ring home-hero__availability-ring--secondary col-start-1 row-start-1 h-6 w-6 rounded-full bg-[#0ba5ec]/16" />
              <span className="home-hero__availability-dot-shell col-start-1 row-start-1 grid h-4 w-4 place-items-center rounded-full bg-[#0ba5ec]/18">
                <span className="home-hero__availability-dot h-3 w-3 rounded-full bg-[#0ba5ec]" />
              </span>
            </span>
            <span className="home-hero__availability-label">{hero.availability}</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

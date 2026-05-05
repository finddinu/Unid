import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRevealMotion } from "../../hooks/useRevealMotion";

const caseHeroIcons = {
  play: "/assets/icons/play.svg",
  pause: "/assets/icons/pause.svg",
  soundOn: "/assets/icons/sound-on.svg",
  soundOff: "/assets/icons/sound-off.svg",
  expand: "/assets/icons/Expand.svg",
  minimize: "/assets/icons/Minimize.svg"
};

function CaseControlIcon({ src }) {
  return <img src={src} alt="" className="h-5 w-5 brightness-0 invert" aria-hidden="true" />;
}

function PauseIcon() {
  return <CaseControlIcon src={caseHeroIcons.pause} />;
}

function PlayIcon() {
  return <CaseControlIcon src={caseHeroIcons.play} />;
}

function SoundOnIcon() {
  return <CaseControlIcon src={caseHeroIcons.soundOn} />;
}

function SoundOffIcon() {
  return <CaseControlIcon src={caseHeroIcons.soundOff} />;
}

function ExpandIcon() {
  return <CaseControlIcon src={caseHeroIcons.expand} />;
}

function MinimizeIcon() {
  return <CaseControlIcon src={caseHeroIcons.minimize} />;
}

export default function CaseStudyHeader({ caseStudy, heroProgress }) {
  const { reduceMotion } = useRevealMotion();
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [videoSrc, setVideoSrc] = useState(
    () => caseStudy.heroMedia.desktopSrc || caseStudy.heroMedia.src
  );
  const [videoPoster, setVideoPoster] = useState(
    () => caseStudy.heroMedia.poster
  );

  useLayoutEffect(() => {
    const updateVideoSource = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const media = caseStudy.heroMedia;

      if (media.mobileSrc && media.desktopSrc) {
        setVideoSrc(isMobile ? media.mobileSrc : media.desktopSrc);
      } else {
        setVideoSrc(media.src || media.desktopSrc);
      }

      if (media.mobileSrc && media.desktopSrc) {
        setVideoPoster(media.poster || (isMobile ? media.mobileSrc : media.desktopSrc));
      } else {
        setVideoPoster(media.poster);
      }
    };

    updateVideoSource();

    window.addEventListener("resize", updateVideoSource);
    return () => window.removeEventListener("resize", updateVideoSource);
  }, [caseStudy.heroMedia]);

  const [titleFit, setTitleFit] = useState(1);
  const titleLines = Array.isArray(caseStudy.titleLines) ? caseStudy.titleLines : null;

  const { mediaWrapRef, footerRef, progress, baseMediaHeight, footerHeight, queueProgress } = heroProgress;
  const isFullscreenIntent = progress > 0.5;
  const safeFooterHeight = Math.max(footerHeight || 260, 260);
  const footerFadeProgress = Math.max(0, Math.min(1, (progress - 0.58) / 0.22));
  const footerCollapseProgress = Math.max(0, Math.min(1, (progress - 0.72) / 0.28));
  const radiusProgress = Math.max(0, Math.min(1, 1 - progress));
  const showHeroSubtitle = caseStudy.showHeroSubtitle !== false && !caseStudy.overview;

  const heroIntro = (delay = 0) => ({
    initial: reduceMotion
      ? false
      : {
          opacity: 0,
          y: 16,
          filter: "blur(10px)"
        },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0
    },
    transition: reduceMotion
      ? { duration: 0.01 }
      : { duration: 0.58, ease: [0.22, 1, 0.36, 1], delay }
  });

  const heroStaggerParent = {
    initial: "hidden",
    animate: "show",
    variants: {
      hidden: {},
      show: {
        transition: reduceMotion ? { duration: 0.01 } : { delayChildren: 0.08, staggerChildren: 0.08 }
      }
    }
  };

  const heroStaggerChild = {
    variants: {
      hidden: {
        opacity: 0.001,
        y: reduceMotion ? 0 : 12,
        filter: reduceMotion ? "none" : "blur(8px)"
      },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: reduceMotion
          ? { duration: 0.01 }
          : { duration: 0.64, ease: [0.22, 1, 0.36, 1] }
      }
    }
  };

  useLayoutEffect(() => {
    const node = titleRef.current;
    if (!node) return undefined;

    const updateFit = () => {
      const availableWidth = node.clientWidth;
      const measuredWidth = node.scrollWidth;

      if (!availableWidth || !measuredWidth) {
        setTitleFit(1);
        return;
      }

      const nextFit =
        measuredWidth > availableWidth ? Math.max(0.82, availableWidth / measuredWidth) : 1;
      setTitleFit(nextFit);
    };

    const raf = window.requestAnimationFrame(() => {
      updateFit();
      window.requestAnimationFrame(updateFit);
    });

    const observer = new window.ResizeObserver(updateFit);
    observer.observe(node);
    window.addEventListener("resize", updateFit);

    let fontCancel = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!fontCancel) updateFit();
      });
    }

    return () => {
      window.cancelAnimationFrame(raf);
      fontCancel = true;
      observer.disconnect();
      window.removeEventListener("resize", updateFit);
    };
  }, [caseStudy.title]);

  useEffect(() => {
    if (caseStudy.heroMedia.type !== "video" || !videoRef.current) return undefined;
    const video = videoRef.current;

    const handlePlay = () => setPaused(false);
    const handlePause = () => setPaused(true);
    const handleVolume = () => {
      setMuted(video.muted || video.volume === 0);
      setVolume(video.volume);
    };

    video.volume = 0;
    video.muted = true;
    setVolume(0);
    setMuted(true);

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolume);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
    };
  }, [caseStudy.heroMedia.type]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }, [videoSrc]);

  return (
    <section
      className="case-hero"
      style={{
        "--case-hero-progress": progress,
        "--case-hero-media-base": `${baseMediaHeight || 320}px`,
        "--case-hero-footer-base": `${safeFooterHeight}px`,
        "--case-hero-footer-fade": footerFadeProgress,
        "--case-hero-footer-collapse": footerCollapseProgress,
        "--case-hero-radius-progress": radiusProgress
      }}
    >
      <div className="case-hero__shell">
        <div
          ref={mediaWrapRef}
          className="case-hero__media-wrap"
          data-header-surface={
            caseStudy.heroMedia.type === "video" || caseStudy.previewTone === "dark" ? "dark" : undefined
          }
        >
          <motion.div {...heroIntro(0.06)} className="case-hero__media">
            {caseStudy.heroMedia.type === "blank" ? null : caseStudy.heroMedia.type === "video" ? (
              <video
                key={videoSrc}
                ref={videoRef}
                src={videoSrc}
                poster={videoPoster}
                className="case-hero__media-asset absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={caseStudy.heroMedia.label}
              />
            ) : (
              <img
                src={caseStudy.heroMedia.src}
                alt={caseStudy.heroMedia.label}
                className="case-hero__media-asset absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
          </motion.div>

          {caseStudy.heroMedia.type === "video" ? (
            <motion.div
              {...heroIntro(0.22)}
              className="hero-carousel__controls absolute bottom-5 right-4 z-10 sm:bottom-7 sm:right-6 lg:bottom-8 lg:right-8"
            >
              <div className="case-hero__controls-group hero-carousel__controls-shell flex min-h-[52px] items-center gap-1.5 sm:min-h-[56px] lg:min-h-[60px]">
                <button
                  type="button"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    if (video.paused) {
                      const playPromise = video.play();
                      if (playPromise?.catch) {
                        playPromise.catch(() => {});
                      }
                    } else {
                      video.pause();
                    }
                  }}
                  className="hero-carousel__pause-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/92 sm:h-11 sm:w-11"
                  aria-label={paused ? "Play case study video" : "Pause case study video"}
                >
                  {paused ? <PlayIcon /> : <PauseIcon />}
                </button>

                <div className="case-hero__right-controls">
                  <button
                    type="button"
                    onClick={() => {
                      const video = videoRef.current;
                      if (!video) return;
                      const nextMuted = !(video.muted || video.volume === 0);
                      if (nextMuted) {
                        video.muted = true;
                        video.volume = 0;
                        setVolume(0);
                        setMuted(true);
                      } else {
                        video.muted = false;
                        const restoredVolume = volume > 0 ? volume : 0.65;
                        video.volume = restoredVolume;
                        setVolume(restoredVolume);
                        setMuted(false);
                      }
                    }}
                    className="hero-carousel__pause-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/92 sm:h-11 sm:w-11"
                    aria-label={muted ? "Unmute case study video" : "Mute case study video"}
                  >
                    {muted ? <SoundOffIcon /> : <SoundOnIcon />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextProgress = isFullscreenIntent ? 0 : 1;
                      if (nextProgress === 1 && typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                      }
                      queueProgress?.(nextProgress);
                    }}
                    className="hero-carousel__fullscreen-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/92 sm:h-11 sm:w-11"
                    aria-label={isFullscreenIntent ? "Exit case study video fullscreen" : "Open case study video fullscreen"}
                  >
                    {isFullscreenIntent ? <MinimizeIcon /> : <ExpandIcon />}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          ref={footerRef}
          {...heroStaggerParent}
          className="case-hero__footer"
        >
          <motion.h1
            ref={titleRef}
            {...heroStaggerChild}
            className={`theme-heading case-hero__title w-full min-w-0 max-w-full break-words font-semibold [overflow-wrap:anywhere] ${
              titleLines ? "case-hero__title--large" : ""
            }`}
            style={{
              "--case-title-fit": titleFit,
              transform: "scale(var(--case-title-fit, 1))",
              transformOrigin: "top left",
              width: "calc(100% / var(--case-title-fit, 1))"
            }}
          >
            {titleLines
              ? titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))
              : caseStudy.title}
          </motion.h1>

          {caseStudy.subtitle && showHeroSubtitle ? (
            <motion.p
              {...heroStaggerChild}
              className="theme-copy case-hero__subtitle"
            >
              {caseStudy.subtitle}
            </motion.p>
          ) : null}

          <motion.div {...heroStaggerChild} className="case-hero__chips">
            {(caseStudy.chips?.length ? caseStudy.chips : [caseStudy.homeChip]).slice(0, 4).map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                className="case-hero__chip"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

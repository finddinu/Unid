import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRevealMotion } from "../../hooks/useRevealMotion";

function getCompactChips(caseStudy) {
  const source = caseStudy.chips?.length
    ? caseStudy.chips
    : [caseStudy.homeChip].filter(Boolean);
  return source
    .map((chip) => chip.trim().split(/\s+/)[0])
    .filter(Boolean)
    .slice(0, 3);
}

export default function CaseCard({ caseStudy }) {
  const { mediaReveal, reveal } = useRevealMotion();

  const rememberScrollPosition = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("return-to-scroll", String(window.scrollY));
  };

  const previewSurfaceStyle = {
    ...(caseStudy.previewFrameColor ? { backgroundColor: caseStudy.previewFrameColor } : {})
  };
  const fullChips = (caseStudy.chips?.length ? caseStudy.chips : [caseStudy.homeChip].filter(Boolean)).slice(0, 3);
  const compactChips = getCompactChips(caseStudy);

  return (
    <section
      className="home-case-card"
      data-header-surface="dark"
    >
      <motion.div
        {...mediaReveal}
        className="home-case-card__media-motion"
      >
        <Link
          to={`/case/${caseStudy.slug}`}
          onClick={rememberScrollPosition}
          className="home-case-card__link group"
        >
          <div
            data-header-surface={caseStudy.previewTone === "dark" ? "dark" : undefined}
            className="home-case-card__preview media-sheen"
            style={{ backgroundColor: caseStudy.previewFrameColor || "#0f0f10" }}
          >
            <motion.div
              style={previewSurfaceStyle}
              className="home-case-card__preview-surface"
            >
              {caseStudy.previewImage ? (
                <img
                  src={caseStudy.previewImage}
                  alt={caseStudy.title}
                  className="home-case-card__image"
                />
              ) : (
                <div className="home-case-card__fallback">
                  <span>
                    {caseStudy.shortTitle}
                  </span>
                </div>
              )}
              {caseStudy.previewOverlayVideo && caseStudy.previewImage ? (
                <video
                  className="pointer-events-none absolute left-1/2 top-[58%] h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 object-contain mix-blend-screen"
                  src={caseStudy.previewOverlayVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                />
              ) : null}
            </motion.div>
          </div>
        </Link>
      </motion.div>

      <div className="home-case-card__content">
        <div className="home-case-card__description-section">
          <motion.h2
            {...reveal}
            className="home-case-card__title theme-heading"
          >
            {caseStudy.title}
          </motion.h2>

          {caseStudy.description ? (
            <p className="sr-only">{caseStudy.description}</p>
          ) : null}

          <motion.div
            {...reveal}
            className="home-case-card__chips home-case-card__chips--full"
          >
            {fullChips.map((chip) => (
              <span
                key={`full-${chip}`}
                className="home-case-card__chip theme-pill"
              >
                {chip}
              </span>
            ))}
          </motion.div>
          <motion.div
            {...reveal}
            className="home-case-card__chips home-case-card__chips--compact"
          >
            {compactChips.map((chip) => (
              <span
                key={`compact-${chip}`}
                className="home-case-card__chip theme-pill"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

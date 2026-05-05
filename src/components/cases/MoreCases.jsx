import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import Container from "../layout/Container";

function getCompactChips(caseStudy) {
  const source = caseStudy.chips?.length
    ? caseStudy.chips
    : [caseStudy.homeChip].filter(Boolean);
  return source
    .map((chip) => chip.trim().split(/\s+/)[0])
    .filter(Boolean)
    .slice(0, 3);
}

export default function MoreCases({ cases, currentCaseId }) {
  const { mediaReveal, reveal } = useRevealMotion();
  const items = useMemo(
    () => cases.filter((caseStudy) => caseStudy.id !== currentCaseId).slice(0, 2),
    [cases, currentCaseId]
  );

  if (!items.length) return null;

  const rememberCaseOrigin = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("case-study-origin", currentCaseId);
  };

  return (
    <Container className="more-cases">
      <div className="more-cases__inner">
        <motion.h2
          {...reveal}
          className="more-cases__title theme-heading"
        >
          More Case Studies
        </motion.h2>

        <div className="more-cases__grid">
          {items.map((caseStudy) => {
            const categoryChips = getCompactChips(caseStudy);

            return (
              <motion.article key={caseStudy.id} {...mediaReveal}>
                <Link
                  to={`/case/${caseStudy.slug}`}
                  onClick={rememberCaseOrigin}
                  className="more-cases__link"
                  draggable={false}
                  tabIndex={0}
                >
                  <div
                    data-header-surface={caseStudy.previewTone === "dark" ? "dark" : undefined}
                    className="more-cases__preview theme-card media-sheen"
                    style={{ backgroundColor: caseStudy.previewFrameColor || undefined }}
                  >
                    <div
                      style={caseStudy.previewFrameColor ? { backgroundColor: caseStudy.previewFrameColor } : undefined}
                      className="more-cases__preview-surface"
                    >
                      {caseStudy.previewImage ? (
                        <img
                          src={caseStudy.previewImage}
                          alt={caseStudy.title}
                          className="more-cases__image"
                          draggable={false}
                          loading="lazy"
                        />
                      ) : (
                        <div className="more-cases__fallback">
                          <span>
                            {caseStudy.shortTitle}
                          </span>
                        </div>
                      )}
                      {caseStudy.previewOverlayVideo ? (
                        <video
                          className="pointer-events-none absolute left-1/2 top-[58%] h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 object-contain mix-blend-screen"
                          src={caseStudy.previewOverlayVideo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          draggable={false}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="more-cases__content">
                    <span className="more-cases__case-title theme-heading">
                      {caseStudy.shortTitle}
                    </span>
                    <span className="more-cases__chips">
                      {categoryChips.map((chip) => (
                        <span key={chip} className="more-cases__pill theme-pill">
                          {chip}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

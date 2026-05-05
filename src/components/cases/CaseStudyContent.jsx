import { motion } from "framer-motion";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import Container from "../layout/Container";

function CasePillarIcon({ index, iconSrc }) {
  const icons = [
    (
      <path
        d="M7 9.5h10A3.5 3.5 0 0 1 20.5 13v3A3.5 3.5 0 0 1 17 19.5H7A3.5 3.5 0 0 1 3.5 16v-7A3.5 3.5 0 0 1 7 5.5h8.5"
      />
    ),
    (
      <>
        <path d="M12.5 3.5 5.75 13h5.5l-.75 7.5L18.25 10h-5.5l-.25-6.5Z" />
        <path d="M8.5 13h2.75" />
      </>
    ),
    (
      <>
        <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
        <path d="M8.5 10h7" />
        <path d="M8.5 14h3" />
        <path d="M14.5 14h1" />
      </>
    )
  ];

  return (
    <span className="case-overview__pillar-icon" aria-hidden="true">
      {iconSrc ? (
        <img src={iconSrc} alt="" className="h-full w-full object-contain" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none">
          {icons[index % icons.length]}
        </svg>
      )}
    </span>
  );
}

function CaseOverview({ overview, motionProps }) {
  const { staggerParent, staggerChild } = motionProps;
  if (!overview) return null;

  const pillars = overview.solutionPillars || [];
  const hasProblem = overview.problem || overview.problemTitle;

  return (
    <Container className="case-overview">
      <motion.section {...staggerParent(0.04, 0.08)} className="case-overview__inner">
        {overview.context ? (
          <motion.p
            {...staggerChild}
            className="max-w-[62rem] text-[1.45rem] font-medium leading-[1.24] tracking-[-0.04em] text-[#050505] sm:text-[2rem] lg:text-[3rem]"
          >
            {overview.context}
          </motion.p>
        ) : null}

        {hasProblem ? (
          <motion.section {...staggerChild} className="case-overview__problem mb-[clamp(32px,4vw,48px)]">
            <p className="case-overview__label">The Problem</p>
            {overview.problemTitle ? (
              <h2 className="case-overview__problem-title">{overview.problemTitle}</h2>
            ) : null}
            {overview.problem ? (
              <p className="case-overview__problem-text">{overview.problem}</p>
            ) : overview.problemItems?.length ? (
              <div className="case-overview__problem-items">
                {overview.problemItems.map((item) => (
                  <p key={item} className="case-overview__problem-item">{item}</p>
                ))}
              </div>
            ) : null}
          </motion.section>
        ) : null}

        {pillars.length ? (
          <div className="case-overview__pillars">
            {pillars.map((pillar, index) => (
              <motion.article key={pillar.title} {...staggerChild} className="case-overview__pillar">
                <CasePillarIcon index={index} iconSrc={pillar.icon} />
                <div className="case-overview__pillar-copy">
                  <h3 className="case-overview__pillar-title">{pillar.title}</h3>
                  <p className="case-overview__pillar-text">{pillar.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}
      </motion.section>
    </Container>
  );
}

function CaseMediaGallery({ images = [], count, motionProps }) {
  const { staggerParent, staggerChild } = motionProps;
  const placeholders = Array.from({ length: count }, (_, index) => index + 1);

  if (!images.length && !placeholders.length) return null;

  return (
    <Container className={images.length ? "case-media-gallery" : "case-placeholder-gallery"}>
      <motion.section
        {...staggerParent(0.02, 0.04)}
        className={images.length ? "case-media-gallery__grid" : "case-placeholder-gallery__grid"}
        aria-label={images.length ? "Case study product screens" : "Case study visual placeholders"}
      >
        {images.length
          ? images.map((image, index) => (
              <motion.figure
                key={image.src}
                {...staggerChild}
                className="case-media-gallery__item"
              >
                <img
                  src={image.src}
                  alt={image.alt || `Case study product screen ${index + 1}`}
                  className="case-media-gallery__image"
                  loading="lazy"
                  draggable={false}
                />
                {image.overlayVideo ? (
                  <video
                    className="case-media-gallery__overlay-video"
                    src={image.overlayVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                    draggable={false}
                  />
                ) : null}
              </motion.figure>
            ))
          : placeholders.map((item) => (
              <motion.figure
                key={item}
                {...staggerChild}
                className="case-placeholder theme-card"
                aria-label={`Case study visual placeholder ${item}`}
              />
            ))}
      </motion.section>
    </Container>
  );
}

export default function CaseStudyContent({ caseStudy }) {
  const { reveal, staggerParent, staggerChild } = useRevealMotion();
  const summaryText = caseStudy.summary || caseStudy.intro || "";
  const summaryParagraphs = summaryText.split("\n\n").filter(Boolean);
  const summaryBlocks = caseStudy.summaryBlocks || [];
  const caseNarrative = caseStudy.caseNarrative;
  const galleryImages = caseStudy.galleryImages || [];
  const placeholderCount = caseStudy.placeholderCount ?? 5;

  if (
    !caseStudy.overview &&
    !caseNarrative &&
    !summaryBlocks.length &&
    !summaryParagraphs.length &&
    !placeholderCount
  ) return null;

  return (
    <div className="case-study-content">
      {caseStudy.overview ? (
        <CaseOverview
          overview={caseStudy.overview}
          motionProps={{ staggerParent, staggerChild }}
        />
      ) : caseNarrative ? (
        <CaseOverview
          overview={{
            context: caseNarrative.context,
            problemTitle: caseNarrative.problemTitle,
            problemItems: caseNarrative.problemItems,
            solutionPillars: caseNarrative.solutionPillars,
          }}
          motionProps={{ staggerParent, staggerChild }}
        />
      ) : summaryBlocks.length ? (
        <Container className="px-4 py-24 sm:px-8 lg:px-14 lg:py-32">
          <motion.section
            {...staggerParent(0.04, 0.08)}
            className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:gap-x-16 lg:gap-y-18"
          >
            {summaryBlocks.map((block) => (
              <motion.div
                key={block.title}
                {...staggerChild}
                className="theme-line flex min-h-[144px] flex-col justify-between border-t pt-5 lg:min-h-[184px] lg:pt-7"
              >
                {block.label ? (
                  <span className="theme-muted text-[12px] font-medium uppercase tracking-[0.12em] lg:text-[13px]">
                    {block.label}
                  </span>
                ) : null}
                <h2 className="theme-heading max-w-[30rem] text-[1.72rem] font-semibold leading-[1.04] tracking-[-0.045em] lg:text-[2.65rem]">
                  {block.title}
                </h2>
                {block.text ? <p className="sr-only">{block.text}</p> : null}
              </motion.div>
            ))}
          </motion.section>
        </Container>
      ) : summaryParagraphs.length ? (
        <Container className="px-4 py-18 sm:px-8 lg:px-14 lg:py-24">
          <motion.section {...reveal} className="max-w-[58rem]">
            <div className="flex max-w-[48rem] flex-col gap-5">
              {summaryParagraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="theme-copy text-[1.12rem] leading-[1.68] tracking-[-0.018em] lg:text-[1.44rem]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.section>
        </Container>
      ) : null}

      <CaseMediaGallery
        images={galleryImages}
        count={placeholderCount}
        motionProps={{ staggerParent, staggerChild }}
      />
    </div>
  );
}

import HeroMedia from "./HeroMedia";
import HeroText from "./HeroText";

export default function HeroSection({ hero, heroProgress }) {
  const {
    sectionRef,
    contentRef,
    progress,
    isExpanded,
    contentHeight,
    contentShellHeight,
    viewportHeight,
    baseMediaHeight
  } = heroProgress;
  const textFadeProgress = Math.min(Math.max((progress - 0.62) / 0.22, 0), 1);
  const contentCollapseProgress = Math.min(Math.max((progress - 0.76) / 0.24, 0), 1);
  const radiusProgress = progress > 0.98 ? 1 : 0;
  const shellContentSize = contentShellHeight || contentHeight || 320;
  const sectionHeight = Math.max(viewportHeight || 0, (baseMediaHeight || 0) + shellContentSize);

  return (
    <section
      ref={sectionRef}
      className="home-hero"
      style={{
        "--hero-progress": progress,
        "--hero-radius-progress": radiusProgress,
        "--hero-text-fade": textFadeProgress,
        "--hero-content-collapse": contentCollapseProgress,
        "--hero-content-size": `${shellContentSize || 320}px`,
        "--hero-section-height": `${sectionHeight || viewportHeight || 0}px`,
        "--hero-media-base": `${baseMediaHeight || 320}px`,
        "--hero-viewport-height": `${viewportHeight || 0}px`
      }}
    >
      <HeroMedia
        slides={hero.slides}
        progress={progress}
        isExpanded={isExpanded}
        onEnterFullscreen={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          heroProgress.queueProgress(1, { easing: 0.065 });
        }}
        onExitFullscreen={() => {
          heroProgress.queueProgress(0, { easing: 0.085 });
        }}
      />
      <HeroText hero={hero} progress={progress} contentRef={contentRef} />
    </section>
  );
}

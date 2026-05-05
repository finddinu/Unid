import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WorkingStyleSection from "../components/layout/WorkingStyleSection";
import HeroSection from "../components/hero/HeroSection";
import CaseGrid from "../components/cases/CaseGrid";
import Seo from "../components/Seo";
import { homeHero, publishedCaseStudies } from "../data/caseStudies";
import { useHeroProgress } from "../hooks/useHeroProgress";
import { useRevealMotion } from "../hooks/useRevealMotion";

export default function HomePage() {
  const heroProgress = useHeroProgress();
  const { reduceMotion } = useRevealMotion();
  const [headerLight, setHeaderLight] = useState(true);

  useEffect(() => {
    const storedScroll = window.sessionStorage.getItem("return-to-scroll");
    if (!storedScroll) return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Number(storedScroll), left: 0, behavior: "auto" });
      window.sessionStorage.removeItem("return-to-scroll");
    });
  }, []);

  useEffect(() => {
    const updateHeaderSurface = () => {
      const threshold = heroProgress.currentMediaHeight - 88;
      setHeaderLight(window.scrollY < threshold);
    };

    updateHeaderSurface();
    window.addEventListener("scroll", updateHeaderSurface, { passive: true });
    window.addEventListener("resize", updateHeaderSurface);

    return () => {
      window.removeEventListener("scroll", updateHeaderSurface);
      window.removeEventListener("resize", updateHeaderSurface);
    };
  }, [heroProgress.contentHeight, heroProgress.currentMediaHeight]);

  return (
    <div className="theme-page min-h-screen">
      <Seo path="/" />
      <Header light={headerLight} />
      <motion.main
        id="top"
        initial={reduceMotion ? false : { opacity: 0.001, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0.01 } : { duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroSection hero={homeHero} heroProgress={heroProgress} />
        <CaseGrid caseStudies={publishedCaseStudies} />
        <WorkingStyleSection />
      </motion.main>
      <Footer />
    </div>
  );
}

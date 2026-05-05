import { motion } from "framer-motion";
import { Navigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MoreCases from "../components/cases/MoreCases";
import CaseStudyHeader from "../components/cases/CaseStudyHeader";
import CaseStudyContent from "../components/cases/CaseStudyContent";
import Seo from "../components/Seo";
import { publishedCaseStudies } from "../data/caseStudies";
import { useCaseHeroProgress } from "../hooks/useCaseHeroProgress";
import { useLayoutEffect } from "react";
import { useRevealMotion } from "../hooks/useRevealMotion";

export default function CaseStudyPage() {
  const { caseId } = useParams();
  const caseStudy = publishedCaseStudies.find((entry) => entry.slug === caseId);
  const heroProgress = useCaseHeroProgress();
  const { reduceMotion } = useRevealMotion();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [caseId]);

  if (!caseStudy) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="theme-page min-h-screen">
      <Seo
        title={caseStudy.title}
        description={caseStudy.subtitle || caseStudy.description}
        path={`/case/${caseStudy.slug}`}
        image={caseStudy.previewImage ? `https://unid.design${caseStudy.previewImage}` : undefined}
        type="article"
      />
      <Header />
      <motion.main
        initial={reduceMotion ? false : { y: 12 }}
        animate={{ y: 0 }}
        transition={reduceMotion ? { duration: 0.01 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <CaseStudyHeader caseStudy={caseStudy} heroProgress={heroProgress} />
        <CaseStudyContent caseStudy={caseStudy} />
        <MoreCases cases={publishedCaseStudies} currentCaseId={caseStudy.id} />
      </motion.main>
      <Footer />
    </div>
  );
}

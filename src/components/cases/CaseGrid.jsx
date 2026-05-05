import { motion } from "framer-motion";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import Container from "../layout/Container";
import CaseCard from "./CaseCard";

export default function CaseGrid({ caseStudies }) {
  const { staggerParent, staggerChild } = useRevealMotion();

  return (
    <Container
      className="home-case-grid"
      data-header-surface="dark"
    >
      <motion.div {...staggerParent(0.04, 0.1)} className="home-case-grid__list">
        {caseStudies.map((caseStudy) => (
          <motion.div key={caseStudy.id} {...staggerChild}>
            <CaseCard caseStudy={caseStudy} />
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

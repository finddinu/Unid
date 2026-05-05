import { motion } from "framer-motion";
import { useRevealMotion } from "../../hooks/useRevealMotion";
import Container from "./Container";

function CapabilityIcon({ src }) {
  return <img src={src} alt="" className="h-full w-full" aria-hidden="true" />;
}

const titleLineOne = "Not big on talking - prefer showing over explaining";

const sectionLabel = "Why I’d choose to work with myself";

const capabilityGroups = [
  {
    title: "Don’t wait for tasks",
    support: "Take ownership and move the product forward",
    icon: "/assets/icons/flag.svg"
  },
  {
    title: "AI is integrated",
    support: "Explore, decide, and ship faster",
    icon: "/assets/icons/ai.svg"
  },
  {
    title: "Dev-minded design",
    support: "Easier to build, faster to implement, clearer to execute",
    icon: "/assets/icons/dev.svg"
  },
  {
    title: "Not a role I perform",
    support: "Design has been part of my life since 16 – from motion to 3D to product",
    icon: "/assets/icons/cube.svg"
  }
];

export default function WorkingStyleSection() {
  const { reveal, staggerParent, staggerChild } = useRevealMotion();

  return (
    <section className="theme-page working-style">
      <Container className="working-style__container">
        <div className="working-style__inner">
          <div className="working-style__intro">
            <motion.p
              {...reveal}
              className="theme-muted working-style__eyebrow"
            >
              {sectionLabel}
            </motion.p>

            <motion.h2
              {...reveal}
              className="theme-heading working-style__title"
            >
              {titleLineOne}
            </motion.h2>
          </div>

          <motion.div
            {...staggerParent(0.045, 0.08)}
            className="working-style__grid"
          >
            {capabilityGroups.map((group) => {
              return (
                <motion.article
                  key={group.title}
                  {...staggerChild}
                  className="working-style__item"
                >
                  <div className="working-style__icon">
                    <CapabilityIcon src={group.icon} />
                  </div>

                  <div className="working-style__copy">
                    <h3 className="theme-heading working-style__item-title">
                      {group.title}
                    </h3>
                    <p className="theme-copy working-style__item-support">
                      {group.support}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

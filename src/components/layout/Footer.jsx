import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { useRevealMotion } from "../../hooks/useRevealMotion";

const footerIcons = {
  telegram: "/assets/ui/telegram-hero.svg",
  email: "/assets/ui/mail-hero.svg",
  arrow: "/assets/icons/arrow.svg"
};

function FooterContactIcon({ src }) {
  return <img src={src} alt="" className="footer-contact__icon" aria-hidden="true" />;
}

function FooterArrowIcon() {
  return <img src={footerIcons.arrow} alt="" className="footer-cta__icon" aria-hidden="true" />;
}

const contactLinks = [
  {
    label: "Telegram",
    value: "@finddinu",
    href: "https://t.me/finddinu",
    icon: footerIcons.telegram
  },
  {
    label: "Email",
    value: "finddinu@gmail.com",
    href: "mailto:finddinu@gmail.com",
    icon: footerIcons.email
  }
];

export default function Footer() {
  const { staggerParent, staggerChild } = useRevealMotion();
  const titleRef = useRef(null);
  const [titleFit, setTitleFit] = useState(1);

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
        measuredWidth > availableWidth ? Math.max(0.5, availableWidth / measuredWidth) : 1;
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
  }, []);

  return (
    <footer className="site-footer">
      <motion.div
        {...staggerParent(0.02, 0.08)}
        className="site-footer__panel"
        data-header-surface="dark"
      >
        <motion.div {...staggerChild} className="site-footer__lead">
          <h2
            ref={titleRef}
            className="site-footer__title"
            style={{
              transform: `scale(${titleFit})`,
              transformOrigin: "top left",
              width: `calc(100% / ${titleFit})`
            }}
          >
            Ready to turn your idea into a real product?
          </h2>
          <p className="site-footer__copy">
            Product Designer with 4+ years of experience in FinTech, monetization, and
            engagement platforms.
          </p>
        </motion.div>

        <motion.a {...staggerChild} href="mailto:finddinu@gmail.com" className="site-footer__cta">
          <span>Contact</span>
          <FooterArrowIcon />
        </motion.a>

        <motion.div {...staggerChild} className="site-footer__details">
          <div className="site-footer__copy-spacer" aria-hidden="true" />
          <div className="site-footer__contacts">
            {contactLinks.map((item) => {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="footer-contact"
                >
                  <FooterContactIcon src={item.icon} />
                  <span className="footer-contact__text">
                    <span className="footer-contact__label">{item.label}</span>
                    <span className="footer-contact__value">{item.value}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...staggerChild} className="site-footer__bottom">
          <p>© 2026 UNID</p>
          <a href="#top">Back to top</a>
        </motion.div>
      </motion.div>
    </footer>
  );
}

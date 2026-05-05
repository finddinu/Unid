import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRevealMotion } from "../../hooks/useRevealMotion";

function HeaderLogo() {
  return (
    <svg
      viewBox="0 0 160.8 33"
      aria-hidden="true"
      className="h-full w-[121px] min-w-[121px] overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2759 16.5011C16.2759 20.767 19.7341 24.2252 24 24.2252C28.2659 24.2252 31.7241 20.767 31.7241 16.5011V1.50539C31.7241 0.953103 32.1719 0.505388 32.7241 0.505388H39C39.5523 0.505388 40 0.953103 40 1.50539V16.5027C39.9999 25.3377 32.8361 32.5 24.0011 32.5C15.1647 32.4999 8.00008 25.3364 8 16.5V1.5C8 0.947715 8.44772 0.5 9 0.5H15.2759C15.8281 0.5 16.2759 0.947715 16.2759 1.5V16.5011Z"
        fill="currentColor"
      />
      <g transform="translate(3 0)">
        <path
          d="M72.2683 16.4989C72.2683 12.233 68.81 8.77479 64.5441 8.77479C60.2782 8.77478 56.82 12.233 56.82 16.4989L56.82 31.4946C56.82 32.0469 56.3723 32.4946 55.82 32.4946L49.5441 32.4946C48.9918 32.4946 48.5441 32.0469 48.5441 31.4946L48.5441 16.4973C48.5442 7.66231 55.708 0.500001 64.543 0.500002C73.3794 0.500148 80.544 7.66361 80.5441 16.5L80.5441 31.5C80.5441 32.0523 80.0964 32.5 79.5441 32.5L73.2683 32.5C72.716 32.5 72.2683 32.0523 72.2683 31.5L72.2683 16.4989Z"
          fill="currentColor"
        />
      </g>
      <g transform="translate(6 0)">
        <path
          d="M96.7556 31.5594C96.4794 32.0377 95.8679 32.2016 95.3896 31.9254L89.9543 28.7874C89.476 28.5112 89.3121 27.8996 89.5882 27.4213L104.588 1.44058C104.864 0.962291 105.476 0.798416 105.954 1.07456L111.39 4.21263C111.868 4.48877 112.032 5.10036 111.756 5.57865L96.7556 31.5594Z"
          fill="currentColor"
        />
      </g>
      <g transform="translate(9 0)">
        <path
          d="M136.801 24.2241C141.067 24.2241 144.525 20.7659 144.525 16.5C144.525 12.2341 141.067 8.77586 136.801 8.77586L121.805 8.77586C121.253 8.77586 120.805 8.32815 120.805 7.77586L120.805 1.5C120.805 0.947719 121.253 0.500003 121.805 0.500003L136.802 0.500002C145.637 0.500089 152.8 7.66391 152.8 16.4989C152.8 25.3353 145.636 32.4999 136.8 32.5L121.8 32.5C121.247 32.5 120.8 32.0523 120.8 31.5L120.8 25.2241C120.8 24.6719 121.247 24.2241 121.8 24.2241L136.801 24.2241Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { reduceMotion } = useRevealMotion();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      const nearTop = nextScrollY <= 24;

      setAtTop(nearTop);

      if (nearTop) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }

      lastScrollY = nextScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -120 }}
      animate={{
        opacity: hidden ? 0 : 1,
        y: hidden ? -120 : 0
      }}
      transition={{ duration: reduceMotion ? 0.01 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      style={{ mixBlendMode: "difference" }}
    >
      <div
        className={`header-overlay pointer-events-none absolute inset-x-0 top-0 h-[156px] transition-opacity duration-300 ${
          atTop ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="site-header__inner pointer-events-auto relative z-10 flex items-center justify-between pb-0">
        <button
          type="button"
          onClick={() => {
            if (pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }
            navigate("/");
          }}
          className="site-header__brand inline-flex h-[32px] cursor-pointer items-center justify-center overflow-visible rounded-[14px] pr-1 text-white"
          aria-label="Go to homepage"
        >
          <HeaderLogo />
        </button>

        <div className="flex items-center">
          <a
            href="mailto:finddinu@gmail.com"
            className="site-header__action inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full px-5 text-[16px] font-semibold leading-5 tracking-[-0.02em] lg:min-h-[52px] lg:px-7 lg:text-[18px]"
          >
            Contact
          </a>
        </div>
      </div>
    </motion.header>
  );
}

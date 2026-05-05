import { useEffect } from "react";

const SITE_TITLE = "UNID | AI-Native Product Designer";
const SITE_DESCRIPTION =
  "AI-native product designer portfolio focused on FinTech, creator monetization, gamified investing, and conversion systems.";
const SITE_URL = "https://unid.design";
const PREVIEW_IMAGE = `${SITE_URL}/thumbnail.png`;

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export default function Seo({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = "/",
  image = PREVIEW_IMAGE,
  type = "website"
}) {
  useEffect(() => {
    const fullTitle = title === SITE_TITLE ? title : `${title} | UNID`;
    const canonical = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[property="og:image"]', { property: "og:image", content: image });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    setLink("canonical", canonical);
  }, [description, image, path, title, type]);

  return null;
}

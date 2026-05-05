export const premiumEase = [0.22, 1, 0.36, 1];
export const carouselEase = [0.22, 0.61, 0.36, 1];

export function easeOutQuart(progress) {
  return 1 - Math.pow(1 - progress, 4);
}

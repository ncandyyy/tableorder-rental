/**
 * 01 문제 공감 카드 — 휴대폰(599px 이하)에서만 Swiper 로 옆으로 넘깁니다.
 * PC 에서는 Swiper 를 끄고 피그마처럼 2 × 2 카드로 보입니다.
 * Swiper 파일: js/vendor/swiper-bundle.min.js (index.html 에서 먼저 불러옴)
 */
const mobile = window.matchMedia("(max-width: 599px)");

export function initPainSwiper() {
  const root = document.querySelector("[data-pain-slider]");
  if (!root || typeof window.Swiper !== "function") return;

  const wrapper = root.querySelector(".pain__grid");
  const slides = [...wrapper.children];
  const dots = root.querySelector(".pain__dots");
  let swiper = null;

  const enable = () => {
    if (swiper) return;
    root.classList.add("swiper");
    wrapper.classList.add("swiper-wrapper");
    slides.forEach((s) => s.classList.add("swiper-slide"));
    swiper = new window.Swiper(root, {
      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 14,
      speed: 450,
      grabCursor: true,
      // 세로 스크롤은 그대로, 옆으로 쓸 때만 넘김
      touchAngle: 35,
      threshold: 6,
      resistanceRatio: 0.6,
      pagination: { el: dots, clickable: true },
      a11y: { enabled: true, prevSlideMessage: "이전 카드", nextSlideMessage: "다음 카드" },
      on: {
        // 넘겨서 보이게 된 카드의 말풍선도 톡 나오게
        slideChange(sw) {
          sw.slides[sw.activeIndex]?.classList.add("is-in");
        },
      },
    });
  };

  const disable = () => {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
    root.classList.remove("swiper");
    wrapper.classList.remove("swiper-wrapper");
    wrapper.removeAttribute("style");
    slides.forEach((s) => {
      s.classList.remove("swiper-slide", "swiper-slide-active", "swiper-slide-next", "swiper-slide-prev");
      s.removeAttribute("style");
    });
  };

  const sync = () => (mobile.matches ? enable() : disable());
  sync();
  mobile.addEventListener("change", sync);
}

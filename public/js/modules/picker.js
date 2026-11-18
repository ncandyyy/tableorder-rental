/**
 * 04 제품 고르기
 *
 * 제품 카드 줄 ([data-picker-track])
 *  - 옆으로 넘기면 가운데 온 카드가 선택되고, 카드를 누르면 그 카드가 가운데로 옵니다.
 *  - 처음에는 티오더(가운데 카드)가 선택돼 있습니다.
 *
 * 기능 슬라이드 ([data-feat]) — 제품마다 3장
 *  - 칩을 누르거나, 좌우로 쓸어 넘기면 바뀝니다. 화면에 보이는 동안 CONFIG.FEATURE_INTERVAL 마다 자동으로 넘어갑니다.
 *  - 영상 슬라이드는 그 슬라이드가 보일 때만 재생합니다 (데이터·배터리 절약).
 */
import { CONFIG } from "../config.js";
import { track } from "./analytics.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function initPicker() {
  const root = document.querySelector("[data-picker]");
  if (!root) return;

  const track$ = root.querySelector("[data-picker-track]");
  const cards = [...root.querySelectorAll("[data-product]")];
  const sliders = new Map();
  root.querySelectorAll("[data-feat]").forEach((el) => sliders.set(el.dataset.feat, createSlider(el)));

  let current = cards.find((c) => c.getAttribute("aria-selected") === "true")?.dataset.product || cards[0].dataset.product;

  const select = (id, { scroll = true, smooth = true } = {}) => {
    const card = cards.find((c) => c.dataset.product === id);
    if (!card) return;
    if (scroll) centerCard(card, smooth);
    if (id === current && sliders.get(id)?.el.hidden === false) return;
    current = id;
    cards.forEach((c) => c.setAttribute("aria-selected", String(c === card)));
    sliders.forEach((s, key) => s.show(key === id));
  };

  function centerCard(card, smooth) {
    const left = card.offsetLeft - (track$.clientWidth - card.offsetWidth) / 2;
    track$.scrollTo({ left, behavior: smooth && !reduceMotion.matches ? "smooth" : "auto" });
  }

  cards.forEach((card) =>
    card.addEventListener("click", () => {
      select(card.dataset.product);
      track("product_pick", { product: card.dataset.product });
    }),
  );

  // 손으로 넘겼을 때: 멈춘 위치에서 가운데에 가장 가까운 카드를 선택
  let scrollTimer;
  track$.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const mid = track$.scrollLeft + track$.clientWidth / 2;
        let best = cards[0];
        let dist = Infinity;
        cards.forEach((c) => {
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (d < dist) {
            dist = d;
            best = c;
          }
        });
        select(best.dataset.product, { scroll: false });
      }, 120);
    },
    { passive: true },
  );

  // 처음: 선택된 카드를 가운데로 (애니메이션 없이)
  const initial = () => select(current, { smooth: false });
  initial();
  window.addEventListener("load", initial, { once: true });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => centerCard(cards.find((c) => c.dataset.product === current), false), 150);
  });

  sliders.forEach((s, key) => s.show(key === current, true));
}

/* =========================================================
   기능 슬라이드 하나 (칩 3개 + 슬라이드 3장)
   ========================================================= */
function createSlider(el) {
  const viewport = el.querySelector("[data-feat-viewport]");
  const trackEl = el.querySelector("[data-feat-track]");
  const slides = [...trackEl.children];
  const chips = [...el.querySelectorAll("[data-go]")];
  const dots = [...el.querySelectorAll(".feat__dots i")];
  const n = slides.length;
  let index = 0;
  let timer = null;
  let inView = false;
  let active = !el.hidden;

  const go = (i, user = false) => {
    index = (i + n) % n;
    trackEl.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    slides.forEach((s, k) => {
      const on = k === index;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", String(!on));
    });
    chips.forEach((c, k) => c.setAttribute("aria-selected", String(k === index)));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
    syncVideos();
    if (user) restart();
  };

  function syncVideos() {
    slides.forEach((s, k) => {
      const v = s.querySelector("video");
      if (!v) return;
      if (active && inView && k === index) {
        v.preload = "auto";
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  function restart() {
    clearInterval(timer);
    timer = null;
    if (!active || !inView || reduceMotion.matches) return;
    timer = setInterval(() => go(index + 1), CONFIG.FEATURE_INTERVAL || 4500);
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      go(Number(chip.dataset.go), true);
      track("feature_chip", { product: el.dataset.feat, index: Number(chip.dataset.go) });
    }),
  );

  /* ---------- 쓸어 넘기기 (손가락 · 마우스) ---------- */
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  let decided = false;

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dragging = true;
    decided = false;
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const mx = e.clientX - startX;
    const my = e.clientY - startY;
    if (!decided) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      decided = true;
      if (Math.abs(my) > Math.abs(mx)) {
        dragging = false; // 세로 스크롤
        return;
      }
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
      trackEl.classList.add("is-dragging");
      clearInterval(timer);
    }
    dx = mx;
    const w = viewport.clientWidth || 1;
    // 처음/끝에서는 살짝만 끌림
    const edge = (index === 0 && dx > 0) || (index === n - 1 && dx < 0) ? 0.35 : 1;
    trackEl.style.transform = `translate3d(calc(${-index * 100}% + ${dx * edge}px), 0, 0)`;
    if (w) e.preventDefault();
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    trackEl.classList.remove("is-dragging");
    if (!decided) return;
    const w = viewport.clientWidth || 1;
    if (Math.abs(dx) > Math.min(80, w * 0.18)) {
      const next = index + (dx < 0 ? 1 : -1);
      go(Math.max(0, Math.min(n - 1, next)), true);
    } else {
      go(index, true);
    }
  };
  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
  // 끌다가 놓은 뒤 생기는 클릭 무시
  viewport.addEventListener(
    "click",
    (e) => {
      if (Math.abs(dx) > 6) e.preventDefault();
    },
    true,
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        restart();
        syncVideos();
      },
      { threshold: 0.35 },
    ).observe(viewport);
  }

  go(0);

  return {
    el,
    show(on, initial = false) {
      el.hidden = !on;
      active = on;
      if (on && !initial) go(0);
      restart();
      syncVideos();
    },
  };
}

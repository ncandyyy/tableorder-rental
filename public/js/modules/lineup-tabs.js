/**
 * 02 테이블오더 3종 — 탭(KT 하이오더 / 티오더 / 업오더)을 누르면 위 기기 사진에서 그 제품만 컬러가 되고
 * 아래 매장 사진 줄이 바뀝니다.
 * 키보드: 좌우 화살표로 탭 이동
 */
import { track } from "./analytics.js";

export function initLineupTabs() {
  const list = document.querySelector("[data-lineup-tabs]");
  if (!list) return;
  const tabs = [...list.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-lineup-panel]")];
  const devices = document.querySelector("[data-lineup-devices]");

  const select = (tab, focus = false) => {
    const id = tab.dataset.tab;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.dataset.lineupPanel === id;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
    if (devices) devices.dataset.active = id; // 고른 제품만 컬러
    if (focus) tab.focus();
    // 숨어 있던 사진 줄은 폭이 0 이라 흐름(marquee)을 다시 계산해야 합니다
    window.dispatchEvent(new Event("resize"));
  };

  tabs.forEach((tab, i) => {
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
    tab.addEventListener("click", () => {
      select(tab);
      track("lineup_tab", { product: tab.dataset.tab });
    });
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      select(next, true);
    });
  });
}

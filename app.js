/* Holofex Studio — UI prototype navigation & demo flows */

const screens = document.querySelectorAll(".screen");
const nav = document.getElementById("bottom-nav");
const navButtons = nav.querySelectorAll(".nav-btn");

const NAV_SCREENS = ["screen-home", "screen-library", "screen-devices", "screen-profile"];
const NO_NAV_SCREENS = ["screen-splash", "screen-create", "screen-generating", "screen-preview"];

function show(screenId) {
  screens.forEach((s) => s.classList.toggle("active", s.id === screenId));
  nav.classList.toggle("visible", !NO_NAV_SCREENS.includes(screenId));
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.go === screenId));
  const active = document.getElementById(screenId);
  const scroller = active && active.querySelector(".scroll");
  if (scroller) scroller.scrollTop = 0;
}

/* generic navigation: any element with data-go */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (!target) return;
  const mode = target.dataset.mode;
  if (mode) selectMode(mode);
  show(target.dataset.go);
});

/* splash → home */
setTimeout(() => show("screen-home"), 2400);

/* create: mode tabs */
const tabs = document.querySelectorAll(".seg-tab");
const panes = document.querySelectorAll(".tab-pane");

function selectMode(mode) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === mode));
  panes.forEach((p) => p.classList.toggle("active", p.dataset.pane === mode));
}

tabs.forEach((tab) =>
  tab.addEventListener("click", () => selectMode(tab.dataset.tab))
);

/* style + filter chips: single-select within their row */
document.querySelectorAll(".chip-row").forEach((row) => {
  row.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

/* toggles */
document.querySelectorAll(".toggle").forEach((t) =>
  t.addEventListener("click", () => {
    t.classList.toggle("on");
    t.setAttribute("aria-pressed", t.classList.contains("on"));
  })
);

/* fake generation flow */
const GEN_STEPS = [
  [0, "Dreaming up your 3D model…"],
  [22, "Building geometry and lighting…"],
  [48, "Rendering hologram frames…"],
  [72, "Colour-grading for fan display…"],
  [90, "Creating seamless loop…"],
  [100, "Done — preparing preview"],
];

let genTimer = null;

document.getElementById("btn-generate").addEventListener("click", () => {
  show("screen-generating");
  const fill = document.getElementById("gen-bar-fill");
  const pct = document.getElementById("gen-pct");
  const status = document.getElementById("gen-status");
  let progress = 0;
  let step = 0;

  clearInterval(genTimer);
  fill.style.width = "0%";

  genTimer = setInterval(() => {
    progress = Math.min(progress + 2 + Math.random() * 3, 100);
    while (step < GEN_STEPS.length - 1 && progress >= GEN_STEPS[step + 1][0]) step++;
    status.textContent = GEN_STEPS[step][1];
    fill.style.width = progress + "%";
    pct.textContent = Math.round(progress) + "%";
    if (progress >= 100) {
      clearInterval(genTimer);
      setTimeout(() => show("screen-preview"), 600);
    }
  }, 110);
});

/* cancel generation cleans up the timer */
document.querySelector("#screen-generating [data-go]").addEventListener("click", () =>
  clearInterval(genTimer)
);

// theme toggle
document.getElementById("theme").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// live waterloo time
const clock = document.getElementById("clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
  });
  const tick = () => { clock.textContent = fmt.format(new Date()).toLowerCase().replace(/\./g, ""); };
  tick();
  setInterval(tick, 10_000);
}

// fun site stats: total bytes transferred + load time
window.addEventListener("load", () => {
  setTimeout(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource");
    const bytes = [nav, ...res].reduce((s, e) => s + (e ? (e.transferSize || e.encodedBodySize || 0) : 0), 0);
    const ms = nav ? Math.round(nav.loadEventStart || nav.domContentLoadedEventEnd) : null;
    const w = document.getElementById("weight");
    const l = document.getElementById("load");
    if (w && bytes) w.textContent = (bytes / 1024).toFixed(1) + " kb";
    if (l && ms) l.textContent = ms + " ms";
  }, 0);
});

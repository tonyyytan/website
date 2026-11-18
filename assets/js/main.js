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

/* ───────────── easter eggs ───────────── */

// toast helper
const toast = (msg, ms = 2600) => {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), ms);
};

// 1. hello to anyone who opens devtools
console.log(
  "%c tony tan %c\n\nhey, you opened devtools. respect.\nthis page runs on 0 gpus, which honestly feels wrong.\ntry the konami code, or type 'gpu', 'cpu', or 'sudo' on the page.\n",
  "background:#c2410c;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px",
  "color:inherit"
);

// 2. tab title when you leave
const realTitle = document.title;
document.addEventListener("visibilitychange", () => {
  document.title = document.hidden ? "come back, the gpus miss you 👀" : realTitle;
});

// 3. poke the status dot
const dot = document.querySelector(".dot");
if (dot) {
  let pokes = 0;
  const lines = ["hey", "that tickles", "stop poking the dot", "ok fine, it's validated ✅", "thermal throttling…"];
  dot.style.cursor = "pointer";
  dot.addEventListener("click", () => {
    toast(lines[Math.min(pokes, lines.length - 1)]);
    pokes++;
  });
}

// 4. konami code → overclock mode
const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let kIdx = 0;

// 5. secret words typed anywhere
let typed = "";
const words = {
  gpu: () => toast("🟩 launched 1,048,576 threads… done in 0.3 ms"),
  cpu: () => { toast("🐢 cpu is thinking…", 3200); setTimeout(() => toast("🐢 …done. sequentially."), 3300); },
  sudo: () => toast("tony is not in the sudoers file. this incident will be reported."),
  hire: () => toast("📬 tan.tony207@gmail.com, i reply fast", 4000),
};

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;

  kIdx = e.key === konami[kIdx] || e.key.toLowerCase() === konami[kIdx] ? kIdx + 1 : (e.key === konami[0] ? 1 : 0);
  if (kIdx === konami.length) {
    kIdx = 0;
    const on = document.documentElement.classList.toggle("oc");
    toast(on ? "⚡ overclocked: core clock boosted to 9.9 ghz" : "back to stock clocks. warranty restored.");
  }

  if (e.key.length === 1) {
    typed = (typed + e.key.toLowerCase()).slice(-10);
    for (const w in words) if (typed.endsWith(w)) { words[w](); typed = ""; }
  }
});

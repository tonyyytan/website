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
  "%c tony tan %c\n\nhey, you opened devtools. respect.\nthis page runs on 0 gpus, which honestly feels wrong.\nclick my name for a list of easter eggs.\n",
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

// 4. secret words typed anywhere
let typed = "";
const words = {
  gpu: () => toast("🟩 launched 1,048,576 threads… done in 0.3 ms"),
  cpu: () => { toast("🐢 cpu is thinking…", 3200); setTimeout(() => toast("🐢 …done. sequentially."), 3300); },
  sudo: () => toast("tony is not in the sudoers file. this incident will be reported."),
  hire: () => toast("📬 tan.tony207@gmail.com, i reply fast", 4000),
  smi: () => openSmi(),
};

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;

  if (e.key.length === 1) {
    typed = (typed + e.key.toLowerCase()).slice(-10);
    for (const w in words) if (typed.endsWith(w)) { words[w](); typed = ""; }
  }
});

// 5. nvidia-smi for the website (type "smi")
const startedAt = Date.now();
let smiTimer = null;

const pad = (v, n) => String(v).padEnd(n).slice(0, n);
const lpad = (v, n) => String(v).padStart(n).slice(-n);

function smiText() {
  const secs = (Date.now() - startedAt) / 1000;
  const temp = Math.min(34 + Math.floor(secs / 6), 87);
  const throttled = temp >= 85;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - innerHeight;
  const util = scrollable > 0 ? Math.round((scrollY / scrollable) * 100) : 100;
  const pwr = Math.round(18 + util * 3.2 + (secs % 7));
  const kb = (document.getElementById("weight")?.textContent || "5 kb").replace(" kb", "");
  const mem = Math.max(1, Math.round(parseFloat(kb) / 1024 * 100) / 100 || 1);
  const now = new Date().toString().split(" (")[0];
  const W = 61;
  const line = (s) => "| " + pad(s, W - 4) + " |";
  const bar = "+" + "-".repeat(W - 2) + "+";
  const sep = "|" + "=".repeat(W - 2) + "|";
  return [
    now,
    bar,
    line("TONY-SMI 1.0    Driver: tonytan.dev    CUDA: 0 (sadly)"),
    sep,
    line("GPU  Name          Temp   Perf  Pwr:Usage/Cap      Util"),
    line(` 0   tonytan.dev   ${lpad(temp, 3)}C   ${throttled ? "P8" : "P0"}    ${lpad(pwr, 3)}W / 450W      ${lpad(util, 3)}%`),
    line(`     Memory: ${mem} MiB / 24576 MiB   ${throttled ? "!! thermal throttling" : "fan: vibing"}`),
    bar,
    "",
    bar,
    line("Processes:"),
    line(" PID   Name                                       Usage"),
    sep,
    line("  1    gpu-validation @ intel                   100%"),
    line("  2    gpu-systems @ wat.ai                      90%"),
    line("  3    gpus-vs-cpus.md (writing)                 12%"),
    line("  4    sleep                                      0%"),
    bar,
    "",
    "press esc or click anywhere to close",
  ].join("\n");
}

function closeSmi() {
  document.getElementById("smi")?.remove();
  clearInterval(smiTimer);
}

function openSmi() {
  if (document.getElementById("smi")) return closeSmi();
  const wrap = document.createElement("div");
  wrap.id = "smi";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-label", "nvidia-smi");
  const pre = document.createElement("pre");
  wrap.appendChild(pre);
  document.body.appendChild(wrap);
  const draw = () => { pre.textContent = "$ nvidia-smi\n" + smiText(); };
  draw();
  smiTimer = setInterval(draw, 500);
  wrap.addEventListener("click", closeSmi);
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSmi(); });
document.getElementById("smi-open")?.addEventListener("click", openSmi);

// 6. view counter (cloudflare pages function + kv; hidden if unavailable)
(async () => {
  const el = document.getElementById("views");
  if (!el) return;
  const path = location.pathname;
  let counted = false;
  try { counted = sessionStorage.getItem("seen:" + path) === "1"; } catch (e) {}
  try {
    const res = await fetch("/api/views?path=" + encodeURIComponent(path), { method: counted ? "GET" : "POST" });
    if (!res.ok) return;
    const { views } = await res.json();
    if (typeof views !== "number") return;
    try { sessionStorage.setItem("seen:" + path, "1"); } catch (e) {}
    const isPost = document.body.classList.contains("post");
    el.textContent = isPost ? ` · ${views.toLocaleString()} views` : ` · visitor #${views.toLocaleString()}`;
    el.hidden = false;
  } catch (e) {}
})();

// 7. click the name (on the homepage) for a list of easter eggs
const nameEl = document.querySelector(".name");
if (nameEl && location.pathname === "/") {
  const menu = document.createElement("div");
  menu.id = "eggs";
  menu.hidden = true;
  menu.innerHTML = `
    <p class="eggs-title">🥚 easter eggs</p>
    <ul>
      <li>type <kbd>smi</kbd></li>
      <li>type <kbd>gpu</kbd>, <kbd>cpu</kbd>, <kbd>sudo</kbd>, or <kbd>hire</kbd></li>
      <li>poke the green dot</li>
      <li>switch tabs, then come back</li>
      <li>open devtools</li>
    </ul>`;
  nameEl.closest("header").appendChild(menu);
  nameEl.setAttribute("aria-expanded", "false");
  nameEl.addEventListener("click", (e) => {
    e.preventDefault();
    menu.hidden = !menu.hidden;
    nameEl.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== nameEl) {
      menu.hidden = true;
      nameEl.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.hidden = true; });
}

// 8. reading time on blog posts (~230 words per minute, counted from the post body)
const readEl = document.getElementById("read-time");
const prose = document.querySelector(".prose");
if (readEl && prose) {
  const words = (prose.innerText.match(/\S+/g) || []).length;
  if (words > 150) {
    readEl.textContent = `${Math.max(1, Math.round(words / 230))} min read · `;
    readEl.hidden = false;
  }
}

// 9. table of contents on blog posts: numbered, nested, highlights the section you're reading
if (prose) {
  const heads = [...prose.querySelectorAll("h2, h3")];
  if (heads.length >= 3) {
    const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const toc = document.createElement("details");
    toc.className = "toc";
    toc.open = matchMedia("(min-width: 1200px)").matches;
    const sections = heads.filter((h) => h.tagName === "H2").length;
    toc.innerHTML = `<summary>on this page <span>${sections} sections</span></summary><div class="toc-progress"><i></i></div>`;
    const root = document.createElement("ol");
    const links = [];
    let parent = null;
    for (const h of heads) {
      if (!h.id) h.id = slug(h.textContent);
      const m = h.textContent.match(/^(\d+(?:\.\d+)?)\.?\s+(.*)$/);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.innerHTML = m ? `<span class="toc-num">${m[1]}</span>${m[2]}` : h.textContent;
      li.appendChild(a);
      links.push({ h, li, a });
      if (h.tagName === "H2") {
        root.appendChild(li);
        parent = li;
      } else if (parent) {
        let sub = parent.querySelector("ol");
        if (!sub) { sub = document.createElement("ol"); parent.appendChild(sub); }
        sub.appendChild(li);
      } else {
        root.appendChild(li);
      }
    }
    toc.appendChild(root);

    // on wide screens the toc is a fixed sidebar, so it lives directly in <body>
    // (an animated ancestor would otherwise trap position: fixed)
    const wide = matchMedia("(min-width: 1200px)");
    const place = () => {
      if (wide.matches) { document.body.appendChild(toc); toc.open = true; }
      else prose.before(toc);
    };
    place();
    wide.addEventListener("change", place);

    // highlight the current section while scrolling
    const update = () => {
      let cur = links[0];
      for (const l of links) if (l.h.getBoundingClientRect().top < 140) cur = l;
      for (const l of links) l.li.classList.remove("active", "current");
      cur.li.classList.add("current");
      const top = cur.h.tagName === "H2" ? cur.li : cur.li.parentElement.closest("li");
      if (top) top.classList.add("active");
    };
    const bar = toc.querySelector(".toc-progress i");
    const progress = () => {
      const r = prose.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (innerHeight * 0.4 - r.top) / r.height));
      bar.style.width = (pct * 100).toFixed(1) + "%";
    };
    addEventListener("scroll", () => { update(); progress(); }, { passive: true });
    update();
    progress();
  }
}

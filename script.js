const panels = [...document.querySelectorAll(".panel")];
const progress = document.querySelector(".progress span");
const root = document.documentElement;

const visitCounter = document.querySelector(".visit-counter");

async function updateVisitCounter() {
  if (!visitCounter) return;

  const endpoint = document
    .querySelector('meta[name="visitor-counter-endpoint"]')
    ?.content.trim()
    .replace(/\/$/, "");
  const status = visitCounter.querySelector("[data-counter-status]");

  if (!endpoint) {
    visitCounter.dataset.state = "unconfigured";
    status.textContent = "等待云端接入";
    return;
  }

  visitCounter.dataset.state = "loading";
  status.textContent = "正在统计";

  try {
    const response = await fetch(`${endpoint}/api/visit`, {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Counter request failed: ${response.status}`);

    const data = await response.json();
    const counts = data.counts || {};
    visitCounter.querySelectorAll("[data-country]").forEach((item) => {
      const value = Number(counts[item.dataset.country] || 0);
      item.textContent = new Intl.NumberFormat("zh-CN", { notation: "compact" }).format(value);
    });

    visitCounter.dataset.state = "ready";
    status.textContent = `累计 ${new Intl.NumberFormat("zh-CN").format(Number(data.total || 0))} 次浏览`;
  } catch (error) {
    console.warn("访问统计暂时不可用", error);
    visitCounter.dataset.state = "offline";
    status.textContent = "统计暂时离线";
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.querySelectorAll("video").forEach((video) => video.pause());
      }
    });
  },
  { threshold: 0.28 },
);

panels.forEach((panel) => observer.observe(panel));

let ticking = false;

function updateScene() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  const firstScreen = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);

  progress.style.transform = `scaleX(${ratio})`;
  root.style.setProperty("--themis-shift", `${firstScreen * -22}px`);
  root.style.setProperty("--d1-shift", `${firstScreen * 18}px`);
  root.style.setProperty("--themis-opacity", "0.94");
  root.style.setProperty("--d1-opacity", "0.92");
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScene);
      ticking = true;
    }
  },
  { passive: true },
);

document.querySelectorAll(".media-shell img").forEach((image) => {
  if (image.complete && image.naturalWidth === 0) image.style.display = "none";
  image.addEventListener("error", () => {
    image.style.display = "none";
  });
});

document.querySelectorAll(".media-shell video").forEach((video) => {
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.style.display = "none";
  video.addEventListener("error", () => {
    video.style.display = "none";
  });
});

document.querySelectorAll(".media-grid").forEach((carousel) => {
  const cards = [...carousel.querySelectorAll(".media-shell")];
  let activeIndex = 0;
  let startX = null;

  const pagination = document.createElement("div");
  pagination.className = "media-pagination";
  pagination.innerHTML = `
    <span class="media-pagination__count"></span>
    <span class="media-pagination__dots">
      ${cards.map(() => '<i class="media-pagination__dot"></i>').join("")}
    </span>
    <span class="media-pagination__hint">左右点击切换</span>
  `;
  carousel.appendChild(pagination);

  const hint = document.createElement("div");
  hint.className = "media-hint";
  hint.innerHTML = '<span class="media-hint__title"></span>';
  carousel.appendChild(hint);
  const hintTitle = hint.querySelector(".media-hint__title");

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "media-nav media-nav--prev";
  prevBtn.setAttribute("aria-label", "上一张");
  prevBtn.innerHTML = '<span aria-hidden="true">‹</span>';
  prevBtn.addEventListener("click", () => select(activeIndex - 1));

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "media-nav media-nav--next";
  nextBtn.setAttribute("aria-label", "下一张");
  nextBtn.innerHTML = '<span aria-hidden="true">›</span>';
  nextBtn.addEventListener("click", () => select(activeIndex + 1));

  carousel.appendChild(prevBtn);
  carousel.appendChild(nextBtn);
  if (cards.length <= 1) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
  }

  const count = pagination.querySelector(".media-pagination__count");
  const dots = [...pagination.querySelectorAll(".media-pagination__dot")];

  function render(playSelectedVideo = false) {
    cards.forEach((card, index) => {
      const delta = (index - activeIndex + cards.length) % cards.length;
      card.classList.remove("is-active", "is-prev", "is-next", "is-hidden");

      if (delta === 0) card.classList.add("is-active");
      else if (delta === 1) card.classList.add("is-next");
      else if (delta === cards.length - 1) card.classList.add("is-prev");
      else card.classList.add("is-hidden");

      const video = card.querySelector("video");
      if (video) {
        const isActive = delta === 0;
        video.controls = isActive;
        if (!isActive) {
          video.pause();
          video.currentTime = 0;
        } else if (playSelectedVideo && video.style.display !== "none") {
          video.play().catch(() => {});
        }
      }
    });

    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));

    const activeCard = cards[activeIndex];
    hintTitle.textContent = activeCard.dataset.title
      || (activeCard.querySelector("img")?.alt || "")
      || (activeCard.querySelector(".media-placeholder")?.textContent || "");
  }

  function select(index, playSelectedVideo = true) {
    activeIndex = (index + cards.length) % cards.length;
    render(playSelectedVideo);
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      if (index === activeIndex || event.target.closest("video")) return;
      select(index);
    });
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (event.target.closest("video") || event.target.closest(".media-nav")) return;
    startX = event.clientX;
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    if (Math.abs(distance) < 42) return;
    select(activeIndex + (distance < 0 ? 1 : -1));
  });

  carousel.addEventListener("pointercancel", () => {
    startX = null;
  });

  carousel.tabIndex = 0;
  carousel.setAttribute("aria-label", "项目图片与视频轮播，可使用左右方向键切换");
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") select(activeIndex + 1);
    if (event.key === "ArrowLeft") select(activeIndex - 1);
  });

  render();
});

updateScene();
updateVisitCounter();

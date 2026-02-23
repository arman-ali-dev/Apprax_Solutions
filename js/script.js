// ===================== SCROLL REVEAL =====================
// Single observer — handles ALL reveal classes
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-left2, .reveal-right2",
  )
  .forEach((el) => revealObserver.observe(el));

// ===================== UNDERLINE TRIGGERS =====================
function initUnderline(blockId, textId) {
  const block = document.getElementById(blockId);
  const text = document.getElementById(textId);
  if (!block || !text) return;

  const ulObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          text.classList.add("visible");
          ulObs.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );
  ulObs.observe(block);
}

initUnderline("heading-block", "underline-text"); // services section
initUnderline("heading-block2", "underline-text2"); // how we work section
initUnderline("proj-heading", "proj-underline"); // projects section

// ===================== SVG PATH DRAW =====================
const pathSvg = document.getElementById("paths-svg");
if (pathSvg) {
  const pathObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ["p1", "p2", "p3", "p4"].forEach((id, i) => {
            setTimeout(() => {
              document.getElementById(id)?.classList.add("drawn");
            }, i * 500);
          });
          pathObs.disconnect();
        }
      });
    },
    { threshold: 0.05 },
  );
  pathObs.observe(pathSvg);
}

// ===================== SLIDER LOGIC =====================
const track = document.getElementById("slider-track");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const dotsEl = document.getElementById("dots-container");

if (track && prevBtn && nextBtn && dotsEl) {
  const cards = track.querySelectorAll(".slide-card");
  const totalCards = cards.length;
  const visibleCount = 2;
  const maxIndex = totalCards - visibleCount;
  let current = 0;

  // Build dots
  for (let i = 0; i <= maxIndex; i++) {
    const dot = document.createElement("div");
    dot.className = "prog-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  }

  function getCardWidth() {
    return cards[0].getBoundingClientRect().width + 21;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    // Smooth transition on arrow/dot click, none during drag
    track.style.transition = "transform 0.55s cubic-bezier(.4,0,.2,1)";
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateUI();
  }

  function updateUI() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex;
    dotsEl.querySelectorAll(".prog-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // ===== MOUSE DRAG (cursor) support =====
  let isDragging = false;
  let dragStartX = 0;
  let dragCurrentX = 0;
  let baseOffset = 0;

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    baseOffset = current * getCardWidth();
    track.style.transition = "none"; // disable smooth during drag
    track.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
    const diff = dragStartX - dragCurrentX;
    // Live follow finger — clamp so it doesn't go beyond edges
    const rawOffset = baseOffset + diff;
    const clamped = Math.max(0, Math.min(rawOffset, maxIndex * getCardWidth()));
    track.style.transform = `translateX(-${clamped}px)`;
  });

  document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "grab";

    const diff = dragStartX - e.clientX;
    // Snap to next/prev if dragged more than 60px
    if (Math.abs(diff) > 60) {
      goTo(diff > 0 ? current + 1 : current - 1);
    } else {
      // Snap back to current
      goTo(current);
    }
  });

  // Cancel drag if mouse leaves window
  document.addEventListener("mouseleave", () => {
    if (isDragging) {
      isDragging = false;
      track.style.cursor = "grab";
      goTo(current);
    }
  });

  // ===== TOUCH / SWIPE support =====
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      track.style.transition = "none";
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      const diff = touchStartX - e.touches[0].clientX;
      const rawOffset = current * getCardWidth() + diff;
      const clamped = Math.max(
        0,
        Math.min(rawOffset, maxIndex * getCardWidth()),
      );
      track.style.transform = `translateX(-${clamped}px)`;
    },
    { passive: true },
  );

  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    else goTo(current);
  });

  // Recalc on resize
  window.addEventListener("resize", () => {
    track.style.transition = "none";
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
  });

  // Set grab cursor on track
  track.style.cursor = "grab";

  // Init
  updateUI();
}

const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

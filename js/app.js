/* ==========================================================================
   Resume app — renders the bilingual (EN/FA) resume from a JSON file.
   Expected JSON shape: { translations, personal, about, skills, experience,
   education, projects, languages }  (personal.photo = "/media/profile.png")
   ========================================================================== */

(() => {
  "use strict";

  // ---- Config -------------------------------------------------------------
  const DATA_URL = "./data/resume.json"; // change to wherever your JSON lives
  const DEFAULT_LANG = "en";
  const PHOTO_FALLBACK = "/media/profile.png";

  // Persian UI strings (the English ones also come from data.translations).
  const UI_FA = {
    nav: {
      experience: "تجربه‌ها",
      skills: "مهارت‌ها",
      education: "تحصیلات",
      projects: "پروژه‌ها",
    },
    sections: {
      about: "درباره من",
      experience: "تجربه‌ها",
      skills: "مهارت‌ها",
      education: "تحصیلات",
      projects: "پروژه‌ها",
      teaching: "تدریس",
      languages: "زبان‌ها",
    },
  };

  const UI_EN_FALLBACK = {
    nav: {
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      projects: "Projects",
    },
    sections: {
      about: "About",
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      projects: "Projects",
      teaching: "Teaching",
      languages: "Languages",
    },
  };

  const MONTHS_FA = {
    Jan: "ژانویه",
    Feb: "فوریه",
    Mar: "مارس",
    Apr: "آوریل",
    May: "مه",
    Jun: "ژوئن",
    Jul: "ژوئیه",
    Aug: "اوت",
    Sep: "سپتامبر",
    Oct: "اکتبر",
    Nov: "نوامبر",
    Dec: "دسامبر",
  };

  // ---- State --------------------------------------------------------------
  let data = null;
  let lang = DEFAULT_LANG;

  // ---- Small helpers ------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* storage unavailable — ignore */
      }
    },
  };

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  /** Pick the current-language value from {en, fa}, or return plain strings. */
  const t = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] ?? value.en ?? "";
  };

  const getPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

  const toFaDigits = (str) => str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  /** "Jul 2025" -> "ژوئیه ۲۰۲۵" in Persian; "Present" -> "تاکنون". */
  const formatDate = (value) => {
    if (!value) return "";
    if (lang !== "fa") return value;
    if (/^present$/i.test(value)) return "تاکنون";
    const translated = value.replace(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g,
      (m) => MONTHS_FA[m]
    );
    return toFaDigits(translated);
  };

  const dateRange = (start, end) =>
    `${formatDate(start)} — ${formatDate(end)}`;

  const uiString = (path) => {
    const fromData = getPath(data?.translations, path);
    const en = fromData ?? getPath(UI_EN_FALLBACK, path) ?? "";
    if (lang === "fa") return getPath(UI_FA, path) ?? en;
    return en;
  };

  // ---- Renderers ----------------------------------------------------------
  const LINK_CLASS =
    "inline-flex items-center rounded-[9px] border border-line bg-surface px-3.5 py-2 text-[0.85rem] text-ink transition-colors hover:border-accent hover:text-accent";

  function renderLinks() {
    const container = $("#heroLinks");
    if (!container) return;
    const links = data.personal?.links ?? [];

    container.innerHTML = links
      .map((link) => {
        const url = link.url ?? "#";
        const isWeb = /^https?:\/\//i.test(url);
        const isContact = /^(tel:|mailto:)/i.test(url);
        const attrs = [
          `href="${esc(url)}"`,
          `class="${LINK_CLASS}"`,
          isWeb ? 'target="_blank" rel="noopener noreferrer"' : "",
          isContact ? 'dir="ltr"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${esc(t(link.label))}</a>`;
      })
      .join("");
  }

  function renderPhoto() {
    const img = $("#profilePhoto");
    if (!img) return;

    const src = data.personal?.photo || PHOTO_FALLBACK;
    if (!src) {
      img.remove();
      return;
    }

    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    img.alt = t(data.personal?.name);
    img.onerror = () => img.remove(); // hide cleanly if the file is missing
  }

  function renderSkills() {
    const container = $("#skillList");
    if (!container) return;
    container.innerHTML = (data.skills ?? [])
      .map(
        (skill) =>
          `<span class="rounded-md border border-line bg-surface px-2.5 py-1 text-[0.8rem] text-ink">${esc(
            t(skill.name)
          )}</span>`
      )
      .join("");
  }

  function renderLanguages() {
    const container = $("#languageList");
    if (!container) return;
    container.innerHTML = (data.languages ?? [])
      .map(
        (item) =>
          `<div class="flex gap-3">
            <span class="text-ink">${esc(t(item.name))}</span>
            <span>${esc(t(item.level))}</span>
          </div>`
      )
      .join("");
  }

  function renderExperience() {
    const container = $("#experienceList");
    if (!container) return;
    container.innerHTML = (data.experience ?? [])
      .map(
        (job) => `
        <article class="grid gap-2 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6">
          <div class="text-[0.82rem] text-muted">${esc(
            dateRange(job.start, job.end)
          )}</div>
          <div>
            <h3 class="font-semibold text-ink">${esc(t(job.position))}</h3>
            <p class="text-[0.9rem] text-accent">${esc(job.company)}</p>
            <div class="mt-3 text-muted [&_li]:mb-1.5 [&_ul]:list-disc [&_ul]:ps-5">${t(
              job.description
            )}</div>
          </div>
        </article>`
      )
      .join("");
  }

  function renderEducation() {
    const container = $("#educationList");
    if (!container) return;
    container.innerHTML = (data.education ?? [])
      .map(
        (item) => `
        <article class="grid gap-2 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6">
          <div class="text-[0.82rem] text-muted">${esc(
            dateRange(item.start, item.end)
          )}</div>
          <div>
            <h3 class="font-semibold text-ink">${esc(t(item.degree))}</h3>
            <p class="text-[0.9rem] text-accent">${esc(
              t(item.institution)
            )}</p>
            <p class="mt-2 text-muted">${esc(t(item.description))}</p>
          </div>
        </article>`
      )
      .join("");
  }

  function renderProjects() {
    const container = $("#projectList");
    if (!container) return;
    container.innerHTML = (data.projects ?? [])
      .map(
        (project) => `
        <article class="rounded-xl border border-line bg-surface p-5">
          <h3 class="font-semibold text-ink">${esc(t(project.name))}</h3>
          <p class="mt-2 text-[0.9rem] text-muted">${esc(
            t(project.description)
          )}</p>
          <div class="mt-4 flex flex-wrap gap-1.5" dir="ltr">
            ${(project.stack ?? [])
              .map(
                (tech) =>
                  `<span class="rounded-md bg-surface-soft px-2 py-0.5 text-[0.75rem] text-muted">${esc(
                    tech
                  )}</span>`
              )
              .join("")}
          </div>
        </article>`
      )
      .join("");
  }

  function renderBindings() {
    $$("[data-bind]").forEach((el) => {
      el.textContent = t(getPath(data, el.dataset.bind));
    });
    $$("[data-i18n]").forEach((el) => {
      el.textContent = uiString(el.dataset.i18n);
    });
  }

  // ---- Language / theme ---------------------------------------------------
  function applyLanguage() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "fa" ? "rtl" : "ltr";
    document.body.dir = html.dir;

    const toggle = $("#languageToggle");
    if (toggle) {
      toggle.textContent = lang === "fa" ? "EN" : "FA";
      toggle.setAttribute(
        "aria-label",
        lang === "fa" ? "Switch to English" : "تغییر به فارسی"
      );
    }

    document.title = `${t(data.personal?.name)} — ${
      lang === "fa" ? "رزومه" : "Resume"
    }`;
  }

  function render() {
    applyLanguage();
    renderBindings();
    renderLinks();
    renderPhoto();
    renderSkills();
    renderLanguages();
    renderExperience();
    renderEducation();
    renderProjects();

    const year = $("#year");
    if (year) {
      const y = String(new Date().getFullYear());
      year.textContent = lang === "fa" ? toFaDigits(y) : y;
    }

    document.dispatchEvent(
      new CustomEvent("resume:rendered", { detail: { lang } })
    );
  }

  function setLanguage(next) {
    lang = next === "fa" ? "fa" : "en";
    store.set("lang", lang);
    render();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("#themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "☾" : "☼";
  }

  function initTheme() {
    const saved = store.get("theme");
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(saved ?? (prefersDark ? "dark" : "light"));

    $("#themeToggle")?.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      store.set("theme", next);
      applyTheme(next);
    });
  }

  // ---- Boot ---------------------------------------------------------------
  async function loadData() {
    if (window.RESUME_DATA) return window.RESUME_DATA; // optional inline data
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
    return res.json();
  }

  async function init() {
    initTheme();

    try {
      data = await loadData();
    } catch (err) {
      console.error("[resume] could not load data:", err);
      const main = $("#top");
      if (main) {
        main.innerHTML =
          '<p class="mx-auto w-[min(calc(100%-40px),1120px)] py-20 text-muted">Could not load resume data.</p>';
      }
      return;
    }

    const savedLang = store.get("lang");
    lang = savedLang === "fa" || savedLang === "en" ? savedLang : DEFAULT_LANG;

    $("#languageToggle")?.addEventListener("click", () =>
      setLanguage(lang === "fa" ? "en" : "fa")
    );

    render();
  }

  // Expose a tiny API for pdf-export.js
  window.resumeApp = {
    getLang: () => lang,
    getData: () => data,
    setLanguage,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
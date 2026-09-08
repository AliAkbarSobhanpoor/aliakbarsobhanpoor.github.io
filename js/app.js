const state = {
  lang: localStorage.getItem("resume-lang") || "en",
  theme: localStorage.getItem("resume-theme") || "light",
  data: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function text(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[state.lang] ?? value.en ?? value.fa ?? "";
}

function t(key) {
  return key.split(".").reduce((obj, part) => obj?.[part], state.data?.translations) ?? key;
}

function applyStaticText() {
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  $$("[data-bind]").forEach((el) => {
    const path = el.dataset.bind.split(".");
    let value = state.data;
    for (const part of path) value = value?.[part];
    el.textContent = text(value);
  });

  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
  $("#languageToggle").textContent = state.lang === "en" ? "FA" : "EN";
}

function renderLinks() {
  $("#heroLinks").innerHTML = state.data.personal.links
    .map(link => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`)
    .join("");
}

function renderSkills() {
  $("#skillList").innerHTML = state.data.skills
    .map(skill => `<span class="skill">${skill.name}</span>`)
    .join("");
}

function renderLanguages() {
  $("#languageList").innerHTML = state.data.languages
    .map(item => `<div>${text(item.name)} <small>· ${text(item.level)}</small></div>`)
    .join("");
}

function renderExperience() {
  $("#experienceList").innerHTML = state.data.experience.map(item => `
    <article class="timeline-item">
      <div class="timeline-date">${item.start} — ${item.end}</div>
      <div class="timeline-content">
        <h3 class="timeline-title">${text(item.position)}</h3>
        <div class="timeline-company">${item.company}</div>
        <div class="timeline-description">
          ${text(item.description)}
        </div>
      </div>
    </article>
  `).join("");
}

function renderEducation() {
  $("#educationList").innerHTML = state.data.education.map(item => `
    <article class="timeline-item">
      <div class="timeline-date">${item.start} — ${item.end}</div>
      <div class="timeline-content">
        <h3 class="timeline-title">${text(item.degree)}</h3>
        <div class="timeline-company">${item.institution}</div>
        <div class="timeline-description">${text(item.description)}</div>
      </div>
    </article>
  `).join("");
}

function renderProjects() {
  $("#projectList").innerHTML = state.data.projects.map(item => `
    <article class="project">
      <h3>${text(item.name)}</h3>
      <p>${text(item.description)}</p>
      <div class="tags">
        ${item.stack.map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderTeaching() {
  $("#teachingList").innerHTML = state.data.teaching.map(item => `
    <article class="timeline-item">
      <div class="timeline-date">${item.start} — ${item.end}</div>
      <div class="timeline-content">
        <h3 class="timeline-title">${text(item.role)}</h3>
        <div class="timeline-company">${item.organization}</div>
        <div class="timeline-description">${text(item.description)}</div>
      </div>
    </article>
  `).join("");
}

function render() {
  applyStaticText();
  renderLinks();
  renderSkills();
  renderLanguages();
  renderExperience();
  renderEducation();
  renderProjects();
  renderTeaching();
  document.title = `${text(state.data.personal.name)} — ${text(state.data.personal.title)}`;
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  $("#themeToggle").textContent = state.theme === "dark" ? "☾" : "☼";
}

async function init() {
  const response = await fetch("data/resume.json");
  state.data = await response.json();
  render();
  applyTheme();
  $("#year").textContent = new Date().getFullYear();
}

$("#languageToggle").addEventListener("click", () => {
  state.lang = state.lang === "en" ? "fa" : "en";
  localStorage.setItem("resume-lang", state.lang);
  render();
});

$("#themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light";
  localStorage.setItem("resume-theme", state.theme);
  applyTheme();
});

init().catch(error => {
  console.error(error);
  document.querySelector("main").innerHTML =
    "<p style='padding:40px'>Could not load resume.json. Run this site through a local server or GitHub Pages.</p>";
});

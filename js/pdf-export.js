// Adds "Download PDF" behavior to the resume.
// Uses the browser's native print dialog (Save as PDF) so the existing
// @media print styles in style.css are respected, text stays selectable,
// and RTL/Persian rendering is handled by the browser itself.

function slugify(value) {
  return (value || "resume")
    .toString()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadResumeAsPdf() {
  const originalTitle = document.title;
  const nameEl = document.querySelector('[data-bind="personal.name"]');
  const name = nameEl ? nameEl.textContent : "Resume";

  // The string set here becomes the browser's suggested filename
  // when the user chooses "Save as PDF" in the print dialog.
  document.title = `${slugify(name)}-Resume`;

  window.print();

  // Restore the real title after the print dialog is dismissed.
  // (afterprint fires in Chrome/Firefox; the timeout is a fallback for
  // browsers/environments that don't fire it reliably.)
  const restore = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  setTimeout(restore, 2000);
}

function initPdfExport() {
  const button = document.getElementById("pdfDownload");
  if (!button) return;
  button.addEventListener("click", downloadResumeAsPdf);
}

document.addEventListener("DOMContentLoaded", initPdfExport);
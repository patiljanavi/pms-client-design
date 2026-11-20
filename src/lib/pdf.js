/**
 * Saves an element as a PDF file. html2pdf.js is loaded only when needed.
 * Elements with data-html2canvas-ignore (buttons, nav) are left out,
 * and .force-light keeps the PDF in light colours even in dark mode.
 */
export async function downloadElementAsPdf(element, filename) {
  const { default: html2pdf } = await import("html2pdf.js/dist/html2pdf.bundle.min.js")
  element.classList.add("force-light")
  try {
    await html2pdf()
      .set({
        margin: [12, 12, 14, 12],
        filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".pdf-avoid-break"] },
      })
      .from(element)
      .save()
  } finally {
    element.classList.remove("force-light")
  }
}

/** "2026 engagement letter" → "2026-engagement-letter.pdf" */
export const pdfFileName = (name) => `${(name || "document").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.pdf`

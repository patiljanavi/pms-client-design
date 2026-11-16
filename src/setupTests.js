import "@testing-library/jest-dom"

// jsdom doesn't have ResizeObserver; Radix UI components (checkbox, dropdown) need it.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom doesn't have matchMedia; the theme setting reads it.
window.matchMedia =
  window.matchMedia ||
  ((query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

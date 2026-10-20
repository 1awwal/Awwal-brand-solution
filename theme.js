(() => {
  const key = "awwal-theme";
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll(".theme-toggle")];
  let theme = "dark";
  try {
    const saved = localStorage.getItem(key);
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (_) {}
  const apply = (next) => {
    theme = next;
    root.dataset.theme = theme;
    buttons.forEach((button) => {
      const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      button.setAttribute("aria-label", nextLabel);
      button.setAttribute("title", nextLabel);
      button.setAttribute("aria-pressed", String(theme === "light"));
    });
    try { localStorage.setItem(key, theme); } catch (_) {}
  };
  apply(theme);
  buttons.forEach((button) => button.addEventListener("click", () => apply(theme === "dark" ? "light" : "dark")));
})();

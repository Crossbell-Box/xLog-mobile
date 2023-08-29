export const javaScriptBeforeContentLoaded = (mode: string) => `
  window.localStorage.setItem('darkMode', '${mode}');
`;

export const javaScriptBeforeContentLoaded = (
  isDarkMode: boolean,
  mode: string,
) => `
    const xlogConfigurationKey = 'xlog';
    const originalXLogStorageData = JSON.parse(localStorage.getItem(xlogConfigurationKey)||"{}");
    originalXLogStorageData['darkMode'] = JSON.stringify(${isDarkMode});
    localStorage.setItem(xlogConfigurationKey, JSON.stringify(originalXLogStorageData));
    document.cookie = "color_scheme=${mode};";
  `;

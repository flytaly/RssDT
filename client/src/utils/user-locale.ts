export const getUserLocaleInfo = () => {
  if (Intl && Intl.DateTimeFormat) {
    const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
    return { timeZone, locale };
  }
  return null;
};

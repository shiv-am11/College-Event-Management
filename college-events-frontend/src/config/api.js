const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Keep local development convenient while ensuring production never falls
// back to a localhost backend when VITE_API_URL is omitted.
export const API_BASE_URL =
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:3000" : "");

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const navigate = (path: string) => {
  window.location.href = `${BASE}${path}`;
};

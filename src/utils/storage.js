// JWT is stored exclusively in an HttpOnly cookie set by the server —
// never in localStorage (ASVS V8.2.2). Only non-sensitive user profile
// data (name, photo URL, etc.) is kept here for instant first render.
const USER_KEY = 'blog_user';

export const storage = {
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear:   () => localStorage.removeItem(USER_KEY),
};

/** Keys used in localStorage */
const KEYS = {
  TOKEN: 'blog_access_token',
  USER:  'blog_user',
};

export const storage = {
  getToken: () => localStorage.getItem(KEYS.TOKEN),
  setToken: (token) => localStorage.setItem(KEYS.TOKEN, token),
  removeToken: () => localStorage.removeItem(KEYS.TOKEN),

  getUser: () => {
    const raw = localStorage.getItem(KEYS.USER);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  },
  setUser: (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(KEYS.USER),

  clear: () => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
  },
};

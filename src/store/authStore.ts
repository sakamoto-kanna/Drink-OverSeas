import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  roles: string[];
  isAuthLoading: boolean;
  checkLogin: () => Promise<void>;
  setLogin: (name: string, roles: string[]) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userName: "",
  roles: [],
  isAuthLoading: false,

  checkLogin: async () => {
    try {
      set({ isAuthLoading: true });
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-cache",
      });

      const data = (await res.json()) as {
        isLoggedIn: boolean;
        user?: {
          name: string;
          roles: string[];
        };
      };

      if (data.isLoggedIn && data.user) {
        set({
          isLoggedIn: true,
          userName: data.user.name,
          roles: data.user.roles,
        });
      }
    } catch (err) {
      console.error("로그인 상태 확인 실패:", err);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  setLogin: (name, roles) =>
    set({
      isLoggedIn: true,
      userName: name,
      roles: roles,
      isAuthLoading: false,
    }),

  setLogout: () =>
    set({
      isLoggedIn: false,
      userName: "",
      roles: [],
      isAuthLoading: false,
    }),
}));

import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  isAuthLoading: boolean;
  checkLogin: () => Promise<void>;
  setLogin: (name: string) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userName: "",
  // 변경: 서버에서 상태를 확정지어 내려주므로 기본값을 false로 변경합니다.
  isAuthLoading: false,

  checkLogin: async () => {
    try {
      // 이제 이 함수는 앱 로드 시점에는 쓰이지 않지만,
      // 만약을 대비한 수동 동기화용으로 남겨둡니다.
      set({ isAuthLoading: true });
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.isLoggedIn) {
        set({ isLoggedIn: true, userName: data.user.name });
      }
    } catch (err) {
      console.error("로그인 상태 확인 실패:", err);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  setLogin: (name) =>
    set({ isLoggedIn: true, userName: name, isAuthLoading: false }),
  setLogout: () =>
    set({ isLoggedIn: false, userName: "", isAuthLoading: false }),
}));

"use client";

import { useRef } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthInitializer({
  isLoggedIn,
  userName,
}: {
  isLoggedIn: boolean;
  userName: string;
}) {
  const initialized = useRef(false);

  // 컴포넌트가 처음 렌더링될 때 딱 한 번만 서버의 값을 Zustand 저장소에 꽂아 넣습니다.
  if (!initialized.current) {
    useAuthStore.setState({ isLoggedIn, userName, isAuthLoading: false });
    initialized.current = true;
  }

  // 화면에 아무것도 그리지 않는 숨은 컴포넌트입니다.
  return null;
}

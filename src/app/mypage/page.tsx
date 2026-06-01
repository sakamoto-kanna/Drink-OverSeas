"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    daum: any;
  }
}

export default function MyPage() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 1. 기본 유저 정보 상태
  const [formData, setFormData] = useState({
    loginId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    detailAddress: "",
  });

  // 🌟 2. 소셜 연동 상태 (API에서 받아올 데이터)
  const [socialConnections, setSocialConnections] = useState({
    google: false,
    kakao: false,
    naver: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (data.success) {
          setFormData({
            loginId: data.user.LOGIN_ID,
            name: data.user.NAME,
            email: data.user.EMAIL,
            phone: data.user.PHONE,
            address: data.user.ADDRESS,
            detailAddress: "",
          });
          setSocialConnections({
            google: data.socials.includes("google"),
            kakao: data.socials.includes("kakao"),
            naver: data.socials.includes("naver"),
          });
        } else {
          alert("로그인이 필요합니다.");
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) return;

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.userSelectedType === "R") {
          if (data.bname !== "") extraAddress += data.bname;
          if (data.buildingName !== "")
            extraAddress +=
              extraAddress !== ""
                ? `, ${data.buildingName}`
                : data.buildingName;
          fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setFormData((prev) => ({ ...prev, address: fullAddress }));
      },
    }).open();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      alert("개인정보가 성공적으로 수정되었습니다.");
      setIsEditing(false);
    } else {
      alert(data.message || "수정에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.",
    );

    if (confirmDelete) {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
        router.push("/");
      } else {
        alert("탈퇴 처리 중 문제가 발생했습니다.");
      }
    }
  };

  const handleSocialToggle = async (provider: string, isConnected: boolean) => {
    if (isConnected) {
      const confirmDisconnect = window.confirm(
        `${provider} 연동을 해제하시겠습니까?`,
      );
      if (confirmDisconnect) {
        await fetch(`/api/user/social?provider=${provider}`, {
          method: "DELETE",
        });
        setSocialConnections((prev) => ({ ...prev, [provider]: false }));
        alert("연동이 해제되었습니다.");
      }
    } else {
      alert(`${provider} 로그인 창으로 이동하여 연동을 진행합니다.`);
      signIn(provider, { callbackUrl: "/mypage" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm tracking-widest uppercase">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <div className="flex min-h-screen justify-center bg-[#FDFCFB] px-4 py-20 text-black">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center text-xs font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-black"
            >
              <i className="fa-solid fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
              Back to Home
            </button>
          </div>
          <h1 className="mb-10 text-3xl font-bold tracking-tighter uppercase">
            My Account
          </h1>

          <div className="border border-gray-100 bg-white p-10 shadow-sm">
            {/* --- 프로필 정보 섹션 --- */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase">
                Profile Info
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs font-bold tracking-widest uppercase transition-colors ${
                  isEditing
                    ? "text-red-500 hover:text-red-700"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    ID
                  </label>
                  <input
                    type="text"
                    value={formData.loginId}
                    disabled
                    className="w-full border-b border-gray-100 bg-gray-50 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full border-b border-gray-100 bg-gray-50 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full border-b py-2 text-sm transition-colors outline-none ${isEditing ? "border-gray-300 focus:border-black" : "border-gray-100 bg-transparent text-gray-600"}`}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full border-b py-2 text-sm transition-colors outline-none ${isEditing ? "border-gray-300 focus:border-black" : "border-gray-100 bg-transparent text-gray-600"}`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.address}
                    disabled
                    className={`flex-1 border-b py-2 text-sm transition-colors outline-none ${isEditing ? "border-gray-300 bg-gray-50" : "border-gray-100 bg-transparent text-gray-600"}`}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="bg-black px-4 text-[10px] font-bold text-white uppercase hover:bg-gray-800"
                    >
                      Search
                    </button>
                  )}
                </div>
                {isEditing && (
                  <input
                    type="text"
                    placeholder="상세 주소를 입력하세요"
                    value={formData.detailAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        detailAddress: e.target.value,
                      })
                    }
                    className="mt-2 w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-black"
                  />
                )}
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="mt-8 w-full bg-black py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
                >
                  Save Changes
                </button>
              )}
            </form>

            {/* 🌟 새로 추가된 소셜 연동 관리 섹션 */}
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="mb-6 text-sm font-bold tracking-widest text-gray-800 uppercase">
                Linked Accounts
              </h2>

              <div className="space-y-3">
                {/* 구글 */}
                <div className="flex items-center justify-between border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/google.png"
                      className="h-5 w-auto scale-200 object-contain"
                      alt="Google"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Google
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleSocialToggle("google", socialConnections.google)
                    }
                    className={`border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      socialConnections.google
                        ? "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                        : "border-black bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {socialConnections.google ? "Disconnect" : "Connect"}
                  </button>
                </div>

                {/* 네이버 */}
                <div className="flex items-center justify-between border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/naver.png"
                      className="h-5 w-auto object-contain"
                      alt="Naver"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Naver
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleSocialToggle("naver", socialConnections.naver)
                    }
                    className={`border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      socialConnections.naver
                        ? "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                        : "border-black bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {socialConnections.naver ? "Disconnect" : "Connect"}
                  </button>
                </div>

                {/* 카카오 */}
                <div className="flex items-center justify-between border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {/* 카카오 이미지가 가로로 길 경우를 대비해 w-auto를 사용했습니다 */}
                    <img
                      src="/icons/kakao.png"
                      className="h-5 w-auto object-contain"
                      alt="Kakao"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Kakao
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleSocialToggle("kakao", socialConnections.kakao)
                    }
                    className={`border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      socialConnections.kakao
                        ? "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                        : "border-black bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {socialConnections.kakao ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- Danger Zone : 회원 탈퇴 --- */}
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <h3 className="mb-2 text-xs font-bold tracking-widest text-red-500 uppercase">
              Danger Zone
            </h3>
            <p className="mb-6 text-[11px] text-gray-400">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="border border-red-200 bg-white px-6 py-3 text-[10px] font-bold tracking-widest text-red-500 uppercase transition-colors hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

declare global {
  interface Window {
    daum: any;
  }
}

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    detailAddress: "",
  });

  const [idStatus, setIdStatus] = useState({
    state: "idle", // idle | checking | available | duplicate | invalid
    message: "",
  });

  useEffect(() => {
    const checkId = async () => {
      const currentId = formData.loginId;

      // 비어있으면 초기화
      if (!currentId) {
        setIdStatus({ state: "idle", message: "" });
        return;
      }

      // 1차: 한글/특수문자 정규식 검사 (기존 로직 대체)
      if (/[^a-zA-Z0-9]/.test(currentId)) {
        setIdStatus({
          state: "invalid",
          message: "아이디는 영문과 숫자만 입력 가능합니다.",
        });
        return;
      }

      setIdStatus({ state: "checking", message: "확인 중..." });

      // 2차: 백엔드 API로 중복 검사 요청
      try {
        const res = await fetch(`/api/auth/check-id?id=${currentId}`);
        const data = (await res.json()) as {
          available: boolean;
          message: string;
        };

        if (data.available) {
          setIdStatus({ state: "available", message: data.message }); // 초록색 메시지
        } else {
          setIdStatus({ state: "duplicate", message: data.message }); // 빨간색 메시지
        }
      } catch (error) {
        setIdStatus({ state: "invalid", message: "서버 확인 실패" });
      }
    };

    // 사용자가 타이핑을 멈추고 0.5초(500ms) 뒤에 검사를 실행합니다.
    // (매 글자마다 DB를 찌르면 서버가 터질 수 있기 때문입니다!)
    const timer = setTimeout(checkId, 500);
    return () => clearTimeout(timer);
  }, [formData.loginId]);

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 서비스를 불러오는 중입니다. 잠시만 기다려주세요.");
      return;
    }

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

        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
        }));

        document.getElementById("detailAddress")?.focus();
      },
    }).open();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    let value = e.target.value;

    if (fieldName === "loginId") {
      // 한글 조합 중일 때는 에러(잔상) 방지를 위해 일단 통과시킵니다.
      if ((e.nativeEvent as InputEvent).isComposing) {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        return;
      }

      // 조합이 끝나면 영소문자, 영대문자, 숫자가 아닌(^ 기호) 모든 문자를 빈 문자열로 날려버립니다.
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    // 1. 현재 입력하는 칸이 '전화번호(phone)'일 때만 특수 로직 발동
    if (fieldName === "phone") {
      // 한글 조합(IME) 중일 때는 포맷팅을 건너뛰고 입력값 그대로 저장합니다.
      // (TypeScript 환경에서 에러가 나지 않도록 타입 단언을 사용합니다)
      if ((e.nativeEvent as InputEvent).isComposing) {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        return;
      }

      // 한글 조합이 끝났거나 숫자를 입력 중일 때: 숫자가 아닌 문자 제거
      const onlyNums = value.replace(/[^0-9]/g, "");

      // 길이에 맞춰 자동 하이픈 삽입
      if (onlyNums.length <= 3) {
        value = onlyNums;
      } else if (onlyNums.length <= 7) {
        value = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else if (onlyNums.length <= 11) {
        value = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
      } else {
        value = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      }
    }

    // 2. 전화번호 포맷팅이 완료된 값, 혹은 다른 일반 필드들의 값을 최종 업데이트합니다.
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    //폼 제출 직전에 아이디 유효성을 한 번 더 검사합니다. (경고를 무시하고 가입하는 것 방지)
    if (idStatus.state !== "available") {
      alert("아이디 중복 확인 및 입력 규칙을 확인해주세요.");
      return;
    }
    const invalidPasswordRegex =
      /[^a-zA-Z0-9!@#$%^&*()_+~`\-={}[\]:;"'<>,.?/|\\]/;
    if (invalidPasswordRegex.test(formData.password)) {
      alert("비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.");
      return;
    }

    const { detailAddress, ...restData } = formData;
    const submissionData = {
      ...restData,
      address: `${formData.address} ${detailAddress}`.trim(),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });

    const data = (await res.json()) as {
      success: boolean;
      message?: string;
    };

    if (data.success) {
      router.push("/verify-pending");
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      {/* 🌟 겉을 감싸는 최상위 div에 버튼 배치를 위한 relative 클래스를 추가했습니다 */}
      <div className="relative flex min-h-screen items-center justify-center bg-[#FDFCFB] px-4 py-20">
        {/* 🌟 메인으로 돌아가기 버튼 추가 */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase transition-colors hover:text-black md:top-10 md:left-10"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <div className="w-full max-w-md border border-gray-100 bg-white p-12 shadow-sm">
          <h1 className="mb-10 text-center text-3xl font-bold tracking-tighter uppercase">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                label: "ID",
                name: "loginId",
                type: "text",
                title: "영문, 숫자 조합의 아이디를 입력해주세요.",
              },
              {
                label: "Password",
                name: "password",
                type: "password",
                min: 8,
                max: 20,
                desc: "8~20자리",
                title: "8~20자리의 안전한 비밀번호를 설정해주세요.",
              },
              {
                label: "Name",
                name: "name",
                type: "text",
                title: "가입자 본인의 실명을 입력해주세요.",
              },
              {
                label: "Email",
                name: "email",
                type: "email",
                title:
                  "인증 메일을 받을 수 있는 실제 이메일 주소를 입력해주세요.",
              },
              {
                label: "Phone",
                name: "phone",
                type: "tel",
                title: "숫자만 입력해주세요. (예: 01012345678)",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  {field.label}
                  {field.desc && (
                    <span className="ml-1 tracking-normal text-gray-300 normal-case">
                      ({field.desc})
                    </span>
                  )}
                </label>
                <input
                  type={field.type}
                  required
                  title={field.title}
                  placeholder={field.title}
                  minLength={field.min}
                  maxLength={field.max}
                  value={formData[field.name as keyof typeof formData]}
                  inputMode={field.name === "phone" ? "numeric" : undefined} //폰 번호일 때만 모바일 숫자 키패드 강제 호출!
                  className="w-full border-b border-gray-200 py-2 text-sm transition-colors outline-none focus:border-black"
                  onChange={(e) => handleInputChange(e, field.name)}
                />

                {/* 아이디 필드 실시간 경고 메시지 */}
                {field.name === "loginId" && idStatus.message && (
                  <div className="mt-2 text-left text-[10px] font-bold tracking-wide">
                    {idStatus.state === "checking" && (
                      <span className="text-gray-400">{idStatus.message}</span>
                    )}
                    {idStatus.state === "invalid" && (
                      <span className="text-red-400">{idStatus.message}</span>
                    )}
                    {idStatus.state === "duplicate" && (
                      <span className="text-red-400">{idStatus.message}</span>
                    )}
                    {idStatus.state === "available" && (
                      <span className="text-green-500">{idStatus.message}</span>
                    )}
                  </div>
                )}

                {/* 비밀번호 필드 실시간 안내 메시지 */}
                {field.name === "password" && formData.password.length > 0 && (
                  <div className="mt-2 text-[10px] font-bold tracking-wide">
                    {/[^a-zA-Z0-9!@#$%^&*()_+~`\-={}[\]:;"'<>,.?/|\\]/.test(
                      formData.password,
                    ) ? (
                      // 1순위: 한글이나 공백 등 이상한 문자가 들어오면 즉시 빨간색 경고
                      <p className="text-red-400">
                        비밀번호는 영문, 숫자, 특수문자만 입력 가능합니다.
                      </p>
                    ) : formData.password.length < 8 ? (
                      // 2순위: 이상한 문자는 없지만 길이가 짧으면 빨간색 경고
                      <p className="text-red-400">
                        비밀번호가 너무 짧습니다. (현재{" "}
                        {formData.password.length}자)
                      </p>
                    ) : (
                      // 3순위: 조건 완벽 충족 시 파란색 통과 메시지
                      <p className="text-blue-500">
                        사용 가능한 안전한 비밀번호입니다.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Address
              </label>
              <div className="flex gap-x-2">
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  placeholder="주소 검색"
                  className="flex-1 cursor-default border-b border-gray-200 bg-gray-50 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="bg-gray-100 px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-gray-200"
                >
                  Search
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Detail Address
              </label>
              <input
                id="detailAddress"
                type="text"
                value={formData.detailAddress}
                disabled={!formData.address}
                placeholder={
                  formData.address
                    ? "상세 주소를 입력하세요"
                    : "기본 주소를 먼저 검색해주세요"
                }
                className={`w-full border-b py-2 text-sm transition-colors outline-none ${
                  !formData.address
                    ? "cursor-not-allowed border-gray-100 bg-gray-50 placeholder:text-gray-300"
                    : "border-gray-200 focus:border-black"
                }`}
                onChange={(e) =>
                  setFormData({ ...formData, detailAddress: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="mt-10 w-full bg-black py-5 text-xs font-bold tracking-[0.3em] text-white uppercase transition-colors hover:bg-gray-800"
            >
              Register Now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

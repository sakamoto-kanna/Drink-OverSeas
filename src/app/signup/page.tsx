"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
    setFormData((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    //폼 제출 직전에 아이디 유효성을 한 번 더 검사합니다. (경고를 무시하고 가입하는 것 방지)
    if (/[^a-zA-Z0-9]/.test(formData.loginId)) {
      alert("아이디는 영문과 숫자만 사용할 수 있습니다. 다시 확인해주세요.");
      return; // 에러가 있으면 백엔드로 데이터를 보내지 않고 여기서 멈춥니다.
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

    const data = await res.json();

    if (data.success) {
      alert("가입을 환영합니다! 로그인 해주세요.");
      router.push("/");
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

      <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] px-4 py-20">
        <div className="w-full max-w-md border border-gray-100 bg-white p-12 shadow-sm">
          <h1 className="mb-10 text-center text-3xl font-bold tracking-tighter uppercase">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: "ID", name: "loginId", type: "text" },
              {
                label: "Password",
                name: "password",
                type: "password",
                min: 8,
                max: 20,
                desc: "8~20자리",
              },
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone", name: "phone", type: "tel" },
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
                  minLength={field.min}
                  maxLength={field.max}
                  value={formData[field.name as keyof typeof formData]}
                  className="w-full border-b border-gray-200 py-2 text-sm transition-colors outline-none focus:border-black"
                  onChange={(e) => handleInputChange(e, field.name)}
                />

                {/* 아이디 필드 실시간 경고 메시지 */}
                {field.name === "loginId" &&
                  /[^a-zA-Z0-9]/.test(formData.loginId) && (
                    <p className="mt-2 text-[10px] font-bold tracking-wide text-red-400">
                      아이디는 영문과 숫자만 입력 가능합니다.
                    </p>
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

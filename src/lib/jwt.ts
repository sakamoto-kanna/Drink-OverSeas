import { SignJWT, jwtVerify } from "jose";

// 🌟 헬퍼 함수: 파일 로드 시점이 아닌, '함수 호출 시점'에 환경변수를 가져옵니다.
function getSecretKey(envSecret?: string) {
  // 1순위: Cloudflare env 객체에서 넘겨받은 값 (가장 안전)
  // 2순위: process.env에서 읽은 값
  // 3순위: 기본 하드코딩 값 (안전 장치)
  const secret =
    envSecret || process.env.JWT_SECRET || "dos-super-secret-key-2026";
  return new TextEncoder().encode(secret);
}

/**
 * 토큰 발급 (로그인 시)
 */
export async function signToken(
  payload: { loginId: string; name: string; roles?: string[] },
  envSecret?: string, // 환경변수 주입구 추가
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(getSecretKey(envSecret));
}

/**
 * 토큰 검증 (마이페이지 등에서 권한 확인할 때)
 */
export async function verifyToken(token: string, envSecret?: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(envSecret));
    return payload;
  } catch (error) {
    return null; // 만료되거나 위조된 토큰이면 null 반환
  }
}

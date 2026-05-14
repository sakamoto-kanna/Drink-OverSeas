import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// 로그인할 때 썼던 비밀키와 똑같아야 합니다.
const SECRET_KEY = new TextEncoder().encode("dos-super-secret-key-2026");

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // 1. 쿠키에 토큰이 아예 없으면 (로그인 안 한 상태)
    if (!token) {
      return Response.json({ isLoggedIn: false });
    }

    // 2. 토큰이 있다면 위조되지 않았는지, 만료되지 않았는지 검사합니다.
    const { payload } = await jwtVerify(token, SECRET_KEY);

    // 3. 검증 통과! 유저 정보를 프론트엔드로 보내줍니다.
    return Response.json({ 
      isLoggedIn: true, 
      user: { name: payload.name, roles: payload.roles, loginId: payload.loginId } 
    });

  } catch (error) {
    // 토큰 기간이 끝났거나(만료), 누군가 조작한 경우 얄짤없이 로그인 해제
    return Response.json({ isLoggedIn: false });
  }
}
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    // 로그인 시 생성했던 'token' 쿠키를 삭제합니다.
    cookieStore.delete('token');
    
    return Response.json({ success: true, message: "로그아웃 되었습니다." });
  } catch (error) {
    return Response.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
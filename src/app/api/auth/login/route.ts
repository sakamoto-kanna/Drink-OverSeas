import { getCloudflareContext } from '@opennextjs/cloudflare';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// JWT 암호화에 사용할 비밀키 (실무에서는 .env 파일에 보관해야 합니다)
const SECRET_KEY = new TextEncoder().encode("dos-super-secret-key-2026");

export async function POST(request: Request) {
  try {
    // 1. 프론트엔드에서 보낸 아이디와 비밀번호 받기
    const { loginId, password } = await request.json();
    
    // DB 연결
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 2. USER_AUTH 테이블에서 아이디와 비밀번호가 일치하는 유저 찾기
    const user = await db.prepare('SELECT * FROM USER_AUTH WHERE LOGIN_ID = ? AND PASSWORD = ?')
      .bind(loginId, password)
      .first<{ LOGIN_ID: string; NAME: string }>();

    if (!user) {
      return Response.json({ success: false, message: "아이디 또는 비밀번호가 다릅니다." }, { status: 401 });
    }

    // 3. USER_ROLES 테이블에서 해당 유저의 권한(Role) 모두 가져오기
    const { results: roles } = await db.prepare('SELECT ROLE_NAME FROM USER_ROLES WHERE LOGIN_ID = ?')
      .bind(user.LOGIN_ID)
      .all<{ ROLE_NAME: string }>();
    
    // 가져온 권한들을 배열로 변환 (예: ['ROLE_USER', 'ROLE_ADMIN'])
    const roleList = roles.map(r => r.ROLE_NAME);

    // 4. JWT 토큰 생성 (유저 정보와 권한을 담아서 서명)
    const token = await new SignJWT({ 
      loginId: user.LOGIN_ID, 
      name: user.NAME, 
      roles: roleList 
    })
      .setProtectedHeader({ alg: 'HS256' }) // 암호화 알고리즘
      .setExpirationTime('2h') // 토큰 유효기간: 2시간
      .sign(SECRET_KEY);

    // 5. 생성된 JWT를 'token'이라는 이름의 브라우저 쿠키로 설정
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true, // 자바스크립트에서 접근 불가 (보안 강화)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2시간 (초 단위)
      path: '/',
    });

    return Response.json({ 
      success: true, 
      message: "로그인 성공", 
      user: { name: user.NAME, roles: roleList } 
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
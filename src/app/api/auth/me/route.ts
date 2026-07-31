import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Cloudflare 환경변수 안전하게 가져오기
    const { env } = await getCloudflareContext();

    // 2. 브라우저 쿠키에서 token 꺼내기
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // 토큰이 아예 없으면 미인증 상태 반환
    if (!token) {
      return Response.json({ isLoggedIn: false });
    }

    // 3. 토큰 검증 (반드시 env.JWT_SECRET을 두 번째 인자로 넘겨주어야 에러가 나지 않습니다!)
    const decoded = await verifyToken(token, env.JWT_SECRET as string);

    // 검증 실패 또는 만료된 토큰인 경우
    if (!decoded || !decoded.loginId) {
      return Response.json({ isLoggedIn: false });
    }

    const loginId = decoded.loginId as string;
    const db = env.DB;

    const user = await db
      .prepare("SELECT NAME FROM USER_AUTH WHERE LOGIN_ID = ?")
      .bind(loginId)
      .first<{ NAME: string }>();

    // 만약 DB에서 유저가 삭제되었다면 강제 로그아웃 처리
    if (!user) {
      return Response.json({ isLoggedIn: false });
    }

    const { results: roles } = await db
      .prepare("SELECT ROLE_NAME FROM USER_ROLES WHERE LOGIN_ID = ?")
      .bind(loginId)
      .all<{ ROLE_NAME: string }>();
    const roleList =
      roles.length > 0 ? roles.map((r) => r.ROLE_NAME) : ["ROLE_USER"];

    // 4. 검증 성공 시 유저 정보와 함께 로그인 상태(true) 반환
    return Response.json({
      isLoggedIn: true,
      user: {
        loginId: decoded.loginId,
        name: user.NAME,
        roles: roleList || [],
      },
    });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    // 서버 내부 에러가 나더라도 프론트엔드가 뻗지 않도록 false를 반환
    return Response.json({ isLoggedIn: false }, { status: 500 });
  }
}

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 1. 쿠키에서 'token' 추출 (Next.js 15+ 권장 사항에 맞춰 await 사용)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 🌟 2. 수정된 부분: 토큰과 함께 Cloudflare 환경변수(.dev.vars)의 JWT_SECRET을 꽂아줍니다!
    const decoded = await verifyToken(token, env.JWT_SECRET as string);

    if (!decoded || !decoded.loginId) {
      return Response.json(
        {
          success: false,
          message: "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
        },
        { status: 401 },
      );
    }

    // JWT에서 빼낸 진짜 로그인 아이디!
    const loginId = decoded.loginId as string;

    // 3. 기본 유저 정보 조회
    const user = await db
      .prepare(
        "SELECT LOGIN_ID, NAME, EMAIL, PHONE, ADDRESS FROM USER_AUTH WHERE LOGIN_ID = ?",
      )
      .bind(loginId)
      .first();

    if (!user) {
      return Response.json(
        { success: false, message: "유저를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 4. 소셜 연동 목록 조회
    const socials = await db
      .prepare("SELECT provider FROM accounts WHERE userId = ?")
      .bind(loginId)
      .all();

    const connectedProviders = socials.results.map((row: any) => row.provider);

    return Response.json({
      success: true,
      user: user,
      socials: connectedProviders,
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return Response.json(
      { success: false, message: "서버 에러" },
      { status: 500 },
    );
  }
}

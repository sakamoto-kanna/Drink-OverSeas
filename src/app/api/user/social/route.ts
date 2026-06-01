import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(request: Request) {
  try {
    // 1. 어떤 소셜(google, naver 등)을 지울지 URL에서 가져오기
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return Response.json(
        { success: false, message: "잘못된 요청입니다." },
        { status: 400 },
      );
    }

    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 2. 현재 로그인한 유저 확인 (쿠키 검증)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const decoded = await verifyToken(token, env.JWT_SECRET as string);
    if (!decoded || !decoded.loginId) {
      return Response.json(
        { success: false, message: "권한이 없습니다." },
        { status: 403 },
      );
    }

    const loginId = decoded.loginId as string;

    // 🌟 3. DB 삭제 로직: 새로운 스키마인 accounts 테이블과 userId 컬럼을 사용합니다!
    await db
      .prepare("DELETE FROM accounts WHERE userId = ? AND provider = ?")
      .bind(loginId, provider)
      .run();

    return Response.json({
      success: true,
      message: "연동이 성공적으로 해제되었습니다.",
    });
  } catch (error) {
    console.error("Social Disconnect API Error:", error);
    return Response.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

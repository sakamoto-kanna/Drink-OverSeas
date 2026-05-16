import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
  // 1. URL에서 id 파라미터 가져오기 (예: /api/auth/check-id?id=admin)
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("id");

  if (!loginId) {
    return Response.json(
      { available: false, message: "아이디를 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 2. DB에서 해당 아이디가 존재하는지 검색
    const existingUser = await db
      .prepare("SELECT LOGIN_ID FROM USER_AUTH WHERE LOGIN_ID = ?")
      .bind(loginId)
      .first();

    // 3. 결과 반환
    if (existingUser) {
      return Response.json({
        available: false,
        message: "중복되어 사용할 수 없는 아이디입니다.",
      });
    } else {
      return Response.json({
        available: true,
        message: "사용 가능한 아이디입니다.",
      });
    }
  } catch (error) {
    return Response.json(
      { available: false, message: "서버 에러가 발생했습니다." },
      { status: 500 },
    );
  }
}

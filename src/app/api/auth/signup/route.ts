import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const { loginId, password, name, email, phone, address } =
      await request.json();
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 1. 중복 아이디 체크
    const existingUser = await db
      .prepare("SELECT LOGIN_ID FROM USER_AUTH WHERE LOGIN_ID = ?")
      .bind(loginId)
      .first();

    if (existingUser) {
      return Response.json(
        { success: false, message: "이미 사용 중인 아이디입니다." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 20) {
      return Response.json(
        { success: false, message: "비밀번호는 8~20자리로 설정해야 합니다." },
        { status: 400 },
      );
    }

    // 2. 회원 정보 저장
    await db
      .prepare(
        "INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, PHONE, ADDRESS) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(loginId, password, name, email, phone, address)
      .run();

    // 3. 기본 권한(ROLE_USER) 부여
    await db
      .prepare("INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES (?, ?)")
      .bind(loginId, "ROLE_USER")
      .run();

    return Response.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

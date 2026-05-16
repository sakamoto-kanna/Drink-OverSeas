import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    // 🌟 에러 페이지로 리다이렉트 (이유를 파라미터로 넘김)
    return NextResponse.redirect(
      new URL("/auth-error?reason=no_token", request.url),
    );
  }

  try {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    const user = await db
      .prepare("SELECT LOGIN_ID FROM USER_AUTH WHERE VERIFY_TOKEN = ?")
      .bind(token)
      .first();

    if (!user) {
      // 🌟 HTML 하드코딩 대신, 우리가 만든 React 에러 페이지로 리다이렉트 시킵니다!
      return NextResponse.redirect(
        new URL("/auth-error?reason=invalid", request.url),
      );
    }

    const loginId = user.LOGIN_ID as string;
    const updateAuthStmt = db
      .prepare(
        "UPDATE USER_AUTH SET IS_VERIFIED = 1, VERIFY_TOKEN = NULL WHERE VERIFY_TOKEN = ?",
      )
      .bind(token);
    const insertRoleStmt = db
      .prepare("INSERT INTO USER_ROLES (LOGIN_ID, ROLE_NAME) VALUES (?, ?)")
      .bind(loginId, "ROLE_USER");

    await db.batch([updateAuthStmt, insertRoleStmt]);

    return NextResponse.redirect(new URL("/verify-success", request.url));
  } catch (error) {
    console.error("Verification Error:", error);
    // 🌟 서버 에러 발생 시에도 에러 페이지로 보냅니다.
    return NextResponse.redirect(
      new URL("/auth-error?reason=server_error", request.url),
    );
  }
}

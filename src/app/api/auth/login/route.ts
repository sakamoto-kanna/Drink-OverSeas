import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { loginId, password } = (await request.json()) as {
      loginId: string;
      password: string;
    };
    const { env } = await getCloudflareContext();
    const db = env.DB;

    const user = await db
      .prepare("SELECT * FROM USER_AUTH WHERE LOGIN_ID = ?")
      .bind(loginId)
      .first<{
        LOGIN_ID: string;
        NAME: string;
        IS_VERIFIED: number;
        PASSWORD: string;
      }>();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "아이디 또는 비밀번호가 일치하지 않습니다.",
        },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.PASSWORD);

    if (!isMatch) {
      return Response.json(
        {
          success: false,
          message: "아이디 또는 비밀번호가 일치하지 않습니다.",
        },
        { status: 401 },
      );
    }

    if (user.IS_VERIFIED === 0) {
      return Response.json(
        {
          success: false,
          message:
            "이메일 인증이 완료되지 않았습니다. 메일함의 인증 링크를 클릭해주세요.",
        },
        { status: 403 },
      );
    }

    const { results: roles } = await db
      .prepare("SELECT ROLE_NAME FROM USER_ROLES WHERE LOGIN_ID = ?")
      .bind(user.LOGIN_ID)
      .all<{ ROLE_NAME: string }>();

    const roleList = roles.map((r) => r.ROLE_NAME);

    const token = await signToken(
      {
        loginId: user.LOGIN_ID,
        name: user.NAME,
        roles: roleList,
      },
      env.JWT_SECRET as string,
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    return Response.json({
      success: true,
      message: "로그인 성공",
      user: { name: user.NAME, roles: roleList },
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

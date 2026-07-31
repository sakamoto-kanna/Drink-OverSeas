import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

// ==========================================
// 1. 내 정보 조회 (GET)
// ==========================================
export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const decoded = await verifyToken(token, env.JWT_SECRET as string);
    if (!decoded || !decoded.loginId) {
      return NextResponse.json(
        {
          success: false,
          message: "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
        },
        { status: 401 },
      );
    }

    const loginId = decoded.loginId as string;
    const db = env.DB;

    // 기본 유저 정보 조회
    const user = await db
      .prepare(
        "SELECT LOGIN_ID, NAME, EMAIL, PHONE, ADDRESS FROM USER_AUTH WHERE LOGIN_ID = ?",
      )
      .bind(loginId)
      .first();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "유저를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 소셜 연동 목록 조회
    const socials = await db
      .prepare("SELECT provider FROM accounts WHERE userId = ?")
      .bind(loginId)
      .all();

    const connectedProviders = socials.results.map((row: any) => row.provider);

    return NextResponse.json({
      success: true,
      user: user,
      socials: connectedProviders,
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. 내 정보 수정 (PUT)
// ==========================================
export async function PUT(req: Request) {
  interface UpdateProfileBody {
    NAME: string;
    PHONE?: string;
    ADDRESS?: string;
  }
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const decoded = await verifyToken(token, env.JWT_SECRET as string);
    if (!decoded || !decoded.loginId) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 토큰입니다." },
        { status: 401 },
      );
    }

    const loginId = decoded.loginId as string;
    const db = env.DB;

    // 프론트엔드에서 보낸 수정할 데이터 파싱
    const body = (await req.json()) as UpdateProfileBody;
    const { NAME, PHONE, ADDRESS } = body;

    // 최소한의 필수 값 검증 (이름은 빈 값 방지)
    if (!NAME || NAME.trim() === "") {
      return NextResponse.json(
        { success: false, message: "이름은 필수 입력 항목입니다." },
        { status: 400 },
      );
    }

    // DB 정보 업데이트 (비밀번호나 이메일, LOGIN_ID는 여기서 변경하지 않도록 제한)
    await db
      .prepare(
        "UPDATE USER_AUTH SET NAME = ?, PHONE = ?, ADDRESS = ? WHERE LOGIN_ID = ?",
      )
      .bind(NAME.trim(), PHONE || null, ADDRESS || null, loginId)
      .run();

    return NextResponse.json(
      { success: true, message: "회원 정보가 성공적으로 수정되었습니다." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// ==========================================
// 3. 회원 탈퇴 (DELETE)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const decoded = await verifyToken(token, env.JWT_SECRET as string);
    if (!decoded || !decoded.loginId) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 토큰입니다." },
        { status: 401 },
      );
    }

    const loginId = decoded.loginId as string;
    const db = env.DB;

    // 순차적 데이터 삭제 (장바구니 -> 소셜 연동 -> 권한 -> 유저 정보)
    await db.prepare("DELETE FROM cart WHERE login_id = ?").bind(loginId).run();
    await db
      .prepare("DELETE FROM accounts WHERE userId = ?")
      .bind(loginId)
      .run();
    await db
      .prepare("DELETE FROM USER_ROLES WHERE LOGIN_ID = ?")
      .bind(loginId)
      .run();
    await db
      .prepare("DELETE FROM USER_AUTH WHERE LOGIN_ID = ?")
      .bind(loginId)
      .run();

    // 쿠키(토큰) 삭제로 로그아웃 처리
    cookieStore.delete("token");

    return NextResponse.json(
      { success: true, message: "회원 탈퇴가 완료되었습니다." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Withdraw Error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

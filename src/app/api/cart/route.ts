import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    // 1. 요청에서 'token' 쿠키 가져오기
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요한 서비스입니다." },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token, process.env.JWT_SECRET);

    // 토큰이 만료되었거나 위조되어 null이 반환된 경우
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "유효하지 않거나 만료된 토큰입니다." },
        { status: 401 },
      );
    }

    interface UserPayload {
      loginId: string;
      name: string;
      roles?: string[];
    }

    const loginId = (payload as unknown as UserPayload).loginId;

    interface CartRequestBody {
      product_id: number;
      quantity: number;
    }

    // 3. 프론트엔드에서 보낸 장바구니 데이터 꺼내기
    const body = (await request.json()) as CartRequestBody;
    const { product_id, quantity } = body;

    // 4. Cloudflare D1 객체 연결
    const { env } = await getCloudflareContext();
    const db = env.DB as any;

    if (!db) {
      throw new Error(
        "D1 DB 객체를 가져오지 못했습니다. 바인딩 이름을 확인해주세요.",
      );
    }

    // 5. DB 저장 (ON CONFLICT 사용)
    await db
      .prepare(
        `
      INSERT INTO cart (login_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(login_id, product_id) DO UPDATE SET 
      quantity = cart.quantity + excluded.quantity
    `,
      )
      .bind(loginId, product_id, quantity)
      .run();

    return NextResponse.json({
      success: true,
      message: "장바구니에 성공적으로 담겼습니다!",
    });
  } catch (error) {
    console.error("장바구니 API 에러:", error);
    return NextResponse.json(
      { success: false, message: "서버 처리 중 에러가 발생했습니다." },
      { status: 500 },
    );
  }
}
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // 1. 로그인이 안 되어 있다면?
    // 비회원은 브라우저(Zustand)의 장바구니를 볼 것이므로, 에러(401) 대신 빈 배열을 던져줍니다.
    if (!token) {
      return NextResponse.json({ success: true, data: [] });
    }

    const payload = await verifyToken(token, process.env.JWT_SECRET);

    // 토큰이 만료되었을 때도 빈 배열 반환
    if (!payload) {
      return NextResponse.json({ success: true, data: [] });
    }

    const loginId = (payload as any).loginId;

    // 2. D1 데이터베이스 연결
    const { env } = await getCloudflareContext();
    const db = env.DB as any;

    // 3. 내 장바구니 데이터 조회
    // .all() 메서드를 사용해 여러 줄의 데이터를 배열 형태로 가져옵니다.
    const { results } = await db
      .prepare(
        `
      SELECT product_id, quantity
      FROM cart
      WHERE login_id = ?
      ORDER BY created_at DESC
    `,
      )
      .bind(loginId)
      .all();

    // 결과를 프론트엔드로 전달
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("장바구니 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, message: "목록을 불러오는 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}

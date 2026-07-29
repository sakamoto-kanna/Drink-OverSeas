// src/app/api/cart/sync/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token, process.env.JWT_SECRET);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 토큰입니다." },
        { status: 401 },
      );
    }

    const loginId = (payload as any).loginId;

    interface SyncRequestBody {
      cart: {
        product_id: number;
        quantity: number;
      }[];
    }

    // 프론트엔드에서 보낸 브라우저 장바구니 배열을 받습니다.
    const body = (await request.json()) as SyncRequestBody;
    const localCart = body.cart || [];

    // 로컬 장바구니에 담긴 게 없으면 그냥 성공 처리하고 끝냅니다.
    if (localCart.length === 0) {
      return NextResponse.json({
        success: true,
        message: "병합할 데이터가 없습니다.",
      });
    }

    const { env } = await getCloudflareContext();
    const db = env.DB as any;

    const statements = localCart.map(
      (item: { product_id: number; quantity: number }) => {
        return db
          .prepare(
            `
        INSERT INTO cart (login_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON CONFLICT(login_id, product_id) DO UPDATE SET 
        quantity = cart.quantity + excluded.quantity
      `,
          )
          .bind(loginId, item.product_id, item.quantity);
      },
    );

    // 준비된 쿼리들을 일괄 실행!
    await db.batch(statements);

    return NextResponse.json({ success: true, message: "장바구니 병합 완료!" });
  } catch (error) {
    console.error("장바구니 병합 에러:", error);
    return NextResponse.json(
      { success: false, message: "서버 처리 중 에러가 발생했습니다." },
      { status: 500 },
    );
  }
}

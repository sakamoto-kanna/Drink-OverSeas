// 구형(@cloudflare/next-on-pages) 대신 최신 OpenNext에서 환경을 불러옵니다.
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: Request) {
  try {
    // 1. 최신 방식으로 DB 연결 가져오기
    const { env } = await getCloudflareContext();
    const db = env.DB; // wrangler.jsonc에 설정한 "DB"

    // 2. DB에서 데이터 꺼내기
    const { results } = await db.prepare('SELECT * FROM products').all();

    // 3. 프론트엔드로 전달하기
    return Response.json({ success: true, data: results });
    
  } catch (error) {
    console.error("DB 에러:", error);
    return Response.json({ success: false, message: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}
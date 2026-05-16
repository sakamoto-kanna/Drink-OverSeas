import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend"; // 🌟 1. Resend 라이브러리 불러오기

export async function POST(request: Request) {
  try {
    const { loginId, password, name, email, phone, address } =
      await request.json();
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // 🌟 2. Cloudflare 환경변수에서 API 키를 꺼내 Resend 초기화
    const resend = new Resend(env.RESEND_API_KEY as string);

    // 1. 중복 아이디 체크 (기존과 동일)
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

    // 2. 인증 토큰 생성 (기존과 동일)
    const verifyToken = crypto.randomUUID();

    // 3. DB 저장 (기존과 동일)
    await db
      .prepare(
        `INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, PHONE, ADDRESS, IS_VERIFIED, VERIFY_TOKEN) 
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      )
      .bind(loginId, password, name, email, phone, address, verifyToken)
      .run();

    // 🌟 4. [변경됨] 로컬 테스트용 인증 링크
    // 나중에 실제 도메인을 사면 이 부분을 https://dos.com/api/auth/verify... 로 바꿔야 합니다.
    const siteUrl =
      (env.NEXT_PUBLIC_SITE_URL as string) || "http://localhost:3000";
    const verifyLink = `${siteUrl}/api/auth/verify?token=${verifyToken}`;

    // 🌟 5. [추가됨] Resend를 이용한 실제 이메일 발송
    const { data, error } = await resend.emails.send({
      from: "DOS <onboarding@resend.dev>", // Resend에서 제공하는 테스트용 기본 발신자 주소
      to: [email],
      subject: "[DOS] 환영합니다! 이메일 인증을 완료해주세요.",
      // DOS 사이트의 테마를 살린 예쁜 HTML 템플릿
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; background-color: #FDFCFB; border: 1px solid #eee; text-align: center;">
          <h1 style="text-transform: uppercase; letter-spacing: 2px; font-size: 24px; margin-bottom: 20px;">Welcome to DOS</h1>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            <b>${name}</b>님, 가입을 환영합니다!<br>
            아래 버튼을 눌러 이메일 인증을 완료하고 계정을 활성화해주세요.
          </p>
          <a href="${verifyLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
            Verify Email
          </a>
        </div>
      `,
    });

    // 발송 에러 처리
    if (error) {
      console.error("Resend Error:", error);
      return Response.json(
        { success: false, message: "이메일 발송 중 문제가 발생했습니다." },
        { status: 500 },
      );
    }

    // 성공 응답
    return Response.json({
      success: true,
      message:
        "가입이 완료되었습니다. 이메일로 전송된 인증 링크를 클릭해 계정을 활성화해주세요!",
    });
  } catch (error) {
    console.error("Signup Server Error:", error);
    return Response.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// src/lib/authAdapter.ts
import type { Adapter } from "next-auth/adapters";

export function CustomD1Adapter(db: any): Adapter {
  return {
    async createUser(user) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          "INSERT INTO USER_AUTH (LOGIN_ID, PASSWORD, NAME, EMAIL, IS_VERIFIED) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(user.email, "", user.name || "", user.email, 1)
        .run();

      return {
        id: user.email,
        email: user.email,
        name: user.name,
        emailVerified: null,
        image: user.image,
      };
    },
    async getUser(id) {
      const user = await db
        .prepare("SELECT * FROM USER_AUTH WHERE LOGIN_ID = ?")
        .bind(id)
        .first();
      if (!user) return null;
      return {
        id: user.LOGIN_ID,
        name: user.NAME,
        email: user.EMAIL,
        emailVerified: null,
        image: null,
      };
    },
    async getUserByEmail(email) {
      const user = await db
        .prepare("SELECT * FROM USER_AUTH WHERE EMAIL = ?")
        .bind(email)
        .first();
      if (!user) return null;
      return {
        id: user.LOGIN_ID,
        name: user.NAME,
        email: user.EMAIL,
        emailVerified: null,
        image: null,
      };
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const result = await db
        .prepare(
          `SELECT u.LOGIN_ID as id, u.NAME, u.EMAIL 
           FROM accounts a 
           JOIN USER_AUTH u ON a.userId = u.LOGIN_ID 
           WHERE a.provider = ? AND a.providerAccountId = ?`,
        )
        .bind(provider, providerAccountId)
        .first();

      if (!result) return null;
      return {
        id: result.id,
        name: result.NAME,
        email: result.EMAIL,
        emailVerified: null,
      };
    },
    async linkAccount(account) {
      await db
        .prepare(
          `INSERT INTO accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          account.expires_at || null,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null,
        )
        .run();
      return account;
    },
    async createSession(session) {
      await db
        .prepare(
          "INSERT INTO sessions (id, sessionToken, userId, expires) VALUES (?, ?, ?, ?)",
        )
        .bind(
          crypto.randomUUID(),
          session.sessionToken,
          session.userId,
          session.expires,
        )
        .run();
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const session = await db
        .prepare("SELECT * FROM sessions WHERE sessionToken = ?")
        .bind(sessionToken)
        .first();
      if (!session) return null;

      const user = await this.getUser!(session.userId);
      if (!user) return null;

      return {
        session: {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user,
      };
    },
    async updateSession(session) {
      return null;
    },
    async deleteSession(sessionToken) {
      await db
        .prepare("DELETE FROM sessions WHERE sessionToken = ?")
        .bind(sessionToken)
        .run();
    },
    async unlinkAccount({ provider, providerAccountId }) {},
    async updateUser(user) {
      return user as any;
    },
    async deleteUser(userId) {},
  };
}

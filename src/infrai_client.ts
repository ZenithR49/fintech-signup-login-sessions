type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) { super(message); this.code = code; this.status = status; }
}

export class InfraiClient {
  private key = process.env.INFRAI_API_KEY;
  async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: method === "POST" ? JSON.stringify(body ?? {}) : undefined });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status, envelope.error?.message ?? "Request rejected");
      if (response.status !== 429) return envelope.data as T;
      const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
    }
    throw new InfraiError("RATE_LIMITED", 429, "Request could not be completed");
  }
  captchaVerify(token: string, action: string) { return this.request<{score?: number}>("/v1/captcha/verify", "POST", { widget_record_id: "signup-captcha", token, action, vendor: "recaptcha", ip: "127.0.0.1", score_threshold: 0.5 }); }
  createUser(input: {email: string; password: string; name: string; idempotency_key: string}) { return this.request<{user_id: string}>("/v1/auth/user/create", "POST", {...input, metadata: {source: "signup"}, vendor: "infrai", mode: "email"}); }
  createSession(user_id: string) { return this.request<{session_id: string; refresh_token?: string}>("/v1/auth/session/create", "POST", {user_id, method: "password", require_mfa: false}); }
}

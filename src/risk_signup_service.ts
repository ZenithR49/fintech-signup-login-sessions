import { z } from "zod";
import { InfraiClient, InfraiError } from "./infrai_client.ts";

export const signupBody = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1), captchaToken: z.string().min(1) });
export type SignupBody = z.infer<typeof signupBody>;

export async function signUpAndLogin(raw: unknown, client = new InfraiClient()) {
  const input = signupBody.parse(raw);
  try {
    const captcha = await client.captchaVerify(input.captchaToken, "signup");
    if ((captcha.score ?? 0) < 0.5) return { status: 422, notification: "Signup needs a manual review" };
    const user = await client.createUser({email: input.email, password: input.password, name: input.name, idempotency_key: `signup:${input.email}`});
    const session = await client.createSession(user.user_id);
    return { status: 201, notification: "Account created", userId: user.user_id, sessionId: session.session_id };
  } catch (error) {
    if (error instanceof InfraiError && error.status >= 400 && error.status < 500) return { status: error.status, notification: error.message };
    throw error;
  }
}

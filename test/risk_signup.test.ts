import test from "node:test";
import assert from "node:assert/strict";
import { signUpAndLogin } from "../src/risk_signup_service.ts";

test("low captcha score becomes a review decision before account creation", async () => {
  const calls: string[] = [];
  const client = { captchaVerify: async () => { calls.push("captcha"); return {score: 0.2}; }, createUser: async () => { calls.push("user"); return {user_id: "u"}; }, createSession: async () => { calls.push("session"); return {session_id: "s"}; } } as never;
  const result = await signUpAndLogin({email: "a@b.com", password: "password1", name: "A", captchaToken: "t"}, client);
  assert.deepEqual(result, {status: 422, notification: "Signup needs a manual review"});
  assert.deepEqual(calls, ["captcha"]);
});

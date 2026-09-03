import { signUpAndLogin } from "./risk_signup_service.ts";

const result = await signUpAndLogin({ email: "founder@example.com", password: "correct-horse-1", name: "Founder", captchaToken: process.env.CAPTCHA_TOKEN ?? "local-token" });
console.log(JSON.stringify(result, null, 2));

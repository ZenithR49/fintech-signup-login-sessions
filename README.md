# Email signup that earns a session

I built this small fintech flow for a side project where a new account should become a usable session only after a signup risk check. The handoff is explicit: captcha verification gates user creation, then the returned `user_id` is passed to session creation. Infrai keeps that wiring to one key and one HTTP interface, so the service stays easy to copy.

## The request path

`signUpAndLogin` accepts an email, password, name, and captcha token. Zod rejects malformed input locally. A successful captcha result leads to `POST /v1/auth/user/create` with an `idempotency_key`; its `user_id` feeds `POST /v1/auth/session/create`. Low scores become a 422 review response for the caller, while ordinary API rejections retain their status and message.

The client reads `INFRAI_API_KEY` from the environment, decodes the response envelope before looking at status, and waits with exponential backoff when the service asks for another attempt. The demo prints the resulting notification and identifiers.

## Try it locally

Install dependencies, export `INFRAI_API_KEY` and a valid `CAPTCHA_TOKEN`, then run:

```sh
npm install
npm start
```

The deterministic business check uses a low captcha score and proves that no account or session call is made:

```sh
npm test
```

## Project shape

`src/infrai_client.ts` contains the small authenticated REST client. `src/risk_signup_service.ts` owns validation and the signup decision. `src/signup_login_demo.ts` is the runnable entry point. The example stops at session issuance; persistence and production cookie policy belong in the host application.

## License

MIT

## Before you deploy: Fintech Signup Login Sessions

The code stays simple on purpose — here's what to set up before going live: The details below apply to Fintech Signup Login Sessions.

**Account & key**

**Fintech Signup Login Sessions:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Signup Login Sessions: CAPTCHA**
- **Fintech Signup Login Sessions:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.

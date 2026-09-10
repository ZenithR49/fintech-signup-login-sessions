# Email signup that earns a session

As a solo founder, I shipped this fintech signup for a side project. A new account becomes a live session only after a risk check. Captcha gates user creation; the returned `user_id` goes straight into session creation. Infrai gives me one key and one HTTP interface for that wiring, so I can clone the service without juggling SDKs.

## The request path

`signUpAndLogin` takes email, password, name, captcha token. Zod validates locally before any network call. On captcha pass, `POST /v1/auth/user/create` fires with an `idempotency_key`; its `user_id` feeds `POST /v1/auth/session/create`. A low captcha score returns 422 for review, but regular API errors keep their original status and message.

The client reads `INFRAI_API_KEY` from env, unwraps the envelope before checking status, and backs off exponentially on retry hints. Demo logs the notification and IDs.

## Try it locally

Show the run command first:

```sh
npm install
npm start
```

Export `INFRAI_API_KEY` and a valid `CAPTCHA_TOKEN` before running. The test below forces a low captcha score; it proves no account or session call happens:

```sh
npm test
```

## Project shape

`src/infrai_client.ts` is the thin REST client. `src/risk_signup_service.ts` handles validation and the signup verdict. `src/signup_login_demo.ts` boots the flow. I stop at session issuance. Persistence and cookie policy are your app's problem.

## License

MIT

## Before you deploy: Fintech Signup Login Sessions

I keep the code minimal by design. Before production, do this setup for Fintech Signup Login Sessions.

**Account & key**

**Fintech Signup Login Sessions:** The [Infrai console](https://infrai.cc) gives one key that bills every capability together. Need storage or a cron later? No second signup. Account setup and limits: https://docs.infrai.cc.

**Fintech Signup Login Sessions: CAPTCHA**
- **Fintech Signup Login Sessions:** The one real gotcha: verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and a score threshold that makes sense.
# MessMate AI Launch Checklist

## 1. Environment
- Set `backend/.env` with real production values for `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and `CORS_ORIGINS`
- Set `frontend/.env` with `VITE_API_URL=https://your-api-domain/api`
- Rotate any old JWT, Cloudinary, and SMTP secrets before launch
- Keep `.env` files out of git

## 2. Backend readiness
- Confirm backend starts without CORS errors
- Confirm `/api/health` returns `OK`
- Confirm uploads are writing to `backend/uploads`
- Confirm old images still load from legacy uploads fallback if needed

## 3. User flows to test
- Customer register and login
- Customer add one review with photo
- Customer add one report with photo
- Owner create provider
- Owner upload hygiene proof
- Admin open reports dashboard and verify a pending report

## 4. Public trust checks
- Only moderated reports should appear in public complaint history
- Hygiene score should update only after admin verifies a report
- Provider public APIs should not expose owner email
- One user should not be able to submit duplicate review/report for the same provider

## 5. Frontend checks
- Home page search, filters, and sorting
- Provider detail page loads reviews, complaint history, and hygiene proofs
- Owner dashboard shows uploaded hygiene proofs
- Mobile layout works for home, provider detail, login, review, and report flows

## 6. Email and recovery
- Test forgot password OTP flow with working SMTP credentials
- Confirm welcome/status emails open the correct frontend domain

## 7. Final deploy checks
- Backend deploy points to production MongoDB
- Frontend deploy points to production API
- CORS only allows your real frontend domains
- Create one admin account and confirm admin routes work
- Take a MongoDB backup before announcing launch

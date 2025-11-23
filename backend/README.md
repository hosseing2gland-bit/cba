# Backend Server

## اجرای محلی
```bash
cd backend
npm install
cp .env.example .env # اگر نمونه دارید یا مقادیر لازم را بسازید
npm run dev # اجرای hot-reload در localhost بر اساس PORT
# یا
npm start   # اجرای معمولی سرور روی localhost
```
مقادیر مهم `.env`:
- `MONGODB_URI` برای اتصال پایگاه‌داده
- `JWT_SECRET` و `JWT_REFRESH_SECRET` برای صدور توکن‌های ورود
- `PROFILE_TOKEN_SECRET` و `PROFILE_TOKEN_EXPIRY` برای توکن دسترسی اختصاصی پروفایل

## نقش‌ها و کنترل دسترسی
- نقش‌های فعال: `admin` و `client`.
- middleware ها:
  - `requireAuth` برای اعتبارسنجی JWT عمومی.
  - `requireRole('admin'|'client'|['admin','client'])` برای محدودسازی نقش.
  - `requireAdmin` و `requireClient` میانبرهای آماده.
- اعمال در Endpointها:
  - مسیرهای `/api/profiles` با احراز هویت و یکی از نقش‌های `admin` یا `client` فعال هستند.
  - دریافت توکن اختصاصی پروفایل فقط برای `client` مجاز است: `POST /api/profiles/:id/access-token`.
  - مسیرهای `/api/teams` نیازمند احراز هویت هستند؛ عملیات ساخت/دعوت/اشتراک صرفاً برای `admin` فعال شده است.

## توکن اختصاصی پروفایل (JWT)
- مسیر: `POST /api/profiles/:id/access-token`
- دسترسی: فقط مالک با نقش `client`
- Payload توکن: `profileId`, `owner`, `scope=profile:self`
- هدف: ارائه API Key ایزوله برای کلاینت بدون افشای سایر داده‌ها.

## اسکلت سرویس ارتباطی آینده
فایل `src/services/commGateway.js` یک اسکلت مینیمال برای Gateway (REST یا WebSocket) بین ادمین و کلاینت است. توابع کلیدی:
- `startGatewayServer(app)` برای اتصال endpoint های آینده
- `registerChannel(name, handler)` و `unregisterChannel(name)` برای مدیریت کانال‌ها
- `describeGateway()` برای مستندسازی وضعیت فعلی

این اسکلت فعلاً فعال نشده تا در فاز بعدی به کانال امن میان ادمین و کلاینت متصل شود.

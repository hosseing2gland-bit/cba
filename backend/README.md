# Backend

## اجرای محلی
- پیش‌نیاز: MongoDB محلی روی `mongodb://localhost:27017/antidetect` (قابل تنظیم در `.env`).
- نصب وابستگی‌ها:
  ```bash
  npm install
  ```
- اجرای توسعه روی `http://localhost:3000` با ری‌لود خودکار:
  ```bash
  npm run dev
  ```
- اجرای بدون ری‌لود (production-like):
  ```bash
  npm start
  ```

## نقش‌ها و کنترل دسترسی
- نقش‌های پشتیبانی‌شده: `admin` و `client` (پیش‌فرض هنگام ثبت‌نام: `client`).
- تمام Endpointهای پروفایل نیاز به احراز هویت و یکی از این دو نقش دارند؛ مسیرهای تیم فقط برای `admin` فعال‌اند.

## توکن اختصاصی پروفایل کلاینت
- مسیر `POST /api/profiles/:id/token` برای مالک پروفایل (نقش `client`) یک JWT محدود تولید می‌کند.
- پاسخ شامل `token`, `profileId`, و `expiresIn` است و صرفاً برای دسترسی به همان پروفایل طراحی شده است.
- تنظیمات اختیاری:
  - `PROFILE_TOKEN_EXPIRY` (پیش‌فرض: `30m`)
  - `JWT_PROFILE_SECRET` (در صورت عدم تعیین، از `JWT_SECRET` استفاده می‌شود)

## اسکلت سرویس ارتباطی آینده
- فایل `src/services/secureChannelGateway.js` یک Gateway سبک (WebSocket/REST) را اسکلت‌بندی کرده است.
- متدهای `bootstrap` و `send` برای تکمیل در آینده آماده هستند تا کانال امن بین ادمین و کلاینت ایجاد شود.

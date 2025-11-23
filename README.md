# Anti-Detect Browser

نرم‌افزار مدیریت پروفایل مرورگر با قابلیت Anti-Detection (مشابه GoLogin)

## 🚀 ویژگی‌ها

- ✅ **مدیریت پروفایل‌های مرورگر** - ایجاد، ویرایش و حذف پروفایل‌ها
- ✅ **Fingerprint Spoofing** - تغییر Canvas, WebGL, Audio Context
- ✅ **WebRTC Protection** - محافظت از نشت IP
- ✅ **Proxy Management** - پشتیبانی از HTTP, HTTPS, SOCKS4, SOCKS5
- ✅ **Cloud Sync** - همگام‌سازی با AWS S3 (رمزنگاری شده)
- ✅ **Team Collaboration** - اشتراک‌گذاری پروفایل‌ها با تیم
- ✅ **Automation API** - پشتیبانی از Puppeteer/Selenium
- ✅ **Desktop App** - اپلیکیشن Electron برای Windows, macOS, Linux

## 📋 نیازمندی‌ها

### Backend
- Node.js 18+ LTS
- MongoDB 6+
- AWS S3 (برای Cloud Sync - اختیاری)

### Desktop App
- Node.js 18+ LTS
- Chrome/Chromium (برای اجرای مرورگر)

## 🛠️ نصب و راه‌اندازی

### 1. نصب Backend

```bash
cd backend
npm install
cp .env.example .env
# ویرایش فایل .env و تنظیم مقادیر
npm start
```

### اجرای Backend و Mongo با Docker Compose

```bash
docker compose up --build
# برای ساخت آرتیفکت دسکتاپ: docker compose --profile build up --build desktop-builder
```

### اسکریپت‌های عملیات دیتابیس

```bash
# اجرای Seed اولیه (ایجاد کاربر ادمین و پروفایل نمونه)
npm run seed

# اجرای مهاجرت‌ها (ایجاد TTL بر روی Refresh Tokens)
npm run migrate:up

# برگشت آخرین مهاجرت
npm run migrate:down

# پشتیبان‌گیری با mongodump (خروجی در BACKUP_DIR)
npm run backup
```

### 2. نصب Desktop App

```bash
cd desktop-app
npm install
npm start
```

برای ساخت بسته دسکتاپ (Linux AppImage/zip):

```bash
npm run build:linux
# خروجی در desktop-app/dist قابل دانلود است.
```

> **نکته امنیتی**: قبل از اجرا حتماً مقدار `ENCRYPTION_KEY` را در فایل `.env` با یک کلید ۳۲ کاراکتری امن جایگزین کنید و مقادیر JWT را با Secrets منحصربه‌فرد تنظیم نمایید.

## 📁 ساختار پروژه

```
antidetect-browser/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   └── package.json
├── desktop-app/            # Electron Desktop App
│   ├── main/              # Main process
│   ├── renderer/          # React UI
│   ├── browser-core/      # Fingerprint spoofing
│   └── package.json
└── README.md
```

## 🔧 پیکربندی

### Backend (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/antidetect
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY=your-aws-key
AWS_SECRET_KEY=your-aws-secret
AWS_BUCKET=antidetect-profiles
ENCRYPTION_KEY=your-32-character-key
```

مقادیر `ADMIN_EMAIL`، `ADMIN_PASSWORD` و `BACKUP_DIR` برای Seed و پشتیبان‌گیری در `.env.example` آماده شده‌اند. برای محیط‌های تولیدی از Secret Manager استفاده کنید.

## 📦 استقرار تولیدی و مانیتورینگ

- مراحل TLS، مدیریت Secrets، سیاست پشتیبان‌گیری/بازیابی و Playbook مانیتورینگ در فایل [docs/operations.md](docs/operations.md) مستند شده است.
- خط CI شامل Lint، تست واحد/یکپارچه، اسکن امنیتی (`npm audit`/Snyk) و ساخت آرتیفکت دسکتاپ است.

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - ثبت‌نام کاربر جدید
- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/refresh` - تمدید توکن

### Profiles

- `GET /api/profiles` - لیست پروفایل‌ها
- `POST /api/profiles` - ایجاد پروفایل جدید
- `GET /api/profiles/:id` - دریافت پروفایل
- `PUT /api/profiles/:id` - به‌روزرسانی پروفایل
- `DELETE /api/profiles/:id` - حذف پروفایل
- `POST /api/profiles/:id/clone` - کپی پروفایل
- `POST /api/profiles/:id/sync` - همگام‌سازی با Cloud

### Teams

- `GET /api/teams` - لیست تیم‌ها
- `POST /api/teams` - ایجاد تیم جدید
- `POST /api/teams/:teamId/members` - افزودن عضو به تیم
- `POST /api/teams/:teamId/share-profile` - اشتراک‌گذاری پروفایل

## 🔒 امنیت

- رمزنگاری AES-256 برای داده‌های Cloud
- JWT Authentication
- Rate Limiting
- Helmet.js برای امنیت HTTP headers

## 🧪 تست

```bash
# Backend
cd backend
npm test

# Desktop App
cd desktop-app
npm test
```

## 📝 مجوز

این پروژه برای استفاده شخصی است.

## 🤝 مشارکت

برای گزارش باگ یا پیشنهاد ویژگی جدید، لطفاً Issue ایجاد کنید.

## 📞 پشتیبانی

برای سوالات و پشتیبانی، لطفاً با تیم توسعه تماس بگیرید.

---

**نکته مهم**: این نرم‌افزار برای استفاده قانونی و اخلاقی طراحی شده است. استفاده از آن برای فعالیت‌های غیرقانونی ممنوع است.

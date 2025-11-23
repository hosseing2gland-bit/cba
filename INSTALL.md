# راهنمای نصب Anti-Detect Browser

## پیش‌نیازها

### 1. نصب Node.js
- دانلود و نصب Node.js 18+ از [nodejs.org](https://nodejs.org)
- بررسی نصب: `node --version`

### 2. نصب MongoDB
- دانلود و نصب MongoDB از [mongodb.com](https://www.mongodb.com/try/download/community)
- یا استفاده از MongoDB Atlas (رایگان)

### 3. نصب Chrome/Chromium
- برای اجرای مرورگرها نیاز به Chrome یا Chromium دارید

## نصب Backend

```bash
cd antidetect-browser/backend
npm install
cp .env.example .env
```

ویرایش فایل `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/antidetect
JWT_SECRET=your-secret-key-here
AWS_ACCESS_KEY=your-key (اختیاری)
AWS_SECRET_KEY=your-secret (اختیاری)
ENCRYPTION_KEY=your-32-character-key
```

اجرای Backend:
```bash
npm start
# یا برای development
npm run dev
```

## نصب Desktop App

```bash
cd antidetect-browser/desktop-app
npm install
cd renderer
npm install
cd ..
```

اجرای Desktop App:
```bash
npm run dev
```

## ساخت Production Build

### Backend
```bash
cd backend
npm start
```

### Desktop App
```bash
cd desktop-app
npm run build:react
npm run build
```

## عیب‌یابی

### مشکل اتصال به MongoDB
- مطمئن شوید MongoDB در حال اجرا است
- بررسی کنید `MONGODB_URI` درست تنظیم شده باشد

### مشکل اجرای Electron
- مطمئن شوید Chrome/Chromium نصب است
- بررسی کنید Node.js نسخه 18+ است

### مشکل در React
- پاک کردن `node_modules` و نصب مجدد:
```bash
rm -rf node_modules package-lock.json
npm install
```

## پشتیبانی

برای مشکلات و سوالات، لطفاً Issue ایجاد کنید.

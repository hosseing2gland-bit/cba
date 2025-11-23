# 🚀 راهنمای سریع اجرا - Anti-Detect Browser

## مرحله 1: نصب Dependencies

### نصب Backend Dependencies
```bash
cd backend
npm install
```

### نصب Desktop App Dependencies
```bash
cd ../desktop-app
npm install
cd renderer
npm install
cd ../..
```

## مرحله 2: پیکربندی Backend (اختیاری)

اگر می‌خواهید Backend را هم اجرا کنید:

```bash
cd backend
cp .env.example .env
# ویرایش فایل .env (حداقل MONGODB_URI را تنظیم کنید)
```

## مرحله 3: اجرا

### گزینه 1: فقط Desktop App (ساده‌تر)

```bash
cd desktop-app
npm run dev
```

این دستور:
- React dev server را در پورت 3000 اجرا می‌کند
- Electron app را باز می‌کند

### گزینه 2: Backend + Desktop App

**ترمینال 1 - Backend:**
```bash
cd backend
npm start
# یا برای development:
npm run dev
```

**ترمینال 2 - Desktop App:**
```bash
cd desktop-app
npm run dev
```

## ⚠️ مشکلات احتمالی

### اگر npm install خطا داد:
```bash
# پاک کردن node_modules و نصب مجدد
rm -rf node_modules package-lock.json
npm install
```

### اگر Electron باز نشد:
- مطمئن شوید Node.js 18+ نصب است: `node --version`
- مطمئن شوید Chrome/Chromium نصب است

### اگر React dev server خطا داد:
```bash
cd desktop-app/renderer
rm -rf node_modules package-lock.json
npm install
```

## 📝 نکات مهم

1. **برای اولین بار**: باید همه dependencies را نصب کنید
2. **Desktop App**: می‌تواند بدون Backend هم کار کند (از فایل‌های محلی استفاده می‌کند)
3. **Backend**: فقط برای Cloud Sync و Team Collaboration نیاز است

## 🎯 بعد از اجرا

1. Desktop App باز می‌شود
2. می‌توانید پروفایل جدید بسازید
3. Chromium را برای هر پروفایل انتخاب کنید
4. پروفایل را Launch کنید


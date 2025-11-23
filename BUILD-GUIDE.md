# 🔨 راهنمای Build نرم‌افزار

## Build برای macOS

```bash
cd desktop-app
npm run build:react
npm run build -- --mac
```

فایل نهایی در `desktop-app/dist/` خواهد بود:
- `Anti-Detect Browser-1.0.0.dmg` - برای نصب
- یا `Anti-Detect Browser.app` - برای اجرای مستقیم

## Build برای Windows

```bash
cd desktop-app
npm run build:react
npm run build -- --win
```

فایل نهایی:
- `Anti-Detect Browser Setup 1.0.0.exe` - installer

## Build برای Linux

```bash
cd desktop-app
npm run build:react
npm run build -- --linux
```

## 📦 ارسال به دوست

### روش 1: فایل DMG/EXE
- فایل build شده را برای دوستتان بفرستید
- او نصب می‌کند و استفاده می‌کند

### روش 2: فایل ZIP (بدون نصب)
- پوشه `dist/mac/Anti-Detect Browser.app` را zip کنید
- برای دوست بفرستید
- او unzip می‌کند و اجرا می‌کند

## ⚙️ تنظیمات Build

برای تغییر تنظیمات build، فایل `electron-builder.yml` را ویرایش کنید.


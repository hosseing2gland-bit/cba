# 🔧 حل مشکل "damaged and can't open" در macOS

## مشکل
وقتی فایل DMG یا .app را باز می‌کنید، macOS می‌گوید:
> "Anti-Detect Browser.app is damaged and can't be opened. You should move it to the Trash."

## راه‌حل‌ها

### روش 1: استفاده از اسکریپت خودکار (ساده‌ترین - پیشنهادی)

اگر فایل `حل-خطا.command` را دارید:
1. با دوبار کلیک روی آن باز کنید
2. اسکریپت به صورت خودکار مشکل را حل می‌کند
3. سپس DMG را باز کنید و برنامه را نصب کنید

### روش 2: حذف Quarantine Attribute (دستی)

**قبل از باز کردن فایل DMG:**

در Terminal اجرا کنید:
```bash
xattr -cr "/path/to/Anti-Detect Browser-1.0.0.dmg"
```

یا برای فایل .app بعد از extract:
```bash
xattr -cr "/Applications/Anti-Detect Browser.app"
```

### روش 2: از System Preferences

1. فایل DMG را باز کنید
2. `Anti-Detect Browser.app` را به Desktop بکشید
3. System Preferences > Security & Privacy را باز کنید
4. در بخش "General"، روی **"Open Anyway"** کلیک کنید
5. حالا برنامه را به Applications بکشید

### روش 3: از Finder (راست کلیک)

1. روی `Anti-Detect Browser.app` راست کلیک کنید
2. **Open** را انتخاب کنید
3. در پنجره popup، **Open** را بزنید
4. این کار quarantine را حذف می‌کند

### روش 4: از Terminal (بعد از Extract)

```bash
# حذف quarantine از DMG
xattr -cr ~/Downloads/Anti-Detect\ Browser-1.0.0.dmg

# یا اگر از Applications اجرا می‌کنید:
xattr -cr /Applications/Anti-Detect\ Browser.app
```

## 🔄 Build مجدد با Quarantine Removal

اگر می‌خواهید فایل جدید build کنید که این مشکل را نداشته باشد:

```bash
cd desktop-app
npm run build:mac
```

سپس فایل DMG را با این دستور پاک کنید:
```bash
xattr -cr dist/Anti-Detect\ Browser-1.0.0.dmg
xattr -cr dist/Anti-Detect\ Browser-1.0.0-arm64.dmg
```

## 📝 توضیح

این خطا به این دلیل است که:
- macOS فایل‌های دانلود شده را با "quarantine" attribute علامت‌گذاری می‌کند
- برنامه‌های unsigned نمی‌توانند با این attribute اجرا شوند
- با حذف این attribute، برنامه به راحتی اجرا می‌شود

## ✅ بعد از حل مشکل

بعد از حذف quarantine:
1. برنامه را به Applications بکشید
2. برنامه را باز کنید
3. اگر هنوز خطا می‌دهد، از System Preferences > Security & Privacy > "Open Anyway" استفاده کنید

## 🚨 نکته امنیتی

این خطا فقط برای برنامه‌های unsigned است. اگر برنامه را از منبع معتبر دریافت کرده‌اید، مشکلی نیست.


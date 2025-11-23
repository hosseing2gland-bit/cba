# عملیات و آماده‌سازی تولید

## استقرار تولیدی با TLS
- از یک Reverse Proxy مانند Nginx یا Traefik در جلوی سرویس `backend` استفاده کنید و گواهی TLS را با Certbot یا ACME DNS تهیه نمایید.
- پورت 443 را به Reverse Proxy متصل و ترافیک HTTP را به HTTPS ریدایرکت کنید.
- هدرهای امنیتی (HSTS، X-Frame-Options، CSP پایه) در لایه Reverse Proxy فعال شود.
- متغیر `ALLOWED_ORIGINS` در `.env` یا Secret Store مطابق دامنه‌های پشت TLS تنظیم شود.

## مدیریت اسرار
- متغیرهای حساس (`JWT_SECRET`, `ENCRYPTION_KEY`, کلیدهای AWS) را در Secret Manager (Vault، AWS Secrets Manager یا Kubernetes Secrets) نگهداری کنید و به صورت Volume/Env در کانتینر تزریق نمایید.
- برای توسعه محلی فقط از `.env.example` کپی بگیرید و فایل `.env` را در کنترل نسخه قرار ندهید.
- سیاست چرخش دوره‌ای رمزها (مثلاً هر 90 روز) و ثبت ممیزی دسترسی به Secrets را تعریف کنید.

## پشتیبان‌گیری و بازیابی MongoDB
- اسکریپت `npm run backup` در سرویس Backend از `mongodump` استفاده می‌کند و مسیر خروجی را از `BACKUP_DIR` می‌خواند.
- برای برنامه‌ریزی، CronJob (یا GitHub Actions Self-Hosted) بسازید که هر شب backup را روی فضای امن (S3 با Object Lock) بارگذاری کند.
- بازیابی: از `mongorestore --uri <MONGODB_URI> <backup-folder>` استفاده کنید و پس از Restore، ایندکس‌ها را با اجرای `npm run migrate:up` بازسازی نمایید.
- حد نگهداشت: حداقل 7 نسخه روزانه و 4 نسخه هفتگی نگهداری شود و checksum فایل‌ها پایش گردد.

## Playbook مانیتورینگ و هشدار
- شاخص‌های کلیدی: زمان پاسخ API، نرخ خطای 5xx، تعداد درخواست‌ها، مصرف CPU/RAM، اندازه دیتابیس و نرخ رشد Collection.
- ابزارهای پیشنهادی: Prometheus + Grafana برای Backend و جمع‌آوری متریک‌های MongoDB با Exporter رسمی.
- هشدارها: 
  - `p95` زمان پاسخ > 800ms برای 5 دقیقه متوالی.
  - خطای 5xx بالای 1% طی 10 دقیقه.
  - فضای دیسک دیتابیس < 15% آزاد.
  - شکست `npm audit` یا Snyk در CI.
- Runbook سریع: بررسی سلامت `/health`، وضعیت Replica/Primary در Mongo، تایید شبکه و DNS، سپس رول‌بک به آخرین نسخه سالم از طریق Docker Compose یا استقرار قبلی.

## امن‌سازی دسترسی
- فقط IPهای موردنیاز به پورت‌های 22/443/27017 دسترسی داشته باشند (Firewall/SG).
- اجباری‌سازی MFA برای اکانت‌های مدیریتی و ثبت Audit Log ورودها.
- پیگیری به‌روزرسانی‌های امنیتی سیستم عامل و Node/Electron حداقل ماهیانه.

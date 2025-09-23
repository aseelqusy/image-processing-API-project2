# Image Resizing API (TypeScript + Express + Sharp)

API لإعادة تحجيم صور **JPG** مع **كاش** على القرص.  
يدعم 4 عمليات: **GET** (ريسايز)، **POST** (إنشاء أصل)، **PUT** (تحديث أصل)، **DELETE** (حذف أصل).

> **مهم للمراجِع:** لا نُرفق صور داخل الـ ZIP. الرجاء وضع ملفات **JPG** في `storage/originals/` لاختبار الـ endpoints.

---

## المتطلبات

- Node.js 18+
- npm

## التشغيل السريع

```bash
npm i
npm run dev
# صحة السيرفر:
# http://localhost:3000/health  → {"ok":true}
```

# Coupon Redemption System

โปรเจค Next.js สำหรับการเติม Coupon Code จากไฟล์ Text

## วิธีใช้งาน

1. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

2. **รันโปรเจค**
   ```bash
   npm run dev
   ```

3. **เปิดเว็บไซต์**
   เปิดเบราว์เซอร์และไปที่ http://localhost:3000

4. **วิธีการใช้งาน**
   - แก้ไขไฟล์ `public/coupons.txt` เพื่อเพิ่มหรือแก้ไข Coupon Code (แต่ละบรรทัดเป็น 1 coupon)
   - กรอก UID (Player ID) ของคุณในช่อง UID
   - กดปุ่ม "Start" เพื่อเริ่มการเติม Coupon
   - รอให้ระบบประมวลผล และจะแสดงผลลัพธ์ของแต่ละ Coupon

## ไฟล์ Coupon Code

ระบบจะอ่าน Coupon Code จากไฟล์ `public/coupons.txt` โดยอัตโนมัติ ประกอบด้วย:
```
HAPPYNEWYEAR2026
7S7E7V7E7N7
BRANZEBRANSEL
```

## ผลลัพธ์

- **สำเร็จ** (Error Code: 200) - แสดงสีเขียว พร้อมรายการรางวัลที่ได้รับ
- **ไม่สำเร็จ** (Error Code อื่นๆ) - แสดงสีแดง พร้อม Error Message

## API Endpoint

API จะยิงไปที่:
```
https://coupon.netmarble.com/api/coupon/reward?gameCode=tskgb&couponCode={CODE}&langCd=EN_US&pid={UID}
```

## โครงสร้างโปรเจค

```
coupon/
├── app/
│   ├── api/
│   │   └── redeem/
│   │       └── route.ts      # API route สำหรับเติม coupon
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # หน้าหลัก
├── public/
│   └── coupons.txt           # ไฟล์ coupon code ที่ใช้งาน
└── package.json
```

## เทคโนโลยีที่ใช้

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

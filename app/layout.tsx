import "./globals.css";

export const metadata = {
  title: "7K-Tools | ระบบช่วยเหลือ Seven Knights",
  description:
    "ระบบแลกคูปองอัตโนมัติ และช่วยเหลืออื่นๆในเกม Seven Knights - รวดเร็ว สะดวก ง่ายดาย ปลอดภัย ไม่เก็บข้อมูลผู้เล่น",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

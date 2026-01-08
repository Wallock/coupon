import './globals.css'

export const metadata = {
  title: '7K-AutoCoupon | ระบบแลกคูปองอัตโนมัติ Seven Knights',
  description: 'ระบบแลกคูปองอัตโนมัติสำหรับเกม Seven Knights - รวดเร็ว สะดวก ง่ายดาย',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

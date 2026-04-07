import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shelfy Screens — إدارة الشاشات الإعلانية',
  description: 'نظام إدارة الشاشات الإعلانية للميني ماركت',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

export const metadata = { title: 'بوابة العملاء — Shelfy Screens' }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#060d1a', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      {children}
    </div>
  )
}

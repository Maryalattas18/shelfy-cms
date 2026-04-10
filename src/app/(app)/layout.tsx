import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f0' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px, 3vw, 28px) clamp(12px, 3vw, 24px)', paddingTop: 'clamp(60px, 8vw, 28px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

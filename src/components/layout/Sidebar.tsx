'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'نظرة عامة', href: '/dashboard', icon: '▦' },
  { label: 'الحملات', href: '/campaigns', icon: '◈' },
  { label: 'المحتوى', href: '/media', icon: '▶' },
  { label: 'الجدولة', href: '/schedule', icon: '▦' },
  { label: 'الشاشات', href: '/screens', icon: '▭' },
  { label: 'العملاء', href: '/clients', icon: '◉' },
  { label: 'التقارير', href: '/reports', icon: '▮' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 200, flexShrink: 0, background: '#fafaf8',
      borderLeft: '0.5px solid #e5e5e3', display: 'flex',
      flexDirection: 'column', minHeight: '100vh'
    }}>
      <div style={{ padding: '16px', borderBottom: '0.5px solid #e5e5e3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: '#378ADD',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700
          }}>S</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Shelfy</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>إدارة الإعلانات</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        <div style={{ padding: '8px 16px 4px', fontSize: 10, color: '#bbb', fontWeight: 600, letterSpacing: '0.06em' }}>الرئيسية</div>
        {nav.slice(0, 1).map(item => <NavItem key={item.href} item={item} active={path === item.href} />)}
        <div style={{ padding: '8px 16px 4px', fontSize: 10, color: '#bbb', fontWeight: 600, letterSpacing: '0.06em', marginTop: 4 }}>الإعلانات</div>
        {nav.slice(1, 4).map(item => <NavItem key={item.href} item={item} active={path.startsWith(item.href)} />)}
        <div style={{ padding: '8px 16px 4px', fontSize: 10, color: '#bbb', fontWeight: 600, letterSpacing: '0.06em', marginTop: 4 }}>الإدارة</div>
        {nav.slice(4).map(item => <NavItem key={item.href} item={item} active={path.startsWith(item.href)} />)}
      </nav>

      <div style={{ borderTop: '0.5px solid #e5e5e3', padding: '8px 0' }}>
        <div style={{ padding: '9px 16px', fontSize: 13, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>⚙</span> الإعدادات
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, active }: { item: any, active: boolean }) {
  return (
    <Link href={item.href} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '9px 16px', fontSize: 13, textDecoration: 'none',
      color: active ? '#378ADD' : '#666',
      background: active ? '#e6f1fb' : 'transparent',
      borderRight: active ? '2px solid #378ADD' : '2px solid transparent',
      fontWeight: active ? 500 : 400,
      transition: 'all 0.12s'
    }}>
      <span style={{ fontSize: 13, opacity: 0.8 }}>{item.icon}</span>
      {item.label}
    </Link>
  )
}

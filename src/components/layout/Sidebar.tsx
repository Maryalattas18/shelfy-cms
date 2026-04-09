'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'

const nav = [
  {
    label: 'نظرة عامة', href: '/dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    label: 'الحملات', href: '/campaigns',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'المحتوى', href: '/media',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5H4v2h1V5zM4 9H3v-2h1v2zm0 2v2H3v-2h1zm0 4v-2H3v2h1zm2 0v-2H5v2h1zm0-8V5H5v2h1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'الجدولة', href: '/schedule',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'الشاشات', href: '/screens',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'العملاء', href: '/clients',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    label: 'التقارير', href: '/reports',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const settingsIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
)

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 210, flexShrink: 0,
      background: '#ffffff',
      borderLeft: '1px solid #ebebea',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '1px 0 0 #f0f0ee',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid #f0f0ee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #378ADD, #185FA5)',
              borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontSize: 15, fontWeight: 800,
              boxShadow: '0 2px 8px rgba(55,138,221,0.35)',
              flexShrink: 0,
            }}>S</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Shelfy</div>
              <div style={{ fontSize: 11, color: '#b0b0aa', lineHeight: 1.2 }}>إدارة الإعلانات</div>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        <SectionLabel>الرئيسية</SectionLabel>
        {nav.slice(0, 1).map(item => <NavItem key={item.href} item={item} active={path === item.href} />)}

        <SectionLabel>الإعلانات</SectionLabel>
        {nav.slice(1, 4).map(item => <NavItem key={item.href} item={item} active={path.startsWith(item.href)} />)}

        <SectionLabel>الإدارة</SectionLabel>
        {nav.slice(4).map(item => <NavItem key={item.href} item={item} active={path.startsWith(item.href)} />)}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #f0f0ee', padding: '6px 8px 10px' }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent',
          fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          transition: 'background 0.1s, color 0.1s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f0'; (e.currentTarget as HTMLButtonElement).style.color = '#444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
        >
          <span style={{ color: '#aaa' }}>{settingsIcon}</span>
          الإعدادات
        </button>
        <button
          onClick={async () => { await fetch('/api/auth/admin', { method: 'DELETE' }); window.location.href = '/admin-login' }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent',
            fontSize: 13, color: '#e57373', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fff0f0')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 10px 4px',
      fontSize: 10, color: '#c0c0ba',
      fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase',
    }}>{children}</div>
  )
}

function NavItem({ item, active }: { item: any, active: boolean }) {
  return (
    <Link href={item.href} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 10px', borderRadius: 8,
      fontSize: 13, textDecoration: 'none',
      color: active ? '#185FA5' : '#555',
      background: active ? '#e6f1fb' : 'transparent',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.12s',
      marginBottom: 1,
    }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '#f5f5f0' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
    >
      <span style={{ color: active ? '#378ADD' : '#aaa', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
      {item.label}
    </Link>
  )
}

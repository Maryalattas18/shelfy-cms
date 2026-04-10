'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { T, Lang, TKey } from './lang'

type LangCtxType = {
  lang: Lang
  t: (k: TKey) => string
  toggle: () => void
  dir: 'rtl' | 'ltr'
}

const LangCtx = createContext<LangCtxType>({
  lang: 'ar', t: k => T.ar[k] as string, toggle: () => {}, dir: 'rtl',
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar')

  useEffect(() => {
    const saved = localStorage.getItem('shelfy_lang') as Lang
    if (saved === 'en' || saved === 'ar') setLang(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const toggle = () => {
    setLang(l => {
      const next = l === 'ar' ? 'en' : 'ar'
      localStorage.setItem('shelfy_lang', next)
      return next
    })
  }

  const t = (k: TKey): string => (T[lang][k] ?? T.ar[k]) as string

  return (
    <LangCtx.Provider value={{ lang, t, toggle, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang() { return useContext(LangCtx) }

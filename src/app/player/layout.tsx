export const metadata = {
  title: 'Shelfy Player',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; }
        `}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

import type { ReactNode } from 'react'
import '../client/App.css'

export const metadata = {
  title: 'NSUT Connect',
  description: 'Discussions, announcements and timetables for NSUT students.',
  icons: { icon: '/favicon.svg' },
}
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head>
    <meta name="theme-color" content="#f6f7f8" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('nsut-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}" }} />
  </head><body>{children}</body></html>
}

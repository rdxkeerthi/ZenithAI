import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
    title: 'ZenithMind AI - Enterprise Stress Analytics',
    description: 'Advanced real-time stress monitoring and analytics platform for enterprise environments.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable
            )} suppressHydrationWarning>
                {children}
            </body>
        </html>
    )
}

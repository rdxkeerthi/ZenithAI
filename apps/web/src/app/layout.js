import '../styles/globals.css'

export const metadata = {
    title: 'AI Stress Monitor - Advanced Stress Detection',
    description: 'Real-time stress monitoring through facial expression analysis during interactive gameplay',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body suppressHydrationWarning>
                <div className="min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    )
}

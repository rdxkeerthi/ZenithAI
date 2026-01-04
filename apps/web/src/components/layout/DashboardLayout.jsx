'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen mesh-bg text-slate-800 flex font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-white/20 bg-white/40 backdrop-blur-xl md:flex shadow-2xl z-20">
                <div className="flex h-16 items-center border-b border-white/20 px-6 backdrop-blur-md">
                    <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            Z
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">ZenithMind</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium gap-2">
                        <NavLink href="/dashboard" icon="📊">Dashboard</NavLink>
                        <NavLink href="/play" icon="🎮">Start Session</NavLink>
                        <NavLink href="/report" icon="📄">Reports</NavLink>
                        <NavLink href="/settings" icon="⚙️">Settings</NavLink>
                    </nav>

                    {/* Decorative element */}
                    <div className="mt-8 mx-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 backdrop-blur-md">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Live Status</h4>
                        <div className="flex items-center gap-2 text-xs text-indigo-900/70">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Operational
                        </div>
                    </div>
                </div>
                <div className="mt-auto p-4 border-t border-white/20 bg-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50">
                            U
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-slate-800">User Account</p>
                            <p className="text-xs text-slate-600 font-medium bg-indigo-100/50 px-2 py-0.5 rounded-full w-fit mt-0.5">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-blob pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 pointer-events-none mix-blend-multiply"></div>
                <div className="absolute top-[20%] right-[30%] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000 pointer-events-none mix-blend-multiply"></div>

                <header className="flex h-16 items-center gap-4 border-b border-white/20 bg-white/30 backdrop-blur-md px-6 lg:h-[70px] z-10 sticky top-0">
                    <div className="flex-1">
                        <h1 className="font-bold text-xl text-slate-800 tracking-tight">Dashboard Overview</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="bg-white/40 hover:bg-white/60">Help</Button>
                        <Button variant="ghost" size="sm" className="bg-white/40 hover:bg-white/60">Notifications</Button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon, children }) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 font-medium group relative overflow-hidden",
                isActive ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-600 hover:bg-white/50 hover:text-indigo-600"
            )}
        >
            <span className={cn("text-lg transition-transform duration-300 group-hover:scale-110", isActive && "animate-pulse-slow")}>{icon}</span>
            <span className="relative z-10">{children}</span>
            {!isActive && <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-colors duration-300" />}
        </Link>
    )
}

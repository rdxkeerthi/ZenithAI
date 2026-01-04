'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                    <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                        <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
                            The Future of Workplace Wellness
                        </div>
                        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                            Real-time Stress Analytics for <span className="text-primary">Modern Enterprises</span>
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            Empower your workforce with AI-driven stress detection. Monitor, analyze, and improve employee well-being with precision and privacy.
                        </p>
                        <div className="space-x-4">
                            <Link href="/login">
                                <Button size="lg">Get Started</Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg">Learn More</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 rounded-3xl" id="features">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                            Enterprise-Grade Features
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Built for scalability, security, and actionable insights.
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold">Real-time Monitoring</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Live stress detection using advanced computer vision and biometric analysis.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold">Privacy First</h3>
                                    <p className="text-sm text-muted-foreground">
                                        GDPR and HIPAA compliant data processing. Local-first analysis.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold">Actionable Reports</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Detailed analytics and trend reports for HR and management.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2026 ZenithMind AI. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

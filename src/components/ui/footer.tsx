import { Button } from "@/components/ui/button"
import * as React from "react"

interface FooterProps {
    logo: React.ReactNode
    brandName: string
    socialLinks: Array<{
        icon: React.ReactNode
        href: string
        label: string
    }>
    mainLinks: Array<{
        href: string
        label: string
    }>
    legalLinks: Array<{
        href: string
        label: string
    }>
    copyright: {
        text: string
        license?: string
    }
}

export function Footer({
    logo,
    brandName,
    socialLinks,
    mainLinks,
    legalLinks,
    copyright,
}: FooterProps) {
    return (
        <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24 border-t bg-slate-50">
            <div className="hp-container">
                <div className="md:flex md:items-start md:justify-between">
                    <a
                        href="/"
                        className="flex items-center gap-x-2"
                        aria-label={brandName}
                    >
                        {logo}
                        <span className="font-bold text-xl text-slate-900">{brandName}</span>
                    </a>
                    <ul className="flex list-none mt-6 md:mt-0 space-x-3 p-0">
                        {socialLinks.map((link, i) => (
                            <li key={i} className="m-0">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full"
                                    asChild
                                >
                                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                                        {link.icon}
                                    </a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t border-slate-200 mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
                    <nav className="lg:mt-0 lg:col-[4/11]">
                        <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end p-0">
                            {mainLinks.map((link, i) => (
                                <li key={i} className="my-1 mx-2 shrink-0">
                                    <a
                                        href={link.href}
                                        className="text-sm text-slate-600 hover:text-teal-600 transition-colors underline-offset-4 hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-6 lg:mt-0 lg:col-[4/11]">
                        <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end p-1">
                            {legalLinks.map((link, i) => (
                                <li key={i} className="my-1 mx-3 shrink-0">
                                    <a
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline-offset-4 hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 text-sm leading-6 text-slate-500 whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
                        <div className="font-medium text-slate-700">{copyright.text}</div>
                        {copyright.license && <div className="text-xs opacity-75">{copyright.license}</div>}
                    </div>
                </div>
            </div>
        </footer>
    )
}

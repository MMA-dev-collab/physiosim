import { Button } from "@/components/ui/button"
import * as React from "react"

interface FooterProps {
    logo: React.ReactNode
    brandName: string
    description?: string
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
    description,
    socialLinks,
    mainLinks,
    legalLinks,
    copyright,
}: FooterProps) {
    return (
        <footer className="footer-redesign pb-10 pt-16 border-t bg-white">
            <div className="hp-container">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:justify-between items-start gap-10 mb-12">
                    <div className="max-w-md">
                        <a
                            href="/"
                            className="flex items-center gap-x-2 mb-4"
                            aria-label={brandName}
                        >
                            {logo}
                        </a>
                        {description && (
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mt-4">
                                {description}
                            </p>
                        )}
                    </div>
                    
                    <nav>
                        <ul className="flex flex-wrap list-none gap-x-8 gap-y-4 p-0 m-0">
                            {mainLinks.map((link, i) => (
                                <li key={i} className="m-0">
                                    <a
                                        href={link.href}
                                        className="text-slate-700 font-semibold hover:text-blue-600 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            {legalLinks.slice(0, 1).map((link, i) => (
                                <li key={`legal-${i}`} className="m-0">
                                    <a
                                        href={link.href}
                                        className="text-slate-700 font-semibold hover:text-blue-600 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Divider Line */}
                <div className="border-t border-slate-100 my-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-400 text-sm font-medium order-2 md:order-1">
                        {copyright.text}
                    </div>
                    
                    <div className="flex items-center gap-4 order-1 md:order-2">
                        {socialLinks.map((link, i) => (
                            <a 
                                key={i} 
                                href={link.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={link.label}
                                className="text-blue-600 hover:opacity-80 transition-opacity"
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

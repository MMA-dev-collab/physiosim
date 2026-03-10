import React, { useState } from 'react'
import SidebarNavigation from './SidebarNavigation'

export default function DashboardLayout({ activeTab, onTabChange, auth, children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen w-full bg-admin-bg font-display">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-admin-overlay z-[95] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <SidebarNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
                auth={auth}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            <main className="flex-1 flex flex-col min-w-0 w-full relative">
                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-[90] p-2 bg-white/80 backdrop-blur-sm border border-admin-border rounded-lg shadow-sm text-admin-text-muted hover:text-admin-text active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Clone children to pass mobile menu toggle down to HeaderBar if it's there */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            onToggleMobileMenu: () => setIsMobileMenuOpen(!isMobileMenuOpen)
                        });
                    }
                    return child;
                })}
            </main>
        </div>
    )
}

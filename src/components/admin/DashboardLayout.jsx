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

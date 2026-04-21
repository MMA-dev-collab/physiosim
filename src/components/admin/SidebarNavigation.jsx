import React from 'react'

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'cases', label: 'Case Library', icon: 'clinical_notes' },
    { id: 'users', label: 'User Management', icon: 'group' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'subscriptions', label: 'Subscriptions', icon: 'credit_card' },
    { id: 'case-access', label: 'Case Access', icon: 'lock' },
    { id: 'plans', label: 'Pricing Plans', icon: 'payments' },
]

export default function SidebarNavigation({ activeTab, onTabChange, auth, logout, isOpen, setIsOpen }) {
    const user = auth?.user
    const [showProfileMenu, setShowProfileMenu] = React.useState(false)

    const websiteLinks = [
        { label: 'Home', path: '/', icon: 'home' },
        { label: 'Cases', path: '/cases', icon: 'clinical_notes' },
        { label: 'Membership', path: '/membership', icon: 'workspace_premium' },
        { label: 'Leadership', path: '/leadership', icon: 'leaderboard' },
        { label: 'Progress', path: '/progress', icon: 'monitoring' },
    ]

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-[110] w-64 border-r border-admin-border bg-admin-sidebar flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img 
                        src="https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png" 
                        alt="PhysioSim Logo" 
                        className="h-10 w-auto object-contain"
                    />
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Admin Panel</p>
                    </div>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-admin-sidebar-icon hover:text-admin-sidebar-active-text rounded-lg hover:bg-admin-sidebar-active-bg"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id)
                            setIsOpen(false) // Close on mobile after selection
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${activeTab === item.id
                            ? 'bg-admin-sidebar-active-bg text-admin-sidebar-active-text font-semibold'
                            : 'text-admin-sidebar-text hover:bg-admin-sidebar-active-bg font-medium'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile & Website Menu */}
            <div className="p-4 border-t border-admin-border relative">
                {showProfileMenu && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-admin-border shadow-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-3 border-b border-admin-border bg-admin-bg/50">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Website Navigation</p>
                        </div>
                        <div className="py-2">
                            {websiteLinks.map((link) => (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-admin-bg hover:text-admin-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">{link.icon}</span>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <div className="border-t border-admin-border py-2 bg-slate-50/50">
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-admin-danger hover:bg-admin-danger/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${showProfileMenu ? 'bg-admin-sidebar-active-bg border-admin-primary/20' : 'bg-admin-bg border-admin-border hover:border-admin-primary/30'
                        }`}
                >
                    <div className="w-9 h-9 rounded-full bg-admin-primary/20 flex items-center justify-center text-admin-primary/70 font-bold overflow-hidden shrink-0 border border-white">
                        {user?.profileImage ? (
                            <img className="w-full h-full object-cover" src={user.profileImage} alt="Profile" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'
                        )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate mt-0.5">{user?.role || 'System Admin'}</p>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}>
                        expand_less
                    </span>
                </button>
            </div>
        </aside>
    )
}

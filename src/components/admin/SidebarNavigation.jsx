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

export default function SidebarNavigation({ activeTab, onTabChange, auth, isOpen, setIsOpen }) {
    const user = auth?.user

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-[100] w-64 border-r border-admin-border bg-admin-sidebar flex flex-col shrink-0 h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-admin-primary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined">vital_signs</span>
                    </div>
                    <div>
                        <h1 className="text-admin-primary font-bold text-lg leading-tight">PhysioSim</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Admin Panel</p>
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

            {/* User Profile */}
            <div className="p-4 border-t border-admin-border">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-admin-bg border border-admin-border">
                    <div className="w-9 h-9 rounded-full bg-admin-primary/20 flex items-center justify-center text-admin-primary/70 font-bold overflow-hidden shrink-0 border border-white">
                        {user?.profileImage ? (
                            <img className="w-full h-full object-cover" src={user.profileImage} alt="Profile" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate mt-0.5">{user?.role || 'System Admin'}</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

import React from 'react'

const tabTitles = {
    overview: 'Dashboard',
    cases: 'Case Library',
    users: 'User Management',
    categories: 'Category Management',
    subscriptions: 'Subscription Management',
    'case-access': 'Case Access Control',
    plans: 'Pricing Plans Builder',
}

export default function HeaderBar({ activeTab, searchValue, onSearchChange, searchPlaceholder, auth, onToggleMobileMenu }) {
    const user = auth?.user

    return (
        <header className="h-16 border-b border-admin-border bg-admin-sidebar px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3 flex-1 max-w-2xl min-w-0">
                {/* Mobile Hamburger Menu */}
                <button
                    onClick={onToggleMobileMenu}
                    className="lg:hidden p-2 -ml-2 text-admin-text-muted hover:text-admin-text rounded-lg hover:bg-admin-bg flex-shrink-0"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <h2 className="text-lg font-bold text-admin-text whitespace-nowrap hidden sm:block">{tabTitles[activeTab] || 'Dashboard'}</h2>

                {onSearchChange && (
                    <div className="relative w-full max-w-md ml-auto sm:ml-4">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted text-[18px]">search</span>
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-admin-bg border-none rounded-full text-sm focus:ring-2 focus:ring-admin-primary/20 placeholder:text-admin-text-muted text-admin-text"
                            placeholder={searchPlaceholder || 'Search...'}
                            type="text"
                            value={searchValue || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 md:gap-3 ml-4 flex-shrink-0">
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-admin-text-muted hover:bg-admin-bg transition-colors relative">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-admin-danger rounded-full border-2 border-white"></span>
                </button>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center text-admin-primary font-bold">
                    {user?.profileImage ? (
                        <img className="w-full h-full object-cover" src={user.profileImage} alt="Profile" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'
                    )}
                </div>
            </div>
        </header>
    )
}

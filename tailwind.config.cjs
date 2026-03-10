/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Admin Theme Mappings
                "admin-primary": "var(--color-primary)",
                "admin-primary-hover": "var(--color-primary-hover)",
                "admin-primary-soft": "var(--color-primary-soft)",
                "admin-accent": "var(--color-accent)",
                "admin-bg": "var(--color-bg-main)",
                "admin-sidebar": "var(--color-bg-sidebar)",
                "admin-card": "var(--color-bg-card)",
                "admin-border": "var(--color-border-default)",
                "admin-text": "var(--color-text-primary)",
                "admin-text-muted": "var(--color-text-secondary)",
                "admin-sidebar-text": "var(--color-sidebar-text)",
                "admin-sidebar-icon": "var(--color-sidebar-icon)",
                "admin-sidebar-active-bg": "var(--color-sidebar-active-bg)",
                "admin-sidebar-active-text": "var(--color-sidebar-active-text)",
                "admin-success": "var(--color-success)",
                "admin-warning": "var(--color-warning)",
                "admin-danger": "var(--color-danger)",
                "admin-info": "var(--color-info)",
                "admin-overlay": "var(--color-bg-overlay)",
                "admin-modal": "var(--color-bg-modal)",
                "admin-input-bg": "var(--color-input-bg)",
                "admin-input-border": "var(--color-input-border)",
                "admin-input-focus": "var(--color-input-focus)",
            },
            boxShadow: {
                "admin-card": "var(--shadow-card)",
                "admin-card-hover": "var(--shadow-card-hover)",
                "admin-modal": "var(--shadow-modal)",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}

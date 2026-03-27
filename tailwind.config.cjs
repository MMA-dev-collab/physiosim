/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg-main)",
                foreground: "var(--text-primary)",
                primary: {
                    DEFAULT: "var(--primary)",
                    hover: "var(--primary-hover)",
                    dark: "var(--primary-hover)",
                    active: "var(--primary-active)",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "var(--bg-secondary)",
                    foreground: "var(--text-secondary)",
                },
                tertiary: "var(--bg-tertiary)",
                muted: {
                    DEFAULT: "var(--bg-tertiary)",
                    foreground: "var(--text-muted)",
                },
                accent: {
                    DEFAULT: "var(--accent-light)",
                    foreground: "var(--primary)",
                },
                border: "var(--border-default)",
                input: "var(--border-default)",
                ring: "var(--primary)",
                success: "var(--success)",
                error: "var(--error)",
                warning: "var(--warning)",
                admin: {
                    bg: "var(--bg-secondary)",
                    card: "var(--bg-main)",
                    border: "var(--border-default)",
                    text: "var(--text-primary)",
                    "text-muted": "var(--text-secondary)",
                    primary: "var(--primary)",
                    "primary-soft": "var(--bg-tertiary)",
                    success: "var(--success)",
                    danger: "var(--error)",
                    warning: "var(--warning)",
                    sidebar: "var(--bg-main)",
                    "sidebar-text": "var(--text-secondary)",
                    "sidebar-active-bg": "var(--bg-tertiary)",
                    "sidebar-active-text": "var(--primary)",
                    "sidebar-icon": "var(--text-muted)",
                    overlay: "rgba(0, 0, 0, 0.4)",
                }
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                full: "9999px",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
                "admin-card": "var(--shadow-sm)",
                "admin-card-hover": "var(--shadow-md)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}

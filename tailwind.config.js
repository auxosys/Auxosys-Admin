/** @type {import('tailwindcss').Config} */ 

module.exports = { 

  content: ["./src/**/*.{js,jsx,ts,tsx}"], 

  theme: { 

    extend: { 

      colors: { 

        primary:     "#0c55cc",   // Primary Blue 

        "brand-dark":"#071b3a",   // Deep Brand Base 

        cyan:        "#0c55cc",   // Accent Cyan 

        accent:      "#2563eb",   // Accent Blue 

        success:     "#10b981", 

        warning:     "#f59e0b", 

        danger:      "#ef4444", 

        neutral:     "#64748b", 

        "bg-page":   "#f6fbff", 

        "bg-end":    "#eef6ff", 

        "text-main": "#0f172a", 

        "text-sub":  "#64748b", 

      }, 

    }, 

  }, 

  plugins: [
    require('@tailwindcss/typography')
  ], 

}; 

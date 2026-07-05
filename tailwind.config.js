/** @type {import('tailwindcss').Config} */ 

module.exports = { 

  content: ["./src/**/*.{js,jsx,ts,tsx}"], 

  theme: { 

    extend: { 
      colors: { 
        primary:     "#132242",   // New Primary Dark 
        "brand-dark":"#071b3a",   // Deep Brand Base 
        cyan:        "#132242",   // Override Accent Cyan 
        accent:      "#132242",   // Override Accent Blue 
        success:     "#10b981", 
        warning:     "#f59e0b", 
        danger:      "#ef4444", 
        neutral:     "#64748b",
        blue: {
          50: '#f2f4f8',
          100: '#e0e6ef',
          200: '#c5d0e2',
          300: '#9caecb',
          400: '#6e89b2',
          500: '#4e6a98',
          600: '#3b527a',
          700: '#2f4264',
          800: '#263654',
          900: '#132242',
          950: '#0b1327',
        },


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

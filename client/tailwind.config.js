module.exports = {
    theme: {
      extend: {
        keyframes: {
          jump: {
            '0%, 100%': { transform: 'translateY(0)' },
            '25%': { transform: 'translateY(-30px)' },
            '50%': { transform: 'translateY(0)' },
            '75%': { transform: 'translateY(-15px)' },
          }
        },
        animation: {
          jump: 'jump 1s ease-in-out',
        }
      },
    },
    plugins: [
      // v4 uses CSS import; plugins below are for v3 and can be re-added via @plugin when needed
    ],
  }
  
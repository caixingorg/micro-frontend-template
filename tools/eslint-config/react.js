module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off', // React 17+ doesn't need this
    'react/prop-types': 'off', // We use TypeScript
    'react/display-name': 'off',
    'react/jsx-uses-react': 'off', // React 17+
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // JSX A11y
    'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

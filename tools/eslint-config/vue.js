module.exports = {
  extends: [
    './index.js',
    'plugin:vue/vue3-recommended',
  ],
  plugins: [
    'vue',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'error',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits'],
    }],
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'always',
      },
      svg: 'always',
      math: 'always',
    }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1,
    }],
    'vue/no-unused-vars': 'error',
    'vue/padding-line-between-blocks': ['error', 'always'],
    'vue/prefer-import-from-vue': 'error',
    'vue/prefer-separate-static-class': 'error',
    
    // TypeScript in Vue
    '@typescript-eslint/no-unused-vars': 'off', // Vue compiler handles this
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};

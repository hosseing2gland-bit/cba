module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.test.js'],
      env: { node: true, es2021: true },
    },
  ],
};

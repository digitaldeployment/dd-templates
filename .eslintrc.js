
module.exports = {
  env: {
    amd: true,
    browser: true,
    commonjs: true,    
  },
  extends: 'eslint:recommended',
  rules: {
    'curly': ['error', 'all'],
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
  },
};

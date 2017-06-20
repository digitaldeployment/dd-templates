
module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    // Require selectors to be on separate lines only for multi-line blocks.
    'selector-list-comma-newline-after': 'always-multi-line',
    // Require consistent spacing before the opening brace only for multi-line blocks.
    'block-opening-brace-space-before': 'always-multi-line',
    // Stick with single colon pseudo elements for browser compatibility, for now.
    'selector-pseudo-element-colon-notation': 'single',
    // Support LESS :extend pseudo class.
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['extend'],
  }],
  },
};

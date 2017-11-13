module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "experimentalObjectRestSpread": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "extends": "airbnb",
  "rules": {
    "semi": ["warn", "always"],
    "eqeqeq": "warn",
    "indent": ["warn", 2, { "SwitchCase": 1 }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-const-assign": "warn",
    "no-this-before-super": "warn",
    "no-undef": "warn",
    "no-unreachable": "warn",
    "no-else-return": "warn",
    "no-unused-vars": "warn",
    "constructor-super": "warn",
    "array-bracket-spacing": ["warn", "never"],
    "block-spacing": "warn",
    "brace-style": "warn",
    "valid-typeof": "warn",
    "jsx-quotes": ["error", "prefer-single"],
    "no-var": "warn",
    "no-duplicate-imports": "warn",
    "no-unused-expressions": "warn",
    "class-methods-use-this": ["error", {
      "exceptMethods": [
        "render",
        "getInitialState",
        "getDefaultProps",
        "componentWillMount",
        "componentDidMount",
        "componentWillReceiveProps",
        "shouldComponentUpdate",
        "componentWillUpdate",
        "componentDidUpdate",
        "componentWillUnmount"
      ]
    }],
    "react/display-name": 1,
    "react/jsx-boolean-value": 1,
    "react/jsx-closing-bracket-location": 1,
    "react/jsx-curly-spacing": 1,
    "react/jsx-handler-names": 0,
    "react/jsx-indent-props": 1,
    "react/jsx-key": 1,
    "react/jsx-max-props-per-line": 1,
    "react/jsx-no-bind": 1,
    "react/jsx-no-duplicate-props": 1,
    "react/jsx-no-literals": 1,
    "react/jsx-no-undef": 1,
    "react/jsx-pascal-case": 1,
    "react/jsx-sort-props": [1, {
      "callbacksLast": true,
      "ignoreCase": false,
      "shorthandFirst": true
    }],
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1,
    "react/no-danger": 0,
    "react/no-did-mount-set-state": 1,
    "react/no-did-update-set-state": 1,
    "react/no-direct-mutation-state": 1,
    "react/no-multi-comp": 1,
    "react/no-set-state": 0,
    "react/no-unknown-property": 1,
    "react/no-unused-prop-types":1,
    "react/prefer-es6-class": 1,
    "react/prop-types": 1,
    "react/react-in-jsx-scope": 1,
    "react/require-extension": 0,
    "react/self-closing-comp": 1,
    "react/sort-comp": 1,
    "react/jsx-wrap-multilines": 1,
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/forbid-prop-types":1
  }
};
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        describe: "readonly",
        expect: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly",
        test: "readonly"
      }
    }
  }
];

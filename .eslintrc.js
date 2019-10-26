module.exports = {
    extends: ['airbnb', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
            typescript: {}
        }
    },
    rules: {
        'react/jsx-filename-extension': [2, {extensions: ['.js', '.jsx', '.ts', '.tsx']}],
        '@typescript-eslint/indent': [2, 2],
        'import/no-extraneous-dependencies': ["error", {"devDependencies": ["**/*.test.*", "**/*.spec.*"]}],
        '@typescript-eslint/no-explicit-any': [0]
    },
    env: {"mocha": true}
};

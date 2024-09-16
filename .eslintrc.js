module.exports = {
    extends: [
        'prettier',
        'eslint:recommended',
        'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:import/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['react', 'react-hooks', '@typescript-eslint', 'eslint-plugin-import', 'prettier'],
    // Fine tune rules
    rules: {
        // WARN
        '@typescript-eslint/no-unused-vars': [
            1,
            {
                ignoreRestSiblings: true,
            },
        ],
        '@typescript-eslint/no-var-requires': 0,
        'arrow-body-style': 1,
        'import/first': 1,
        'import/order': [
            1,
            {
                groups: ['builtin', 'external', 'type', 'internal', ['parent', 'sibling']],
            },
        ],
        // OFF
        'import/prefer-default-export': 0,
        'max-classes-per-file': 0,
        'no-console': [
            1,
            {
                allow: ['assert'],
            },
        ],
        'no-debugger': 1,
        'no-restricted-syntax': [2, 'WithStatement'],
        'no-unused-expressions': [
            2,
            {
                allowTaggedTemplates: true,
            },
        ],
        // ERROR
        'no-use-before-define': 2,
        'object-shorthand': 1,
        'prefer-const': 1,
        'prefer-destructuring': 0,
        'prettier/prettier': 'error',
        'react-hooks/rules-of-hooks': 2,
        'react/default-props-match-prop-types': 1,
        'react/destructuring-assignment': 0,
        'react/jsx-curly-brace-presence': 1,
        'react/jsx-filename-extension': [
            2,
            {
                extensions: ['.js', '.tsx'],
            },
        ],
        'react/jsx-one-expression-per-line': 0,
        'react/jsx-props-no-spreading': 0,
        'react/jsx-uses-react': 0,
        'react/no-access-state-in-setstate': 1,
        'react/no-array-index-key': 1,
        'react/no-unused-prop-types': 1,
        'react/no-unused-state': 1,
        'react/prefer-stateless-function': 1,
        'react/react-in-jsx-scope': 0,
        'react/sort-comp': 0,
        'require-await': 1,
    },
    settings: {
        react: {
            version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
        },
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
};

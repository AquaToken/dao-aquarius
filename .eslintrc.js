module.exports = {
    env: {
        node: true, // Enable global Node.js settings for linting
    },
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
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'eslint-plugin-import',
        'prettier',
        'simple-import-sort',
    ],
    // Fine tune rules
    rules: {
        '@typescript-eslint/no-unused-vars': [
            1,
            {
                ignoreRestSiblings: true,
            },
        ],
        '@typescript-eslint/no-use-before-define': ['error'],
        '@typescript-eslint/no-var-requires': 0,
        'arrow-body-style': 1,
        'import/first': 1,
        'import/order': [
            2,
            {
                alphabetize: {
                    caseInsensitive: true,
                    order: 'asc',
                },
                groups: [
                    'external', // npm
                    'builtin', // modules Node.js
                    'internal', // internal project modules
                    'sibling', // one level nest
                    'parent', // parent nest
                    'index',
                ],
                'newlines-between': 'always',
                pathGroups: [
                    {
                        group: 'internal',
                        pattern: 'api/**',
                        position: 'before',
                    },
                    {
                        group: 'internal',
                        pattern: 'constants/**',
                        position: 'before',
                    },
                    {
                        group: 'internal',
                        pattern: 'selectors/**',
                        position: 'before',
                    },

                    {
                        group: 'internal',
                        pattern: 'store/**',
                        position: 'before',
                    },
                    {
                        group: 'internal',
                        pattern: 'types/**',
                        position: 'before',
                    },
                    {
                        group: 'internal',
                        pattern: 'assets/**',
                        position: 'after',
                    },
                    {
                        group: 'internal',
                        pattern: 'basics/**',
                        position: 'after',
                    },
                    {
                        group: 'internal',
                        pattern: 'components/**',
                        position: 'after',
                    },
                    {
                        group: 'internal',
                        pattern: 'pages/**',
                        position: 'after',
                    },
                ],
            },
        ],
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
        'no-use-before-define': 'off',
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
        'react/no-unescaped-entities': 0,
        'react/no-unused-prop-types': 1,
        'react/no-unused-state': 1,
        'react/prefer-stateless-function': 1,
        'react/react-in-jsx-scope': 0,
        'react/sort-comp': 0,
        'require-await': 1,
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.svg'],
                paths: ['src'],
            },
            typescript: {
                project: './tsconfig.json',
            },
        },
        react: {
            version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
};

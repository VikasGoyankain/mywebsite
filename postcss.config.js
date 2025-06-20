/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {},
    cssnano: {
      preset: 'default',
    }
  },
}

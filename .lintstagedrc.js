module.exports = {
  '*': 'pretty-quick --staged',
  '*.{js,ts}': 'eslint --fix',
  'package.json': 'sort-package-json'
}

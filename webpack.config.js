const path = require('path')

module.exports = {
  mode: 'development',
  entry: './scripts/chat.js', // Wo schauen soll (mehrere Files in One ->['',''])
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' // Name vom dem Output File
  },
  watch: true
}
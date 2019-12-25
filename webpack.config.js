import path from 'path'

export default {
  entry: path.resolve(__dirname, './src/cli/assets/bundle.ts'),
  output: {
    path: path.resolve(__dirname, 'lib/cli/assets'),
    filename: 'bundle.js'
  },
  mode: 'production',
  target: 'web',
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.ts']
  }
}

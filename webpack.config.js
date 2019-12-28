import path from 'path'
import webpack from 'webpack'

export default {
  entry: path.resolve(__dirname, './src/cli/assets/bundle.ts'),
  output: {
    path: path.resolve(__dirname, 'lib/cli/assets'),
    filename: 'bundle.js'
  },
  mode: 'development',
  devtool: false,
  target: 'web',
  module: {
    rules: [
      { test: /\.ts$/i, use: 'ts-loader' },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.ts', '.js', '.css']
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: 'bundle.js.map'
    })
  ]
}

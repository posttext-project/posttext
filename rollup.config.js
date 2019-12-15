import typescript from 'rollup-plugin-typescript'
import visualizer from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    file: 'index.umd.js',
    name: 'posttext',
    format: 'umd',
    sourcemap: true
  },
  plugins: [typescript(), terser(), visualizer()]
}

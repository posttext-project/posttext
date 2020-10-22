/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import typescript from '@rollup/plugin-typescript'
import visualizer from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    file: 'index.umd.js',
    name: 'posttext',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [typescript(), terser(), visualizer()],
}

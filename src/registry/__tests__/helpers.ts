/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { createAsyncIter } from '../helpers'

describe('ResolverAsyncIter', () => {
  describe('createAsyncIter()', () => {
    test('async iterator should works correctly', async () => {
      function timeout(ms: number): Promise<boolean> {
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), ms)
        })
      }

      async function run(
        callback: (i: number) => any
      ): Promise<number> {
        let sum = 0

        for (const i of Array.from(
          { length: 10 },
          (v, k) => k
        )) {
          await timeout(10)

          await callback(i)

          sum += i
        }

        return sum
      }

      async function* resolve(): AsyncGenerator<any, any, any> {
        const sum = yield* createAsyncIter<any, any, any>(
          async (iter) => {
            const sum = await run((i) => iter.next(i))

            await iter.return(sum)
          }
        )

        expect(sum).toBe(45)
      }

      async function main(): Promise<void> {
        for await (const _i of resolve()) {
          /* pass */
        }
      }

      main().catch((err) => console.log(err))
    })
  })
})

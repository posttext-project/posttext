import test from 'ava'

import { parse } from '../src'

test('bar', async t => {
  const bar = await Promise.resolve('bar')
  
  t.is(bar, 'bar')
})

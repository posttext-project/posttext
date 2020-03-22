import { t, Cursor } from 'cursornext'
import yaml from 'js-yaml'

export function runParse(
  input: string,
  expected: string,
  callback: (cursor: Cursor) => any
) {
  const iter = t
    .capture(input, {
      noLabel: true
    })
    .toIter()

  const start = iter.next()
  const end = iter.next()

  const token = callback(start)

  expect(token).toEqual(yaml.safeLoad(expected))
  expect(start.isAt(end)).toBeTruthy()
}

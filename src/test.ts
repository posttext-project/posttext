import { Reader } from './reader/Reader'
import { Structure } from './reader/Structure'
import { Matcher } from './reader/Matcher'
import { Word } from './Word'

const pt = Reader.run(
  Structure.sequence([
    Structure.push(Word.build()),
    Structure.nonKey(Matcher.ignoreUntil(/[^\s,]/)),
    Structure.push(Word.build())
  ])
)

const output = pt`Hello, World!`

console.log(output)

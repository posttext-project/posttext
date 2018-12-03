import { Reader } from './common/Reader'
import { Structure } from './common/Structure'
import { Matcher } from './common/Matcher'
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

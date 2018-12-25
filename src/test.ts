import { PostText } from './PostText';
import { Reader } from './reader/Reader';

const pt = Reader.run(
  PostText.buildTopLevel()
)

const output = pt`
== math

y = 2 * x + \\sqrt { x + 5 }

== language(js)

console.log('Hello, World!')

== paragraph

Let make some \\bold{noise}!
`

console.log(output)

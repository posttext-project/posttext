import { PostText } from './PostText'

const output = PostText.transform(`
  Hello, \\bold{World}!
`)

console.log(output)

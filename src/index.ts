import { Runner } from './Runner'
import PostText from './PostText'

new Runner({
  core: PostText({})
}).run('Hello, World!')

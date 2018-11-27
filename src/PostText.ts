import { Reader } from './Reader'
import { Pattern } from './Pattern'
import { Plugin } from './Plugin'

export class PostText extends Reader {
  build() {
    return Pattern.repeat(PostText.lookup())
  }

  static lookup() {
    return (t: any) => {
      const postText = t.getPlugin(PostText)

      return postText.lookup(t)
    }
  }

  lookup(t: any) {}
}

export function createPostText(): Plugin {
  return new PostText({})
}

export default function(options: any) {
  return new PostText(options)
}

import { Reader } from './Reader'
import { Pattern } from './Pattern'
import { PluginMonad } from './PluginMonad'
import { Cursor } from './Cursor'

export interface PostTextTransformOptions {
  plugins?: ((t: PluginMonad) => PluginMonad)[]
}

export class PostText extends Reader {
  static transform(
    data: string,
    options: PostTextTransformOptions = {}
  ) {
    return (t: PluginMonad) => {
      const plugins = options.plugins || []

      const monad = t.castPlugin(
        new Cursor({
          doc: data
        })
      )

      return plugins.reduce((all, next) => next(all), monad)
    }
  }

  transform() {
    return PostText.build()
  }

  static build() {
    return (t: PluginMonad) => {
      const postText = t.getPlugin(PostText) as PostText

      return postText.build()
    }
  }

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

import { PostText } from './PostText'
import { PluginRunner } from './PluginRunner'
import { PluginInput } from './PluginInput'
import { noop } from './noop'

export class PostTextPlugin {
  mockedRun: Function = noop

  setup(t: PluginInput) {
    this.mockedRun = t.mock(PostText, 'run', () => this.run)
  }

  run = (t: PluginInput) => {
    console.log(t.data)

    const mT = t.createNewInput({
      data: 'foo'
    })

    return this.mockedRun(mT)
  }
}

const parser = new PluginRunner({
  bootstrap: PostText,
  plugins: [PostTextPlugin]
})

parser.run('Hello, World!')

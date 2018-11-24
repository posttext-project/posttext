import { PostText } from './PostText'
import { PluginRunner } from './PluginRunner';

const parser = new PluginRunner({
  bootstrap: PostText
})

parser.run('Hello, World!')

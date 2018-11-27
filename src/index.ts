import { PluginMonad } from "./PluginMonad";
import { PostText } from './PostText'

PluginMonad.runMonad(
  PostText.transform('Hello, World!')
)

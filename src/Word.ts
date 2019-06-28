import { Matcher } from './reader/Matcher'

export class Word {
  static build() {
    return Matcher.match(/\p{L}+/u)
  }
}

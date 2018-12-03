import { Matcher } from './common/Matcher'

export class Word {
  static build() {
    return Matcher.match(/\p{L}+/u)
  }
}

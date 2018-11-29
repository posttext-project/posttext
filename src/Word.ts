import { Pattern } from './Pattern'

export class Word {
  static build() {
    return Pattern.readUntilRegExp(/[^\w]/)
  }
}

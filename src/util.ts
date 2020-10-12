import {Md5} from 'ts-md5/dist/md5'

export function isYamlSame(yaml1: string, yaml2: string): boolean {
  return Md5.hashStr(yaml1) === Md5.hashStr(yaml2)
}

enum ArrayParserState {
  ParseArrayName,
  ParseArrayIndex
}
export class ArrayParser {
  state: ArrayParserState

  private name_ = ''

  private index_ = ''

  readonly length: number

  constructor(readonly content: string) {
    this.state = ArrayParserState.ParseArrayName
    this.length = content.length
  }

  get name(): string {
    return this.name_
  }

  get index(): string {
    return this.index_
  }

  parse() {
    const isAlphanumeric = /^[a-z0-9]+$/i
    const isNumeric = /^\d+$/
    for (let i = 0; i < this.length; ++i) {
      const c = this.content.charAt(i)
      if (c === '[') {
        this.state = ArrayParserState.ParseArrayIndex
        continue
      } else if (c === ']') {
        return
      }
      if (this.state === ArrayParserState.ParseArrayName) {
        if (c === '$' || c === '_' || c.match(isAlphanumeric)) {
          this.name_ += c
        }
      } else if (this.state === ArrayParserState.ParseArrayIndex) {
        if (c.match(isNumeric))
          this.index_ += c
      }
    }
  }
}

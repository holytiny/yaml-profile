import * as fs from 'fs'
import * as YAML from 'yaml'

import Command from './base'

export default abstract class extends Command {
  protected getYaml(inputFilePath: string) {
    const inputFile = fs.readFileSync(inputFilePath, 'utf8')
    const yaml = YAML.parse(inputFile)
    // console.log(yaml);

    return {
      yaml,
      profiles: [],
    }
  }

  protected processCmd(inputFile: string, op: string, path: string, value: string) {
    const {yaml} = this.getYaml(inputFile)
    value = YAML.parse(value)
    const patch = {
      op,
      path,
      value,
    }
    this.applyPatch(yaml, patch)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})
    fs.writeFileSync(inputFile, yamlStr)
  }
}

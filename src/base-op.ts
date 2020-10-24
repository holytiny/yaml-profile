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
}

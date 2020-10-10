import {expect, test} from '@oclif/test'
import * as YAML from 'yaml'
import {isYamlSame} from '../src/util'
import * as fs from 'fs'

describe('isYamlSame', () => {
  test
  .it('should return true', () => {
    const yamlFile = fs.readFileSync('./test/files/util/yaml.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('./test/files/util/yaml-same.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })

  test
  .it('should return false', () => {
    const yamlFile = fs.readFileSync('./test/files/util/yaml.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlDiffFile = fs.readFileSync('./test/files/util/yaml-diff.yaml', 'utf8')
    const yamlDiff = YAML.parse(yamlDiffFile)
    const yamlDiffStr = YAML.stringify(yamlDiff, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlDiffStr)
    expect(ret).to.equal(false)
  })
})

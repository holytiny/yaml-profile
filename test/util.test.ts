import {expect, test} from '@oclif/test'
import * as YAML from 'yaml'
import {isYamlSame} from '../src/util'
import * as fs from 'fs'
import {ArrayParser} from '../src/util'

describe('isYamlSame', () => {
  test
  .it('should return true when tow yaml files are the same', () => {
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
  .it('should return false when tow yaml files are different', () => {
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

describe('ArrayParser', () => {
  test
  .it('parse container[1] should return name==container and index==1', () => {
    const arrayParser = new ArrayParser('container[1]')
    arrayParser.parse()
    const name = arrayParser.name
    const index = arrayParser.index
    expect(name).to.equal('container')
    expect(index).to.equal('1')
  })
})

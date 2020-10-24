import {expect, test} from '@oclif/test'

import * as fs from 'fs'
import * as YAML from 'yaml'

import cmd = require('../../src')
import {isYamlSame} from '../../src/common/util'

describe('yprofile remove', () => {
  test
  .do(async () => {
    const dirName = 'test/dist/op-cmd/'
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {recursive: true})
    }
    fs.copyFileSync('test/files/op-cmd/remove.yaml', 'test/dist/op-cmd/remove.yaml')

    // profiles:
    // - name: staging
    // patches:
    // - op: remove
    //   path: images.backend-debugger
    // - op: remove
    //   path: deployments.name=backend.helm.values.containers[3]
    // - op: remove
    //   path: deployments.name=backend.helm.values.containers.image=john/cache

    await cmd.run([
      'remove',
      'test/dist/op-cmd/remove.yaml',
      'images.backend-debugger',
    ])

    await cmd.run([
      'remove',
      'test/dist/op-cmd/remove.yaml',
      'deployments.name=backend.helm.values.containers[3]',
    ])

    await cmd.run([
      'remove',
      'test/dist/op-cmd/remove.yaml',
      'deployments.name=backend.helm.values.containers.image=john/cache',
    ])
  })
  .it('should reomve the property by all style by operate command', () => {
    const yamlFile = fs.readFileSync('test/files/op-cmd/remove-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op-cmd/remove.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })
})

import {expect, test} from '@oclif/test'

import * as fs from 'fs'
import * as YAML from 'yaml'

import cmd = require('../../src')
import {isYamlSame} from '../../src/common/util'

describe('yprofile add', () => {
  test
  .do(async () => {
    const dirName = 'test/dist/op-cmd/'
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {recursive: true})
    }
    fs.copyFileSync('test/files/op-cmd/replace.yaml', 'test/dist/op-cmd/replace.yaml')

    // profiles:
    // - name: staging
    // patches:
    // - op: replace
    //     path: images.backend.image
    //     value: john/stagingbackend
    // - op: replace
    //     path: deployments[0].helm.values.containers[0]
    //     value:
    //       image: john/backend
    // - op: replace
    //     path: deployments.name=backend.helm.values.containers.image=john/devfrontend
    //     value:
    //       image: john/frontend
    // - op: replace
    //     path: deployments.name=backend.helm.values.containers[2]
    //     value:
    //       image: john/deploy

    await cmd.run([
      'replace',
      'test/dist/op-cmd/replace.yaml',
      'images.backend.image',
      'john/stagingbackend',
    ])

    await cmd.run([
      'replace',
      'test/dist/op-cmd/replace.yaml',
      'deployments[0].helm.values.containers[0]',
      'image: john/backend',
    ])

    await cmd.run([
      'replace',
      'test/dist/op-cmd/replace.yaml',
      'deployments.name=backend.helm.values.containers.image=john/devfrontend',
      'image: john/frontend',
    ])

    await cmd.run([
      'replace',
      'test/dist/op-cmd/replace.yaml',
      'deployments.name=backend.helm.values.containers[2]',
      'image: john/deploy',
    ])
  })
  .it('should replace the property by all style by operate command', () => {
    const yamlFile = fs.readFileSync('test/files/op-cmd/replace-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op-cmd/replace.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })
})

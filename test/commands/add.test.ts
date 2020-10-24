import {expect, test} from '@oclif/test'

import * as fs from 'fs'
import * as YAML from 'yaml'

import cmd = require('../../src')
import {ReturnCode} from '../../src/common/return-code'
import {isYamlSame} from '../../src/common/util'

describe('yprofile add', () => {
  test
  .do(() => cmd.run(['add', 'test/files/op-cmd/add-already-exists.yaml', 'version', '0.0.1']))
  .exit(ReturnCode.ProfilePatchAddPropertyExisted)
  .it(`should exit with code ${ReturnCode.ProfilePatchAddPropertyExisted} when property already existed during add op`)

  test
  .do(async () => {
    const dirName = 'test/dist/op-cmd/'
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {recursive: true})
    }
    fs.copyFileSync('test/files/op-cmd/add.yaml', 'test/dist/op-cmd/add.yaml')

    // profiles:
    // - name: production
    //   patches:
    //   - op: add
    //     path: images.frontend
    //     value:
    //       image: john/frontend
    //   - op: add
    //     path: deployments.name=backend.helm.values.containers
    //     value:
    //       image: john/cache
    //   - op: add
    //     path: deployments[0].helm.values.containers
    //     value:
    //       image: john/frontend

    await cmd.run([
      'add',
      'test/dist/op-cmd/add.yaml',
      'version',
      '1.0.0',
    ])

    await cmd.run([
      'add',
      'test/dist/op-cmd/add.yaml',
      'images.frontend',
      'image: john/frontend',
    ])

    await cmd.run([
      'add',
      'test/dist/op-cmd/add.yaml',
      'deployments.name=backend.helm.values.containers',
      'image: john/cache',
    ])

    await cmd.run([
      'add',
      'test/dist/op-cmd/add.yaml',
      'deployments[0].helm.values.containers',
      'image: john/frontend',
    ])
  })
  .it('should add the property by all style by operate command', () => {
    const yamlFile = fs.readFileSync('test/files/op-cmd/add-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op-cmd/add.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })
})

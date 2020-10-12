import {expect, test} from '@oclif/test'
import {ReturnCode} from '../src/return-code'
import * as YAML from 'yaml'
import {isYamlSame} from '../src/util'
import * as fs from 'fs'

import cmd = require('../src')

describe('yprofile profile', () => {
  test
  .do(() => cmd.run(['test/files/profile/no-profiles.yaml', 'staging']))
  .exit(ReturnCode.ProfileNoProfilesSection)
  .it(`should exit with code ${ReturnCode.ProfileNoProfilesSection} when no profiles section`)

  test
  .do(() => cmd.run(['test/files/profile/no-name.yaml', 'staging']))
  .exit(ReturnCode.ProfileNoName)
  .it(`should exit with code ${ReturnCode.ProfileNoName} when no name in patch`)

  test
  .do(() => cmd.run(['test/files/profile/no-profile.yaml', 'dev']))
  .exit(ReturnCode.ProfileNoProfile)
  .it(`should exit with code ${ReturnCode.ProfileNoProfile} when no profile according to the PROFILE arg`)

  test
  .do(() => cmd.run(['test/files/profile/no-patches.yaml', 'staging']))
  .exit(ReturnCode.ProfileNoPatches)
  .it(`should exit with code ${ReturnCode.ProfileNoPatches} when no patches section`)

  test
  .do(() => cmd.run(['test/files/profile/no-patch.yaml', 'staging']))
  .exit(ReturnCode.OK)
  .it(`should exit with code ${ReturnCode.OK} when no patch in patches section`)

  test
  .do(() => cmd.run(['test/files/profile/no-op.yaml', 'staging']))
  .exit(ReturnCode.ProfilePatchNoOp)
  .it(`should exit with code ${ReturnCode.ProfilePatchNoOp} when no op defined`)

  test
  .do(() => cmd.run(['test/files/profile/typo-replace.yaml', 'staging']))
  .exit(ReturnCode.ProfilePatchWrongOp)
  .it(`should exit with code ${ReturnCode.ProfilePatchWrongOp} when wrong op replace value`)

  test
  .do(() => cmd.run(['test/files/profile/typo-remove.yaml', 'staging']))
  .exit(ReturnCode.ProfilePatchWrongOp)
  .it(`should exit with code ${ReturnCode.ProfilePatchWrongOp} when wrong op add value`)

  test
  .do(() => cmd.run(['test/files/profile/typo-add.yaml', 'production']))
  .exit(ReturnCode.ProfilePatchWrongOp)
  .it(`should exit with code ${ReturnCode.ProfilePatchWrongOp} when wrong op add value`)

  test
  .do(() => cmd.run(['test/files/profile/no-path.yaml', 'staging']))
  .exit(ReturnCode.ProfilePatchNoPath)
  .it(`should exit with code ${ReturnCode.ProfilePatchNoPath} when no path in patch`)

  test
  .do(() => cmd.run(['test/files/profile/no-value-add.yaml', 'production']))
  .exit(ReturnCode.ProfilePatchAddOrReplaceNoValue)
  .it(`should exit with code ${ReturnCode.ProfilePatchAddOrReplaceNoValue} when no value to add`)

  test
  .do(() => cmd.run(['test/files/profile/no-value-replace.yaml', 'production']))
  .exit(ReturnCode.ProfilePatchAddOrReplaceNoValue)
  .it(`should exit with code ${ReturnCode.ProfilePatchAddOrReplaceNoValue} when no value to replace`)
})

describe('yprofile op', () => {
  // test
  // .stdout()
  // .do(() => cmd.run(['--name', 'jeff']))
  // .it('runs hello --name jeff', ctx => {
  //   expect(ctx.stdout).to.contain('hello jeff')
  // })
  test
  .do(() => cmd.run(['test/files/op/add-property-exist.yaml', 'production']))
  .exit(ReturnCode.ProfilePatchAddPropertyExisted)
  .it(`should exit with code ${ReturnCode.ProfilePatchAddPropertyExisted} when property already existed during add op`)

  test
  .do(() => cmd.run([
    'test/files/op/remove-property-array-equal-mix.yaml',
    'staging',
    '--output=test/dist/op/remove-property-array-equal-mix-res.yaml',
  ]))
  .it('should remove the property by all style', () => {
    const yamlFile = fs.readFileSync('test/files/op/remove-property-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op/remove-property-array-equal-mix-res.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })

  test
  .do(() => cmd.run([
    'test/files/op/replace-property-array-equal-mix.yaml',
    'staging',
    '--output=test/dist/op/replace-property-array-equal-mix-res.yaml',
  ]))
  .it('should replace the property by all style', () => {
    const yamlFile = fs.readFileSync('test/files/op/replace-property-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op/replace-property-array-equal-mix-res.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })

  test
  .do(() => cmd.run([
    'test/files/op/add-property-arry-equal-mix.yaml',
    'production',
    '--output=test/dist/op/add-property-arry-equal-mix-res.yaml',
  ]))
  .it('should add the property by all style', () => {
    const yamlFile = fs.readFileSync('test/files/op/add-property-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/dist/op/add-property-arry-equal-mix-res.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })
})

describe('yprofile generate', () => {
  test
  .do(async () => {
    fs.writeFileSync('test/files/generate/force-exist.yaml', 'exist')
    await cmd.run([
      'test/files/generate/test.yaml',
      'production',
      '--output=test/files/generate/force-exist.yaml',
      '-f',
    ])
  })
  .it('should generate file when flag -f', () => {
    const yamlFile = fs.readFileSync('test/files/generate/test-res.yaml', 'utf8')
    const yaml = YAML.parse(yamlFile)
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})

    const yamlSameFile = fs.readFileSync('test/files/generate/force-exist.yaml', 'utf8')
    const yamlSame = YAML.parse(yamlSameFile)
    const yamlSameStr = YAML.stringify(yamlSame, {indentSeq: false})
    const ret = isYamlSame(yamlStr, yamlSameStr)
    expect(ret).to.equal(true)
  })

  test
  .do(async () => {
    fs.writeFileSync('test/files/generate/diff-exist.yaml', 'diff')
    await cmd.run([
      'test/files/generate/test.yaml',
      'production',
      '--output=test/files/generate/diff-exist.yaml',
    ])
  })
  .exit(ReturnCode.GenerateFileAlreadyExisted)
  .it(`should exit with code ${ReturnCode.GenerateFileAlreadyExisted} when there's different content file`)

  test
  .do(async () => {
    fs.copyFileSync('test/files/generate/test-res.yaml', 'test/files/generate/same-exist.yaml')
    const stats = fs.statSync('test/files/generate/same-exist.yaml')
    const dirName = 'test/dist/generate/'
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {recursive: true})
    }
    fs.writeFileSync('test/dist/generate/same-exist-before-time', `${stats.mtime}`)
    await cmd.run([
      'test/files/generate/test.yaml',
      'production',
      '--output=test/files/generate/same-exist.yaml',
    ])
  })
  .it('should not genearte file when the same content file has already existed!', () => {
    const beforeTime = fs.readFileSync('test/dist/generate/same-exist-before-time', 'utf8')
    const stats = fs.statSync('test/files/generate/same-exist.yaml')
    expect(`${stats.mtime}`).to.equal(beforeTime)
  })
})

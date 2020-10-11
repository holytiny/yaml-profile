import {expect, test} from '@oclif/test'
import {ReturnCode} from '../src/return-code'

import cmd = require('../src')

describe('yprofile.getYaml', () => {
  // test
  // .stdout()
  // .do(() => cmd.run([]))
  // .it('runs hello', ctx => {
  //   expect(ctx.stdout).to.contain('hello world')
  // })

  // test
  // .stdout()
  // .do(() => cmd.run(['--name', 'jeff']))
  // .it('runs hello --name jeff', ctx => {
  //   expect(ctx.stdout).to.contain('hello jeff')
  // })
  test
  .it(`should exit with code ${ReturnCode.ProfileNoProfilesSection} when no profiles section`, () => {
    // cmd.getYaml('test/files/profile/no-profiles.yaml')
  })

  test
  .do(() => cmd.run(['test/files/profile/no-name.yaml', 'staging']))
  .exit(ReturnCode.ProfileNoName)
  .it(`should exit with code ${ReturnCode.ProfileNoName} when no name in patch`)

  test
  .do(() => cmd.run(['test/files/profile/no-patches.yaml', 'staging']))
  .exit(ReturnCode.ProfileNoPatches)
  .it(`should exit with code ${ReturnCode.ProfileNoPatches} when no patches section`)

  test
  .do(() => cmd.run(['test/files/profile/no-op.yaml', 'staging']))
  .exit(ReturnCode.ProfilePatchNoOp)
  .it(`should exit with code ${ReturnCode.ProfilePatchNoOp} when no op defined`)
})

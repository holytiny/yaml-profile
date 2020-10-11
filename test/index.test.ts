import {expect, test} from '@oclif/test'
import {ReturnCode} from '../src/return-code'

import cmd = require('../src')

describe('yprofile profile', () => {
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
  .do(() => cmd.run(['test/files/profile/add-no-value.yaml', 'production']))
  .exit(ReturnCode.ProfilePatchAddOrReplaceNoValue)
  .it(`should exit with code ${ReturnCode.ProfilePatchAddOrReplaceNoValue} when no value to add`)
})

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
  .it(`should exit with code ${ReturnCode.NoProfilesSection}`, () => {
    // cmd.getYaml('test/files/profile/no-profiles.yaml')
  })

  test
  .do(() => cmd.run(['test/files/profile/no-profiles.yaml', 'staging']))
  .exit(ReturnCode.NoProfilesSection)
  .it(`should exit with code ${ReturnCode.NoProfilesSection}`)
})

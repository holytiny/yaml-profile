import Command from '../base'
import {flags} from '@oclif/command'

import * as fs from 'fs'
import * as YAML from 'yaml'
import * as path from 'path'
import * as moment from 'moment'

import {ReturnCode} from '../common/return-code'
import {isYamlSame} from '../common/util'

class Generate extends Command {
  static aliases = ['gen']

  static description =
    'Generate yaml file from yaml file template with in-block profiles';

  // static usage = `'input file' --profile='profile in inputfile' [--out='output file]' `;
  static args = [
    {
      name: 'input_file',
      required: true,
      description: 'input yaml file with profiles in block',
    },
    {
      name: 'profile',
      required: true,
      description: 'the profile used to generate the yaml file',
    },
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    output: flags.string({
      char: 'o',
      description:
        'the output file path. Default to the same path as input file and suffix with .out',
    }),
    force: flags.boolean({
      char: 'f',
      default: false,
      description: 'generate the yaml file to output file regardless whether a file has already existed',
    }),
  };

  

  async run() {
    const {args, flags} = this.parse(Generate)

    const {yaml, profiles} = this.getYaml(args.input_file)
    this.checkProfiles(profiles)

    const profile = this.getProfile(args.profile, profiles)
    this.generate(yaml, profile, args, flags)

    // let workingPath = process.cwd();
    // console.log('workingPath', workingPath);
    // this._help();
  }

  checkProfiles(profiles: any) {
    // console.log(profiles);
    for (const profile of profiles) {
      if (!Object.prototype.hasOwnProperty.call(profile, 'name')) {
        this.error('there is no name property in profile, please define name property!', {exit: ReturnCode.ProfileNoName})
      }
      if (!Object.prototype.hasOwnProperty.call(profile, 'patches')) {
        this.error('there is no patches section in profile, please define patches section!', {exit: ReturnCode.ProfileNoPatches})
      }
      const patches = profile.patches
      if (patches.length === 0) {
        this.log(`there is no patch in patches in profile ${profile}, skip...`)
        this.exit(ReturnCode.OK)
      }
      const opType = ['replace', 'remove', 'add']
      for (const patch of patches) {
        if (!Object.prototype.hasOwnProperty.call(patch, 'op')) {
          this.error(
            `there is no op in ${patch}, please define 'op' key of either 'replace', 'remove' or 'add' value of the patch!`,
            {exit: ReturnCode.ProfilePatchNoOp}
          )
        }
        if (!opType.includes(patch.op)) {
          this.error(
            `op must be defined as replace, remove or add, please checke ${patch.op}`,
            {exit: ReturnCode.ProfilePatchWrongOp}
          )
        }
        if (!Object.prototype.hasOwnProperty.call(patch, 'path')) {
          this.error(
            `there is no path in ${patch}, please define path of the patch!`,
            {exit: ReturnCode.ProfilePatchNoPath}
          )
        }

        if (patch.op === 'add') {
          if (!Object.prototype.hasOwnProperty.call(patch, 'value')) {
            this.error(
              `there is no value in ${patch} for op to add, please define value for the patch!`,
              {exit: ReturnCode.ProfilePatchAddOrReplaceNoValue}
            )
          }
        }

        if (patch.op === 'replace') {
          if (!Object.prototype.hasOwnProperty.call(patch, 'value')) {
            this.error(
              `there is no value in ${patch} for op to replace, please define value for the patch!`,
              {exit: ReturnCode.ProfilePatchAddOrReplaceNoValue}
            )
          }
        }
      }
    }
  }

  getProfile(profileName: string, profiles: any) {
    const res = profiles.find((element: {name?: string}) => {
      const name = element.name
      return name === profileName
    })
    if (res === undefined) {
      this.error(`there is no ${profileName} in profiles section of the input file!`, {exit: ReturnCode.ProfileNoProfile})
    }
    return res
  }

  generate(yaml: any, profile: any, args: any, flags: any) {
    const input = args.input_file
    const output = flags.output
    const force = flags.force
    const patches = profile.patches
    for (const patch of patches) {
      this.applyPatch(yaml, patch)
    }
    // console.log(yaml);
    const outputFilePath = output ? output : input + '.out'
    const yamlStr = YAML.stringify(yaml, {indentSeq: false})
    if (fs.existsSync(outputFilePath) === false) {
      this.genFile(yamlStr, outputFilePath)
    } else {
      const outputFile = fs.readFileSync(outputFilePath, 'utf8')
      const yaml2 = YAML.parse(outputFile)
      const yaml2Str = YAML.stringify(yaml2, {indentSeq: false})
      if (isYamlSame(yamlStr, yaml2Str)) {
        this.log(`The output file ${outputFilePath} has already exsited and it is the same as the file generated. So file output is skipped.`)
      } else if (force) {
        const time = moment().utc().local().format('yyyy-MM-D-hh:mm:ss')
        const backup = outputFilePath + '-' + time + '.yaml'
        this.log(`The output file ${outputFilePath} has already exsited, this file will be backedup as ${backup}`)
        fs.copyFileSync(outputFilePath, backup)
        this.genFile(yamlStr, outputFilePath)
      } else {
        this.error(
          `The output file ${outputFilePath} has already exsited, the generated file WILL NOT BE OUTPUTED!`,
          {exit: ReturnCode.GenerateFileAlreadyExisted}
        )
      }
    }
  }

  genFile(yaml: string, output: string) {
    const dirName = path.dirname(output)
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, {recursive: true})
    }
    fs.writeFileSync(output, yaml)
    this.log(`The file ${output} is generated!`)
  }
}

export = Generate;

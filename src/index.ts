import {Command, flags} from '@oclif/command'
import {ReturnCode} from './return-code'
import * as fs from 'fs'
import * as YAML from 'yaml'
import {isYamlSame} from './util'

interface Selected {
  item: any;
  isParentArray: boolean;
  parentItem: any;
  selector: string;
}

class Yprofile extends Command {
  static description =
    'Generate yaml file from yaml file with in-block profiles';

  // static usage = `'input file' --profile='profile in inputfile' [--out='output file]' `;

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
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

  async run() {
    const {args, flags} = this.parse(Yprofile)

    const {yaml, profiles} = this.getYaml(args.input_file)
    this.checkProfiles(profiles)

    const profile = this.getProfile(args.profile, profiles)
    this.generate(yaml, profile, args, flags)

    // let workingPath = process.cwd();
    // console.log('workingPath', workingPath);
    // this._help();
  }

  getYaml(inputFilePath: string) {
    const inputFile = fs.readFileSync(inputFilePath, 'utf8')
    const yaml = YAML.parse(inputFile)
    // console.log(yaml);

    const profiles = yaml.profiles
    if (!profiles) {
      this.error('there is no profiles section of the input file!', {exit: ReturnCode.ProfileNoProfilesSection})
    }

    delete yaml.profiles
    return {
      yaml,
      profiles,
    }
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
        return
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
    if (force) {
      this.genFile(yamlStr, outputFilePath)
      return
    }
    if (fs.existsSync(outputFilePath) === false) {
      this.genFile(yamlStr, outputFilePath)
    } else {
      const outputFile = fs.readFileSync(outputFilePath, 'utf8')
      const yaml2 = YAML.parse(outputFile)
      const yaml2Str = YAML.stringify(yaml2, {indentSeq: false})
      if (isYamlSame(yamlStr, yaml2Str)) {
        this.log('The output file has already exsited and it is the same as the file generated. So file output is skipped. ',
          'If whatever you still want to write the file, please use -f flag')
      } else {
        this.log('The output file has already exsited and it is NOT the same as the file generated. ',
          'So output yaml is WRITTEN TO THAT FILE. ')
        this.genFile(yamlStr, outputFilePath)
      }
    }
  }

  genFile(yaml: string, output: string) {
    fs.writeFileSync(output, yaml)
    this.log(`The file ${output} is generated!`)
  }

  applyPatch(yaml: any, patch: any) {
    const selected = this.getSelected(yaml, patch)
    this.execOp(selected, patch)
  }

  getSelected(yaml: any, patch: any) {
    const selected: Selected = {
      item: yaml,
      isParentArray: Array.isArray(yaml),
      parentItem: yaml,
      selector: '',
    }
    // console.log(selected);
    const selectors = patch.path.split('.')
    for (const selector of selectors) {
      selected.parentItem = selected.item
      selected.selector = selector
      if (selector.includes('=')) {
        selected.isParentArray = true
        const kv = selector.split('=')
        const k = kv[0]
        const v = kv[1]
        selected.item = selected.item.find((e: any) => {
          const value = e[`${k}`]
          return v === value
        })
      } else {
        selected.isParentArray = false
        selected.item = selected.item[`${selector}`]
      }
    }
    return selected
  }

  execOp(selected: Selected, patch: any) {
    const op = patch.op
    if (op === 'remove') {
      this.remove(selected)
    } else if (op === 'replace') {
      this.replace(selected, patch.value)
    } else if (op === 'add') {
      this.add(selected, patch.value)
    }
  }

  add(selected: Selected, value: any) {
    if (Array.isArray(selected.item)) {
      selected.item.push(value)
    } else {
      if (selected.parentItem[`${selected.selector}`]) {
        this.error(`the property ${selected.selector} you want to add has already existed!`,
          {exit: ReturnCode.ProfilePatchAddPropertyExisted}
        )
      }
      selected.parentItem[`${selected.selector}`] = value
    }
  }

  remove(selected: Selected) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item)
      selected.parentItem.splice(index, 1)
    } else {
      delete selected.parentItem[`${selected.selector}`]
    }
  }

  replace(selected: Selected, value: any) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item)
      selected.parentItem[index] = value
    } else {
      selected.parentItem[`${selected.selector}`] = value
    }
  }
}

export = Yprofile;

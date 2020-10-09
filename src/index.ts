import { Command, flags } from '@oclif/command';
import { ReturnCode } from './return-code';
import * as fs from 'fs';
import * as YAML from 'yaml';

interface Selected {
  item: any,
  isParentArray: boolean,
  parentItem: any,
  selector: string
}

class Yprofile extends Command {
  static description =
    'Generate yaml file from yaml file with in-block profiles';

  // static usage = `'input file' --profile='profile in inputfile' [--out='output file]' `;

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    output: flags.string({
      char: 'o',
      description:
        'the output file path. Default to the same path as input file and suffix with .out',
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
    const { args, flags } = this.parse(Yprofile);

    const { yaml, profiles } = this.getYaml(args.input_file);
    this.checkProfiles(profiles);

    const profile = this.getProfile(args.profile, profiles);
    const genYaml = this.generate(yaml, profile);

    // let workingPath = process.cwd();
    // console.log('workingPath', workingPath);
    // this._help();
  }

  getYaml(inputFilePath: string) {
    const inputFile = fs.readFileSync(inputFilePath, 'utf8');
    const yaml = YAML.parse(inputFile);
    // console.log(yaml);
    
    const profiles = yaml.profiles;
    delete yaml.profiles;
    return {
      yaml,
      profiles
    };
  }

  checkProfiles(profiles: any) {
    // console.log(profiles);
    for (let profile of profiles) {
      if (!profile.hasOwnProperty('patches')) {
        this.error('there is no patches section in profile, please define patches section!', {exit: ReturnCode.NoPatches});
      }
      const patches = profile.patches;
      const opType = ['replace', 'remove', 'add'];
      for (let patch of patches) {
        if (!patch.hasOwnProperty('op')) {
          this.error(
            `there is no op in ${patch}, please define op of the patch!`,
             {exit: ReturnCode.NoOp}
          );
        }
        if (!opType.includes(patch.op)) {
          this.error(
            `op must be defined as replace, remove or add, please checke ${patch.op}`, 
            {exit: ReturnCode.WrongOp}
          );
        }
        if (!patch.hasOwnProperty('path')) {
          this.error(
            `there is no path in ${patch}, please define path of the patch!`, 
            {exit: ReturnCode.NoPath}
          );
        }

        if (patch.op === 'add') {
          if (!patch.hasOwnProperty('value')) {
            this.error(
              `there is no value in ${patch} for op to add, please define value for the patch!`, 
              {exit: ReturnCode.NoValue}
            );
          }
        }
      }      
    }
    
  }

  getProfile(profileName: string, profiles: any) {
    const res = profiles.find((element: {name?: string}) => {
      const name = element['name'];
      return name === profileName;
    });
    if (res === undefined) {
      this.error(`there is no ${profileName} in profiles section of the input file!`, {exit: ReturnCode.NoProfile});
    }
    return res;
  }

  generate(yaml: any, profile: any) {
    const patches = profile.patches;
    for (let patch of patches) {
      this.applyPatch(yaml, patch);
    }
    console.log(yaml);
  }

  applyPatch(yaml: any, patch: any) {    
    const selected = this.getSelected(yaml, patch);
    this.execOp(selected, patch);
  }

  getSelected(yaml: any, patch: any) {
    const selected: Selected = {
      item: yaml,
      isParentArray: Array.isArray(yaml),
      parentItem: yaml,
      selector: ''
    };
    // console.log(selected);
    const selectors = patch.path.split('.');
    for (let selector of selectors) {
      selected.parentItem = selected.item;
      selected.selector = selector;
      if (selector.includes('=')) {        
        selected.isParentArray = true;        
        const kv = selector.split('=');
        const k = kv[0];
        const v = kv[1];
        selected.item = selected.item.find((e: any) => {
          const value = e[`${k}`];
          return v === value;
        });
      } else {
        selected.isParentArray = false;
        selected.item = selected.item[`${selector}`];
      }
    }
    return selected;
  }

  execOp(selected: Selected, patch: any) {
    const op = patch.op;
    if ('remove' === op) {
      this.remove(selected);
    } else if ('replace' === op) {
      this.replace(selected, patch.value);
    }
  }

  remove(selected: Selected) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item);
      selected.parentItem.splice(index, 1);
    } else {
      delete selected.parentItem[`${selected.selector}`];
    }
  }

  replace(selected: Selected, value: any) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item);
      selected.parentItem[index] = value;
    } else {
      selected.parentItem[`${selected.selector}`] = value;
    }
  }
}

export = Yprofile;

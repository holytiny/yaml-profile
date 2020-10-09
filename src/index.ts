import { Command, flags } from '@oclif/command';
import { ReturnCode } from './return-code';
import * as fs from 'fs';
import * as YAML from 'yaml';


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

    const { yaml, profiles } = this.inputYaml(args.input_file);
    this.checkProfile(args.profile, profiles);

    // let workingPath = process.cwd();
    // console.log('workingPath', workingPath);
    // this._help();
  }

  inputYaml(inputFilePath: string) {
    const inputFile = fs.readFileSync(inputFilePath, 'utf8');
    const yaml = YAML.parse(inputFile);
    const profiles = yaml.profiles;
    delete yaml.profiles;
    return {
      yaml,
      profiles
    };
  }

  checkProfile(profileName: string, profiles: any) {
    const res = profiles.find((element: {name?: string}) => {
      const name = element['name'];
      return name === profileName;
    });
    if (res === undefined) {
      this.error(`there is no ${profileName} in profiles section of the input file!`, {exit: ReturnCode.NoProfile});
    }
  }
}

export = Yprofile;

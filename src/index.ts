import {Command, flags} from '@oclif/command'

class Yprofile extends Command {
  static description = "Generate yaml file from yaml file with profiles";

  // static usage = `'input file' --profile='profile in inputfile' [--out='output file]' `;

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    profile: flags.string({
      char: "p",
      description:
        "profile of the in block profiles to use to generate the yaml file",
      multiple: false,
      required: true,
    }),
    output: flags.string({
      char: "o",
      description:
        "the output file path. Default to the same path as input file and suffix with .out",
    }),
  };

  static args = [
    {
      name: "input-file",
      required: true,
      description: "input yaml file with profiles in block",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Yprofile);

    let workingPath = process.cwd();
    console.log('workingPath', workingPath);
    this._help();
  }
}

export = Yprofile

import Command from '../base-op'
import {flags} from '@oclif/command'

class Set extends Command {
  static description =
    'add a property and value pair in a yaml, mainly used for gitops ci'

  static args = [
    {
      name: 'input_file',
      required: true,
      description: 'the file path of the yaml, such as /home/john/workspace/ci.yaml',
    },
    {
      name: 'path',
      required: true,
      description: 'the path of the value to be added, such as ingress.enable',
    },
    {
      name: 'value',
      required: true,
      description: 'the value to be added, such as true or false',
    },
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args} = this.parse(Set)
    this.processCmd(args.input_file, 'add', args.path, args.value)
  }
}

export = Set;

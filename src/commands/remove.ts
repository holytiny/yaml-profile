import Command from '../base-op'
import {flags} from '@oclif/command'

class Set extends Command {
  static description =
    'remove a property and its value from a yaml, mainly used for gitops ci'

  static args = [
    {
      name: 'file',
      required: true,
      description: 'the file path of the yaml, such as /home/john/workspace/ci.yaml',
    },
    {
      name: 'path',
      required: true,
      description: 'the path of the value to be removed, such as ingress.enable',
    },
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    // const {args, flags} = this.parse(Set)

  }
}

export = Set;

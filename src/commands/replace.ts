import Command from '../base-op'
import {flags} from '@oclif/command'

class Set extends Command {
  static description =
    'replace a property and value pair in a yaml, mainly used for gitops ci'

  static args = [
    {
      name: 'file',
      required: true,
      description: 'the file path of the yaml, such as /home/john/workspace/ci.yaml',
    },
    {
      name: 'path',
      required: true,
      description: 'the path of the value to be replaced, such as ingress.enable',
    },
    {
      name: 'value',
      required: true,
      description: 'the value to be replaced, such as true or false',
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
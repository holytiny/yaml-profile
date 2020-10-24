import Command from '../base-op'
import {flags} from '@oclif/command'

class Set extends Command {
  static description =
    'remove a property and its value from a yaml, mainly used for gitops ci'

  static args = [
    {
      name: 'input_file',
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
    const {args} = this.parse(Set)
    const {yaml} = this.getYaml(args.input_file)
    this.processCmd(yaml, 'remove', args.path, args.value)
  }
}

export = Set;

import Command from '../base'
import {flags} from '@oclif/command'

class Set extends Command {
  static description =
    'Set the value of a yaml file in specific path'

  static args = [
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
    // const {args, flags} = this.parse(Set)

  }
}

export = Set;

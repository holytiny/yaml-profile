import * as fs from 'fs'
import * as YAML from 'yaml'

import Command from '@oclif/command'

import {ReturnCode} from './common/return-code'
import {ArrayParser} from './common/util'

interface Selected {
  item: any;
  isParentArray: boolean;
  parentItem: any;
  selector: string;
}

export default abstract class extends Command {

  protected getYaml(inputFilePath: string) {
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

  protected applyPatch(yaml: any, patch: any) {
    const selected = this.getSelected(yaml, patch)
    this.execOp(selected, patch)
  }

  protected getSelected(yaml: any, patch: any) {
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
      } else if (selector.includes('[')) {
        // values.container[1] is equal to
        // (values.container)[1], so,
        // selected.parentItem = selected.item.container
        // selected.item = selected.parentItem[1]
        const arrayParser = new ArrayParser(selector)
        arrayParser.parse()
        const name = arrayParser.name
        const index = arrayParser.index
        selected.parentItem = selected.item[`${name}`]
        selected.item = selected.parentItem[`${index}`]
        selected.isParentArray = true
        selected.selector = index
      } else {
        selected.isParentArray = false
        selected.item = selected.item[`${selector}`]
      }
    }
    return selected
  }

  protected execOp(selected: Selected, patch: any) {
    const op = patch.op
    if (op === 'remove') {
      this.remove(selected)
    } else if (op === 'replace') {
      this.replace(selected, patch.value)
    } else if (op === 'add') {
      this.add(selected, patch.value)
    }
  }

  protected add(selected: Selected, value: any) {
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

  protected remove(selected: Selected) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item)
      selected.parentItem.splice(index, 1)
    } else {
      delete selected.parentItem[`${selected.selector}`]
    }
  }

  protected replace(selected: Selected, value: any) {
    if (selected.isParentArray) {
      const index = selected.parentItem.indexOf(selected.item)
      selected.parentItem[index] = value
    } else {
      selected.parentItem[`${selected.selector}`] = value
    }
  }
}

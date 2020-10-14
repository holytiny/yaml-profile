# yprofile

A tool to generate yaml file use &#39;in-block&#39; profile.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@holytiny/yprofile.svg)](https://www.npmjs.com/package/@holytiny/yprofile)
[![CI](https://img.shields.io/travis/com/holytiny/yaml-profile)](https://www.npmjs.com/package/@holytiny/yprofile)
[![Downloads/week](https://img.shields.io/npm/dw/@holytiny/yprofile.svg)](https://www.npmjs.com/package/@holytiny/yprofile)
[![License](https://img.shields.io/npm/l/@holytiny/yprofile.svg)](https://github.com/holytiny/yaml-profile/blob/main/LICENSE)

- [Motivation](#motivation)
- [Usage](#usage)

# Motivation

Sometimes, we find that we need to modify the yaml file slightly under different conditions or in the different stages of the project. For example, we might use a yaml file to control the ci/cd system, for develop:

```yaml
images:
  backend:
    image: john/devbackend
  backend-debugger:
    image: john/debugger
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/devbackend
          - image: john/debugger
```

For staging:

```yaml
images:
  backend:
    image: john/stagingbackend
  backend-debugger:
    image: john/debugger
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/stagingbackend
          - image: john/debugger
```

And for production:

```yaml
images:
  backend:
    image: john/prodbackend
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/devbackend
          - image: john/cache
```

Maintaining such yaml files is tendious and error prone. An elegant solution is to generate the yaml file from a template file, and save the modification actions in git repo. A devops tool [devspace](https://devspace.sh/cli/docs/configuration/profiles/basics) provides a method to support such solutions, however, saddly it can only be used to its own config file. 

Motivated by [devspace](https://devspace.sh/cli/docs/configuration/profiles/basics), [yprofile](#yprofile) provide nearly the same profile operations to any yaml files with profiles section, and use this template to generate templates as profile describing.

<!-- toc -->

- [yprofile](#yprofile)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @holytiny/yprofile
$ yprofile COMMAND
running command...
$ yprofile (-v|--version|version)
@holytiny/yprofile/0.0.2-beta.5 darwin-x64 node-v12.18.4
$ yprofile --help [COMMAND]
USAGE
  $ yprofile COMMAND
...
```

<!-- usagestop -->

## Commands basic

<!-- commands -->

<!-- commandsstop -->

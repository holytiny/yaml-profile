# yprofile

A tool to generate yaml file use &#39;in-block&#39; profile.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@holytiny/yprofile.svg)](https://www.npmjs.com/package/@holytiny/yprofile)
[![CI](https://img.shields.io/travis/com/holytiny/yaml-profile)](https://www.npmjs.com/package/@holytiny/yprofile)
[![Downloads/week](https://img.shields.io/npm/dw/@holytiny/yprofile.svg)](https://www.npmjs.com/package/@holytiny/yprofile)
[![License](https://img.shields.io/npm/l/@holytiny/yprofile.svg)](https://github.com/holytiny/yaml-profile/blob/main/LICENSE)

- [Motivation](#motivation)
  - [Profile](#profile)
  - [Directly](#directly)
- [Quick Start](#quick-start)
  - [Install](#install)
  - [Basic Usage](#basic-usage)
- [Details](#details)
  - [Profile Usage](#profile-usage)
  - [Profiles](#profiles)
  - [Path](#path)
  - [Selector](#selector)
    - [Array Selector](#array-selector)
  - [Add](#add)
  - [Replace](#replace)
  - [Remove](#remove)
  - [File Generate](#file-generate)
    - [Logic](#logic)
    - [Why](#why)
  - [Directly Modify](#directly-modify)
    - [Add](#add)
    - [Remove](#remove)
    - [Replace](#replace)
- [NOTICE](#notice)

# Motivation

## Profile

Sometimes, we would find that we need to modify the yaml file slightly under different conditions or in the different stages of the project. For example, we might use a yaml file to control the ci/cd system, for develop:

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

Maintaining such yaml files is tendious and error prone. An elegant solution is to generate the yaml files from a template file, and save the modification actions in git repo. A devops tool [devspace](https://devspace.sh/cli/docs/configuration/profiles/basics) provides a method to support such solutions, however, saddly it can only be used to its own config file.

Motivated by [devspace](https://devspace.sh/cli/docs/configuration/profiles/basics), [yprofile](#yprofile) provide nearly the same profile operations to any yaml files with profiles section, and use this template to generate templates as profile describing. These functions are supported by yprofile as `generate` command.

```sh-session
yprofile generate
```

## Directly

We will find that sometimes we have to modify the yaml file directly in ci script, especially in gitops processes. For example, if we use helm as the manifest, during the ci process we need to modify the helm chart, at least the appVersion property, in another git repo for cd tools to deploy our containers to dock compose or k8s.

So it may be helpful the the yaml file can be directly modified from the command line. These functions are supported by yprofile as `operate` command.

```sh-session
yprofile add
yprofile remove
yprofile replace
```

# Quick Start

## Install

```sh-session
npm install @holytiny/yprofile -D
```

## Basic usage

```sh-session
USAGE
  $ yprofile [COMMAND]

COMMANDS
  add       add a property and value pair in a yaml, mainly used for gitops ci
  generate  generate yaml file from yaml file template with in-block profiles, for manual use
  help      display help for yprofile
  remove    remove a property and its value from a yaml, mainly used for gitops ci
  replace   replace a property and value pair in a yaml, mainly used for gitops ci
```

If we have a template yaml file named `test.template.yaml`:

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
profiles:
  - name: staging
    patches:
      - op: replace
        path: images.backend.image
        value: john/stagingbackend
      - op: remove
        path: deployments.name=backend.helm.values.containers[1]
  - name: production
    patches:
      - op: replace
        path: images.backend.image
        value: john/prodbackend
      - op: remove
        path: deployments.name=backend.helm.values.containers[1]
      - op: add
        path: deployments.name=backend.helm.values.containers
        value:
          image: john/cache
```

After we run the command:

```sh-session
npx yprofile generate test.template.yaml staging --output=test.yaml
```

We would get a yaml file named `test.yaml`:

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
          - image: john/devbackend
```

If a yaml file named `Chart.yaml`:

```yaml
apiVersion: v2
name: first-chart
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: 1.16.0
```

After we run the command:

```
yprofile replace Chart.yaml appVersion 1.16.1
```

The Chart.yaml will become:

```yaml
apiVersion: v2
name: first-chart
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: 1.16.1
```

This would be very useful in gitops ci script.

# Details

## Profile Usage

Simply speaking, yprofile uses `generate` or abbreviation form `gen` command to generate the yaml file from a template which has `profiles` section.

```sh-session
USAGE
  $ yprofile generate INPUT_FILE PROFILE

ARGUMENTS
  INPUT_FILE  input yaml file with profiles in block
  PROFILE     the profile used to generate the yaml file

OPTIONS
  -f, --force          generate the yaml file to output file regardless whether a file has already existed
  -h, --help           show CLI help
  -o, --output=output  the output file path. Default to the same path as input file and suffix with .out

ALIASES
  $ yprofile gen
```

## Profiles

Simply speaking, `profiles` section are groups of operations. `Profiles` contains several `profile`, a `profile` should contains tow sections, `name` and `patches`.

The `name` of a `profile` represents the stage, env or process of the operations in it.The `patches` contains several `patch` in it. The `patch` is the **real** operation.

A `patch` contains `op`, `path` and an operational `value`. The `op` is the action to yaml template content, currently, `remove`, `replace` and `add` ops are supported.

```yaml
profiles:
  - name: staging
    patches:
      - op: replace
        path: images.backend.image
        value: john/stagingbackend
      - op: remove
        path: deployments.name=backend.helm.values.containers[1]
```

## Path

The `path` specifies which property or element of the template yaml to be modifed or added. The `path` contains `selector` which is seperated by the `.` dot sign. For example:

```yaml
path: deployments.name=backend.helm.values.containers[1]
```

The `path` above contains 5 selector:

- deployments
- name=backend
- helm
- values
- containers[1]

The `selector` is used to trace down the yaml properties and specify the element to be operated.

## Selector

There are tow type of selectors, **map** selector and **array** selector. The **map** selector is straight forward, it uses `.` sign to trace down the yaml element. For convenient and compatible with the devspace syntex, the **array** selector supports two styles: `[]` sign and `=` sign, which are equivalent in the result.

- deployments: map selector
- name=backend: array selector uses = sign
- helm: map selector
- values: map selector
- containers[1]: array selector uses [] sign

### Array Selector

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

To select a deployment named **backend** in the template above, these tow selectors are the same:

- deployments[0]
- deployments.name=backend

To select a container, which image is john/debugger, the two selectors below are the same:

- deployments.name=backend.helm.values.containers.image=john/debugger
- deployments[0].helm.values.containers[1]

## Add

The `add` op can only add the value to the element **DOES NOT EXIST**, if the element has already existed, plase use `replace`.

If a yaml template named `add-test.yaml`:

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
profiles:
  - name: production
    patches:
      - op: add
        path: images.frontend
        value:
          image: john/frontend
      - op: add
        path: deployments.name=backend.helm.values.containers
        value:
          image: john/cache
      - op: add
        path: deployments[0].helm.values.containers
        value:
          image: john/frontend
```

Run yprofile:

```sh-session
npx yprofile gen add-test.yaml production --output=add-test-res.yaml
```

The output file of `add-test-res.yaml` should be:

```yaml
images:
  backend:
    image: john/devbackend
  backend-debugger:
    image: john/debugger
  frontend:
    image: john/frontend
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/devbackend
          - image: john/debugger
          - image: john/cache
          - image: john/frontend
```

## Replace

If a yaml template named `replace-test.yaml`:

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
          - image: john/devfrontend
          - image: john/debugger
profiles:
  - name: staging
    patches:
      - op: replace
        path: images.backend.image
        value: john/stagingbackend
      - op: replace
        path: deployments[0].helm.values.containers[0]
        value:
          image: john/backend
      - op: replace
        path: deployments.name=backend.helm.values.containers.image=john/devfrontend
        value:
          image: john/frontend
      - op: replace
        path: deployments.name=backend.helm.values.containers[2]
        value:
          image: john/deploy
```

Run yprofile:

```sh-session
npx yprofile gen replace-test.yaml staging --output=replace-test-res.yaml
```

The output file of `replace-test-res.yaml` should be:

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
          - image: john/backend
          - image: john/frontend
          - image: john/deploy
```

## Remove

If a yaml template named `remove-test.yaml`:

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
          - image: john/cache
          - image: john/frontend
profiles:
  - name: staging
    patches:
      - op: remove
        path: images.backend-debugger
      - op: remove
        path: deployments.name=backend.helm.values.containers[3]
      - op: remove
        path: deployments.name=backend.helm.values.containers.image=john/cache
```

Run yprofile:

```sh-session
npx yprofile gen replace-test.yaml staging --output=replace-test-res.yaml
```

The output file of `replace-test-res.yaml` should be:

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
          - image: john/backend
          - image: john/frontend
          - image: john/deploy
```

## File Generate

### Logic

If there is no file in the output path, the output file is always generated.

If there is already a file in the output path, yprofile will try to read the content of that file, if the content of that file is the same as the generated content, output process will be skipped.

If the content of that file is different from the content generated, if the `-f` or `--force` flag is not set, yprofile will issue an error and exit. The content of that file will not be changed.

If the `-f` or `--force` flag is set, yprofile will backup that file to a name associated with the current date time, and rewrite that file.

### Why

This feature is for file debug.

Suppose that you generate a file named `test.yaml` using yprofile from the yaml template file `test.template.yaml`, and the `test.yaml` doesn't work, you can modify the content of `test.yaml` directly to test the function. After every things being done, you can use `-f` flag to regenerate the `test.yaml` file and you would have tow file, the `test.yaml` file which is buggy, and the backup file may named `test-2020-10-11-13:45:18.yaml` which is correct, then you can compare the two file to verify that the content of the template is correct.

## Directly Modify

We can run yprofile to modify the yaml file directly rather than using profiles section.

The concepts used in such `directly modify` command is the same as profile methods.

### Add

```sh-session
add a property and value pair in a yaml, mainly used for gitops ci

USAGE
  $ yprofile add INPUT_FILE PATH VALUE

ARGUMENTS
  INPUT_FILE  the file path of the yaml, such as /home/john/workspace/ci.yaml
  PATH        the path of the value to be added, such as ingress.enable
  VALUE       the value to be added, such as true or false

OPTIONS
  -h, --help  show CLI help
```

If we have a yaml file named `add.yaml`:

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

Run yprofile add:

```sh-session
npx yprofile add add.yaml version 1.0.0

npx yprofile add add.yaml images.frontend image: john/frontend

npx yprofile add add.yaml deployments.name=backend.helm.values.containers image: john/cache

npx yprofile add add.yaml deployments[0].helm.values.containers image: john/frontend
```

The `add.yaml` should become:

```yaml
images:
  backend:
    image: john/devbackend
  backend-debugger:
    image: john/debugger
  frontend:
    image: john/frontend
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/devbackend
          - image: john/debugger
          - image: john/cache
          - image: john/frontend
version: 1.0.0
```

### Remove

```sh-session
remove a property and its value from a yaml, mainly used for gitops ci

USAGE
  $ yprofile remove INPUT_FILE PATH

ARGUMENTS
  INPUT_FILE  the file path of the yaml, such as /home/john/workspace/ci.yaml
  PATH        the path of the value to be removed, such as ingress.enable

OPTIONS
  -h, --help  show CLI help
```

If we have a yaml file named `remove.yaml`:

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
          - image: john/cache
          - image: john/frontend
```

Run `yprofile remove`:

```sh-session
npx yprofile remove remove.yaml images.backend-debugger

npx yprofile remove remove.yaml deployments.name=backend.

npx yprofile remove remove.yaml deployments.name=backend.helm.values.containers.image=john/cache
```

The `remove.yaml` should become:

```yaml
images:
  backend:
    image: john/devbackend
deployments:
  - name: backend
    helm:
      componentChart: true
      values:
        containers:
          - image: john/devbackend
          - image: john/debugger
```

### Replace

```sh-session
replace a property and value pair in a yaml, mainly used for gitops ci

USAGE
  $ yprofile replace INPUT_FILE PATH VALUE

ARGUMENTS
  INPUT_FILE  the file path of the yaml, such as /home/john/workspace/ci.yaml
  PATH        the path of the value to be replaced, such as ingress.enable
  VALUE       the value to be replaced, such as true or false

OPTIONS
  -h, --help  show CLI help
```

If we have a file named `replace.yaml`:

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
          - image: john/devfrontend
          - image: john/debugger
```

If we run `yprofile replace`:

```sh-session
npx yprofile replace replace.yaml images.backend.image john/stagingbackend

npx yprofile replace replace.yaml deployments[0].helm.values.containers[0] image: john/backend

npx yprofile replace replace.yaml deployments.name=backend.helm.values.containers.image=john/devfrontend image: john/frontend

npx yprofile replace replace.yaml deployments.name=backend.helm.values.containers[2] image: john/deploy
```

The `replace.yaml` should become:

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
          - image: john/backend
          - image: john/frontend
          - image: john/deploy
```

# NOTICE

- Try to always use the = sign to select the arry
- Only use [] sign at the end of the path, if you want to use [] sign selector to select array element
- Try hard to **avoid** create patch rely on the results of other patches
- The content of output yaml file is sorted

## Try to always use the = sign to select the arry

## Only use [] sign at the end of the path, if you want to use [] sign selector to select array element

Because the content of the yaml template would change frequently and the index of the element in arry would change...

## Try hard to avoid create patch rely on the results of other patches

For the sake of efficiency and speed, yprofile **DO NOT** reparse the output yaml after eache patch. The sequence of the yprofile is something like:

```
read the template -> read the profile -> do all patches to the template -> output
```

So the conent of the output **DO NOT CHANGE** actually after each patch before it is write to the output file.

This may conflict with your intuition，so please don't generate the file rely on the logic between each patch!!!

If you really need such functions, please consider using [directly modify](#directly-modify) methods.

## The content of output yaml file is sorted

To **sematicly** compare two yaml files, the yaml file is sorted immediatly after it is read, so the output of the yaml file is also sorted.

So the sequence of the output yaml file sections may be different from the input file.

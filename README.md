# Dev Container Validator

[![GitHub Super-Linter](https://github.com/chrisreddington/devcontainer-validator/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/chrisreddington/devcontainer-validator/actions/workflows/ci.yml/badge.svg)

A GitHub Action to validate Dev Container configuration. This action checks
required Visual Studio Code extensions and optionally validates task configuration in
devcontainer.json files.

## Features

- Validates presence of required Visual Studio Code extensions in devcontainer.json
- Optional validation of common development tasks (build, test, run)
- Customizable devcontainer.json path
- Configurable extension requirements

## Usage

```yaml
Steps:
  - uses: actions/checkout@v4

  - name: Validate Dev Container
    uses: chrisreddington/devcontainer-validator@v1
    with:
      # Required Visual Studio Code extensions (comma-separated)
      extensions-list: 'GitHub.codespaces,GitHub.vscode-github-actions'

      # Optional: Path to devcontainer.json
      devcontainer-path: '.devcontainer/devcontainer.json'

      # Optional: Enable task validation
      validate-tasks: 'true'
```

### Inputs

| Input               | Description                                         | Required | Default                                                                                                                                                                            |
| ------------------- | --------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions-list`   | Comma-separated list of required Visual Studio Code extensions | Yes      | GitHub.codespaces,github.vscode-github-actions,GitHub.copilot,GitHub.copilot-chat,github.copilot-workspace,GitHub.vscode-pull-request-github,GitHub.remotehub,GitHub.vscode-codeql |
| `devcontainer-path` | Path to devcontainer.json file                      | No       | .devcontainer/devcontainer.json                                                                                                                                                    |
| `validate-tasks`    | Enable validation of build, test, and run tasks     | No       | false                                                                                                                                                                              |

#### Extension Validation

The action checks for the presence of the required extensions in the
`extensions-list` input. The input is a comma-separated list of extension IDs.
The action checks for the presence of each extension in the `devcontainer.json`
file.

#### Task Validation

When `validate-tasks` is set to `true`, the action checks for the following
required tasks in devcontainer.json:

- `build`
- `test`
- `run`

Each task must be defined as a string value.

#### Example devcontainer.json

```json
{
  "customizations": {
    "vscode": {
      "extensions": ["GitHub.codespaces", "GitHub.vscode-github-actions"]
    }
  },
  "tasks": {
    "build": "npm run build",
    "test": "npm test",
    "run": "npm start"
  }
}
```

## Development

1. Install dependencies: npm install

2. Run tests: npm test

3. Build the action: npm run bundle

## License

MIT License - see [LICENSE](LICENSE) for details.

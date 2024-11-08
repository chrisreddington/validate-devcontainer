# Dev Container Validator

[![GitHub Super-Linter](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/linter.yml/badge.svg)](https://github.com/chrisreddington/validate-devcontainer)
![CI](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/check-dist.yml/badge.svg)](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/chrisreddington/validate-devcontainer/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action to validate Dev Container configuration. This action checks
required Visual Studio Code extensions and optionally validates task
configuration in devcontainer.json files.

## Features

- Validates presence of required Visual Studio Code extensions in
  devcontainer.json
- Optional validation of common development tasks (build, test, run)
- Customizable devcontainer.json path
- Configurable extension requirements
- Validates presence of required devcontainer features in devcontainer.json

## Usage

```yaml
Steps:
  - uses: actions/checkout@v4

  - name: Validate Dev Container
    uses: chrisreddington/validate-devcontainer@v1
    with:
      # Required Visual Studio Code extensions (comma-separated)
      extensions-list: 'GitHub.codespaces,GitHub.vscode-github-actions'

      # Optional: Path to devcontainer.json
      devcontainer-path: '.devcontainer/devcontainer.json'

      # Optional: Enable task validation
      validate-tasks: 'true'

      # Optional: Required devcontainer features (comma-separated)
      features-list: 'ghcr.io/devcontainers/features/github-cli:1,ghcr.io/devcontainers-contrib/features/prettier:1'
```

### Inputs

| Input               | Description                                                    | Required | Default                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions-list`   | Comma-separated list of required Visual Studio Code extensions | Yes      | GitHub.codespaces,github.vscode-github-actions,GitHub.copilot,GitHub.copilot-chat,github.copilot-workspace,GitHub.vscode-pull-request-github,GitHub.remotehub,GitHub.vscode-codeql |
| `devcontainer-path` | Path to devcontainer.json file                                 | No       | .devcontainer/devcontainer.json                                                                                                                                                    |
| `validate-tasks`    | Enable validation of build, test, and run tasks                | No       | false                                                                                                                                                                              |
| `features-list`     | Comma-separated list of required devcontainer features         | No       |                                                                                                                                                                                    |

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

#### Feature Validation

The action checks for the presence of the required features in the
`features-list` input. The input is a comma-separated list of feature IDs. The
action checks for the presence of each feature in the `devcontainer.json` file.

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
  },
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers-contrib/features/prettier:1": {}
  }
}
```

## Development

1. Install dependencies: npm install

1. Run tests: npm test

1. Build the action: npm run bundle

## License

MIT License - see [LICENSE](LICENSE) for details.

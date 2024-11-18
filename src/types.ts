/**
 * Represents VS Code specific customizations in devcontainer.json
 * Contains settings related to VS Code editor configuration
 */
export interface VSCodeCustomizations {
  vscode: {
    /**
     * Array of VS Code extension IDs to be installed
     * Format: "publisher.extensionName"
     */
    extensions: string[]
  }
}

/**
 * Represents the core structure of a devcontainer.json file
 * Contains configuration for VS Code Dev Containers
 */
export interface DevcontainerContent {
  /**
   * VS Code specific customizations including extensions
   */
  customizations?: VSCodeCustomizations

  /**
   * Task definitions for common development operations
   * Key is the task name, value is the command string
   */
  tasks?: {
    [key: string]: string
  }

  /**
   * Dev Container features to be installed
   * Key is the feature identifier, value is its configuration
   */
  features?: {
    [key: string]: object
  }
}

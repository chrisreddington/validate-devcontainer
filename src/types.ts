export interface VSCodeCustomizations {
  vscode: {
    extensions: string[]
  }
}

export interface DevcontainerContent {
  customizations?: VSCodeCustomizations
  tasks?: {
    [key: string]: string
  }
  features?: {
    [key: string]: object
  }
}

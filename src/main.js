const core = require('@actions/core');
const fs = require('fs');

function validateExtensions(devcontainerContent, requiredExtensions) {
  const configuredExtensions = devcontainerContent?.customizations?.vscode?.extensions || [];
  const missingExtensions = requiredExtensions.filter(
    required => !configuredExtensions.includes(required)
  );
  return missingExtensions;
}

function validateTasks(devcontainerContent) {
  const tasks = devcontainerContent.tasks;
  if (!tasks) {
    return "'tasks' property is missing";
  }

  const requiredTasks = ['build', 'test', 'run'];
  const missingTasks = requiredTasks.filter(task => !tasks[task] || typeof tasks[task] !== 'string');
  
  if (missingTasks.length > 0) {
    return `Missing or invalid required tasks: ${missingTasks.join(', ')}`;
  }
  
  return null;
}

async function run() {
  try {
    const extensionsList = core.getInput('extensions-list', { required: true });
    const devcontainerPath = core.getInput('devcontainer-path', { required: false }) || '.devcontainer/devcontainer.json';
    const shouldValidateTasks = core.getInput('validate-tasks') === 'true';

    if (!fs.existsSync(devcontainerPath)) {
      throw new Error(`devcontainer.json not found at ${devcontainerPath}`);
    }

    const devcontainerContent = JSON.parse(fs.readFileSync(devcontainerPath, 'utf8'));
    const requiredExtensions = extensionsList.split(',').map(ext => ext.trim());
    const missingExtensions = validateExtensions(devcontainerContent, requiredExtensions);

    if (missingExtensions.length > 0) {
      throw new Error(`Missing required extensions: ${missingExtensions.join(', ')}`);
    }

    if (shouldValidateTasks) {
      const tasksError = validateTasks(devcontainerContent);
      if (tasksError) {
        throw new Error(tasksError);
      }
    }

    core.info('All validations passed successfully');
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = {
  run,
  validateExtensions,
  validateTasks
}

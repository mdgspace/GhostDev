const { registerAuthCommand } = require('./commands/auth.cjs');
const { registerNewRepoCommand } = require('./commands/newRepo.cjs');

function activate(context) {
  console.log('Extension "ghostdev" is now active!');
  registerAuthCommand(context);
  registerNewRepoCommand(context);
}

function deactivate() {}

module.exports = { activate, deactivate };

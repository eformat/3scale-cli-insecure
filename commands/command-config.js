var services = require("../lib/services");
var config = require("../lib/config");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


module.exports = function configCommand(program) {
  program
    .command("config")
    .description("Configure the 3scale cli")
    .action(config.configure);
}

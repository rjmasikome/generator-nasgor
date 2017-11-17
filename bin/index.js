const yeoman = require("yeoman-environment");
const generator = require("../generators/app");

const env = yeoman.createEnv();
env.registerStub(generator, "nasgor:service");
env.run("nasgor:service");
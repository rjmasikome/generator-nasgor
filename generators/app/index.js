const Generator = require("yeoman-generator");
const gitUrl = require("git-remote-origin-url");
const makeConfig = require("./config");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.devDependencies = [
      "eslint",
      "mocha"
    ];

    this.dependencies = [];
  }

  observing() {
    
    gitUrl().then(url => {
      this.props.git = url;
    })
      .catch(_e => {
      // Nothing TODO here 
      });
  }

  prompting() {
    
    const prompts = [];
    
    prompts.push({
      type    : "input",
      name    : "name",
      message : "What's the project name?",
      default : this.appname // Default to current folder name
    });

    prompts.push({
      type    : "input",
      name    : "description",
      message : "What is the description?",
      default : "NodeJS App" // Default to current folder name
    });

    prompts.push({
      type    : "input",
      name    : "src",
      message : "What is the entry point?",
      default : "index.js"
    });

    prompts.push({
      type: "list",
      name: "type",
      message: "JavaScript or TypeScript?",
      choices: [{
        name: "JavaScript",
        value: "js"
      }, {
        name: "TypeScript",
        value: "ts"
      }]
    });

    prompts.push({
      type: "input",
      name: "modules",
      message: "Which extra modules do you need (comma separated)?"
    });
    
    prompts.push({
      type    : "input",
      name    : "license",
      message : "License?",
      default : "MIT"
    });

    prompts.push({
      type    : "input",
      name    : "homepage",
      message : "What is the website?",
      default : this.props && this.props.git || "https://rj.masiko.me" 
    });

    prompts.push({
      type    : "confirm",
      name    : "nodemon",
      message : "Enable nodemon?",
      default : true
    });

    if (!this.props|| !this.props.git) {
      prompts.push({
        type    : "input",
        name    : "repository",
        message : "Where is the repository?"
      });
    }

    prompts.push({
      type: "input",
      name: "keywords",
      message: "Keywords (comma separated)?"
    });

    return this.prompt(prompts)
      .then((answers) => {
        answers.modules = answers.modules && answers.modules.split(",");
        answers.keywords = answers.keywords && answers.keywords.split(",") || [];        
        this.props = answers;
      });
  }

  generator() {
    
    this.fs.copy(this.templatePath("static", ".*"), this.destinationPath());

    if (this.props.type === "ts") {
      this.devDependencies.push("ts-node", "tslint", "typescript");
    }
    
    if (this.props.type === "js") {
      this.fs.copy(this.templatePath("js", ".*"), this.destinationPath());
    }

    if (this.props.modules.length > 0) {
      this.dependencies.push(...this.props.modules);
    }

    if (this.props.nodemon) {
      this.devDependencies.push("nodemon");
    }
    
    const pkg = makeConfig(this);
    
    this.fs.writeJSON(
      this.destinationPath("package.json"),
      pkg
    );
  }

  install () {

    if (this.dependencies) {
      this.yarnInstall(this.dependencies, {
        save: true
      });
    }

    this.yarnInstall(this.devDependencies, {
      dev: true
    });
  }
};

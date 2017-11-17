const Generator = require("yeoman-generator");
const gitUrl = require("git-remote-origin-url");
const makeConfig = require("./config");
const cmd = require('child_process').execSync;

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
      default : this.props && this.props.git || "https://npmjs.com" 
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
        answers.modules = answers.modules && answers.modules.split(",").map(x => x.trim());
        answers.keywords = answers.keywords && answers.keywords.split(",").map(x => x.trim()) || [];        
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

    const self = this;
    
    const _packageInstall = (deps, opts) => {
      
      let yarnInstalled = null;

      try {
        cmd("yarn --version").toString();
        yarnInstalled = true;
      } catch (err) {
        yarnInstalled = false;
      }

      if (yarnInstalled) {
        self.yarnInstall(deps, opts);
      }
      else {
        if (opts.dev) {
          opts["save-dev"] = true;
        }
        self.npmInstall(deps, opts);
      }
    }


    if (this.dependencies) {
      _packageInstall(this.dependencies, {
        save: true
      });
    }

    _packageInstall(this.devDependencies, {
      dev: true
    });
  }
};

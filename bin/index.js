#! /usr/bin/env node

"use strict";

const path = require("path");
const yeoman = require("yeoman-environment");
const generator = require(path.join(__dirname, "../generators/app"));

const env = yeoman.createEnv();
env.registerStub(generator, "nasgor:service");
env.run("nasgor:service");
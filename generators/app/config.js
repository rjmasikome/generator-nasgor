module.exports = function(generator) {

  const { props } = generator;
  const lib = props.src;

  const pkg = {
    name: props.name,
    description: props.description,
    version: "0.0.1",
    homepage: props.homepage,
    main: lib,
    repository: props.repository,
    keywords: props.keywords,
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email()
    },
    contributors: [],
    bugs: {},
    directories: {
      test: "test/"
    },
    "scripts": {
      start: `node ${lib}/`,
      lint: props.type === "js" ? `eslint ${lib}/. test/. --config .eslintrc.json` : `tslint ${lib}/. test/.`,
      "lint:fix" : props.type === "js" ? `eslint --fix ${lib}/. test/. --config .eslintrc.json` : `tslint --fix ${lib}/. test/.`,
      test: "mocha test/ --recursive --exit"
    }
  };

  if (props.nodemon) {
    pkg.scripts.dev = `nodemon ${lib}`;
  }
  return pkg;
};
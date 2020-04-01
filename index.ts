/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import 'source-map-support/register';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as chalk from 'chalk';
import * as Ajv from 'ajv';
import * as template from 'es6-template-strings';
import schema from './Schema.ts';

// eslint-disable-next-line
import * as Interfaces from './Interfaces';
const version = '1.1.2';

function printOverallResult(overallResult) {
  if (overallResult.checksFailed) {
    console.error(
      '\nresult:\n',
      chalk.green('✓'),
      overallResult.checksSuccessful,
      chalk.red('✕'),
      overallResult.checksFailed,
    );
    process.exit(1);
  } else {
    console.log(
      '\nresult:\n',
      chalk.green('✓'),
      overallResult.checksSuccessful, chalk.red('✕'),
      overallResult.checksFailed,
    );
    process.exit(0);
  }
}

function checkYamlFile(yamlObject: Interfaces.YamlStructure) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(yamlObject);
  if (!valid) {
    console.error(validate.errors);
    process.exit(1);
  }
}

function printFsCheckResult(result: Interfaces.ResourceCheckResult) {
  let checksSuccessful = 0;
  let checksFailed = 0;

  console.log(`\n${'    '.repeat(result.level)} /${result.name}`);
  result.checks.forEach((check) => {
    if (check.result) {
      checksSuccessful += 1;
    } else {
      checksFailed += 1;
    }
    console.log('    '.repeat(result.level + 1), check.result ? chalk.green('✓') : chalk.red('✕'), check.name);
  });
  // eslint-disable-next-line no-param-reassign
  if (!result.children) result.children = [];
  result.children.forEach((child) => {
    const subResult = printFsCheckResult(child);
    checksSuccessful += subResult.checksSuccessful;
    checksFailed += subResult.checksFailed;
  });

  return {
    checksSuccessful,
    checksFailed,
  };
}

function getCheck(name: string, result: boolean): Interfaces.Check {
  return {
    name,
    result,
  };
}

function checkResourceExisting(resourcePath): boolean {
  return fs.existsSync(resourcePath);
}

function checkResourceType(resourcePath, fsType: Interfaces.FsResourceType): boolean {
  try {
    return (
      fsType === Interfaces.FsResourceType.DIRECTORY
      && fs.statSync(resourcePath).isDirectory()
    ) || (
      fsType === Interfaces.FsResourceType.FILE
      && fs.statSync(resourcePath).isFile()
    );
  } catch {
    return false;
  }
}

function checkFsResource(
  resourcePath: string | null,
  fsResource: Interfaces.FsResource,
  level: number = 0,
  yamlObject: Interfaces.YamlStructure,
): Interfaces.ResourceCheckResult {
  let currentResourcePath;
  if (resourcePath === null) {
    currentResourcePath = program.workingDir;
  } else {
    currentResourcePath = path.join(
      resourcePath,
      template(fsResource.name, yamlObject.vars),
    );
  }

  const result = {
    name: template(fsResource.name, yamlObject.vars),
    level,
    checks: [
      getCheck('is existing', checkResourceExisting(currentResourcePath)),
      fsResource.type ? getCheck(`is ${fsResource.type}`, checkResourceType(currentResourcePath, fsResource.type)) : null,
    ].filter((check) => !!check),
  } as Interfaces.ResourceCheckResult;

  result.children = result.children || [];
  if (fsResource.generateChildren) {
    fsResource.generateChildren.forEach((child) => {
      if (!child.list) throw new Error('no list defined');
      const list = yamlObject.vars[child.list];
      const newChildren = list.map((listItem: Interfaces.FsResource) => {
        const newItem = listItem;
        newItem.name = template(child.name, listItem);
        return newItem;
      });
      if (!fsResource.children) {
        // eslint-disable-next-line no-param-reassign
        fsResource.children = [];
      }
      fsResource.children.push(...newChildren);
    });
  }

  if (fsResource.type === Interfaces.FsResourceType.DIRECTORY && fsResource.children) {
    const newChildren = fsResource.children.map((childResource) => checkFsResource(
      currentResourcePath,
      childResource,
      level + 1,
      yamlObject,
    ));
    result.children.push(...newChildren);
  }

  return result;
}

program.version(version);
program
  .option('-c, --configfile <config file>', 'defines path of config file')
  .option('-w, --working-dir <working directory>', 'defined path of working directory')
  .parse(process.argv);

program.workingDir = program.workingDir || process.cwd();
program.configfile = program.configfile || '.file-structure-checker.yml';

const fullConfigPath = path.join(
  program.program.workingDir,
  program.configfile,
);

if (!fs.existsSync(fullConfigPath)) {
  console.error(`could not find configuration file "${program.configfile}" in "${program.workingDir}"`);
  process.exit(1);
}

const rawFileContent = fs.readFileSync(fullConfigPath).toString();
const yamlObject = yaml.parse(rawFileContent) as Interfaces.YamlStructure;
checkYamlFile(yamlObject);

printOverallResult(
  printFsCheckResult(
    checkFsResource(null, yamlObject.structure, 0, yamlObject),
  ),
);

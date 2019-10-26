const {getReruner, getSpecFilesArr} = require('process-rerun')
const path = require('path')
const fs = require('fs')


const {
  TREADS_COUNT = '30',
  MAILCATHCER_HOST,
  DEBUG_PROCESS,
  GREP_TEST,
  BUILD_NUMBER,
  ENV
} = process.env

function buildEnvCommandPart() {
  const begug = DEBUG_PROCESS ? `DEBUG_PROCESS="${DEBUG_PROCESS}" ` : ''
  const mcHost = MAILCATHCER_HOST ? `MAILCATHCER_HOST="${MAILCATHCER_HOST}" ` : ''

  return begug + mcHost
}

function formCommand(filePath) {
  return buildEnvCommandPart() + `./node_modules/.bin/mocha ${filePath} --timeout 500000 --reporter mocha-allure2-reporter`
}

function getCommandsArray() {
  return getSpecFilesArr(path.resolve(__dirname, './specs')).map(formCommand)
}

// const reformatCommand = (cmd, stack) => {
//   const regexp = /(?<=IT_TITLE:\[)(\d|\w|\s)+/ig;
//   const failedSpecs = stack.match(regexp);
//   if(failedSpecs) {
//     if(cmd.includes('__e2e__')) {return cmd}
//     console.log(`Failed specs: `, failedSpecs);
//     console.log(`${cmd} --grep='${failedSpecs.join('|')}'`)
//     return `${cmd} --grep='${failedSpecs.join('|')}'`;
//   } else {
//     return null;
//   }
// };

function shuffle(a) {
  for(let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function runRetrier() {

  const reRunner = getReruner({
    longestProcessTime: 1000 * 1000,
    maxSessionCount: +TREADS_COUNT,
    attemptsCount: 10,
    // reformatCommand,
    stackAnalize: () => true,
    debugProcess: true
  });

  // execute run
  const modernRun = await reRunner(shuffle(getCommandsArray()))
  // add addition info to allure report

  if(modernRun.failedCommands.length || modernRun.failedByAssert.length) {
    console.log(modernRun.failedCommands, modernRun.failedByAssert)
    process.exit(1)
  } else {
    process.exit(0)
  }
}

runRetrier();

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

function copyFileSync(source, target) {
  let targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target, isRoot = true) {
  let files = [];
  const targetFolder = isRoot ? target : path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, false);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('Usage: node cxcopy.js <source> <destination> [--watch|-w]');
  process.exit(1);
}

const source = args[0];
const destination = args[1];
const watch = args[2] === '--watch' || args[2] === '-w';

if (!fs.existsSync(source)) {
  console.error(`Source path "${source}" does not exist.`);
  process.exit(1);
}

copyFolderRecursiveSync(source, destination);
console.log(`Copied from "${source}" to "${destination}" successfully.`);

if (watch) {
  // watch with chokidar
  const watcher = chokidar.watch(source, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  watcher.on('add', (path) => {
    copyFolderRecursiveSync(path, destination);
    console.log(`Copied from "${path}" to "${destination}" successfully.`);
  });

  watcher.on('change', (path) => {
    copyFolderRecursiveSync(path, destination);
    console.log(`Copied from "${path}" to "${destination}" successfully.`);
  });
}

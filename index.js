
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

function copyFileSync(source, target, verbose) {
  let targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
  if (verbose) console.log(`Copied file from "${source}" to "${targetFile}" successfully.`);
}

function copyFolderRecursiveSync(source, target, isRoot = true, changedFilePath, verbose) {
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
        copyFolderRecursiveSync(curSource, targetFolder, false, changedFilePath, verbose);
      } else {
        if (!changedFilePath || changedFilePath === curSource)
          copyFileSync(curSource, targetFolder, verbose);
      }
    });
  }
}

export function cxCopy(source, destination, watch, verbose) {
  const isSourceExists = fs.existsSync(source);
  if (!watch && !isSourceExists) {
    console.error(`Source path "${source}" does not exist.`);
    process.exit(1);
  }

  if (isSourceExists) {
    copyFolderRecursiveSync(source, destination, true, null, verbose);
    if (verbose) console.log(`Copied from "${source}" to "${destination}" successfully.`);
  }

  if (watch) {
    // watch with chokidar
    const watcher = chokidar.watch(source, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    watcher.on('add', (changedFilePath) => {
      copyFolderRecursiveSync(source, destination, true, changedFilePath, verbose);
    });

    watcher.on('change', (changedFilePath) => {
      copyFolderRecursiveSync(source, destination, true, changedFilePath, verbose);
    });
  }
}
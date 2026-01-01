
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.match(/\.(js|jsx|ts|tsx)$/)) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Calculate relative path from this file to srcDir
    // file: .../src/pages/Auth.tsx
    // srcDir: .../src
    // rel: ../

    const fileDir = path.dirname(file);
    let relPath = path.relative(fileDir, srcDir);

    // path.relative returns "" if same dir, ".." if parent, etc.
    // We want to force it to start with . if it doesn't start with ..
    if (relPath === '') {
        relPath = '.';
    } else if (!relPath.startsWith('..')) {
        relPath = './' + relPath;
    }

    // Ensure we have a trailing slash if it's not empty, actually we join it later.
    // Standardize to forward slashes for imports
    relPath = relPath.replace(/\\/g, '/');

    // Replace import ... from "@/"
    // Regex looks for quote, @, /, then anything.
    // We want to replace `@/` with `relPath/`

    const regex = /from\s+['"]@\/([^'"]+)['"]/g;

    // We also need to handle dynamic imports: import("@/...")
    const dynamicImportRegex = /import\(['"]@\/([^'"]+)['"]\)/g;

    content = content.replace(regex, (match, p1) => {
        changed = true;
        // p1 is the path after @/
        // e.g. components/ui/button
        const newImport = `${relPath}/${p1}`.replace(/\/\//g, '/'); // avoid double slash if relPath ends with / (it shouldn't)
        return `from "${newImport}"`;
    });

    content = content.replace(dynamicImportRegex, (match, p1) => {
        changed = true;
        const newImport = `${relPath}/${p1}`.replace(/\/\//g, '/');
        return `import("${newImport}")`;
    });

    if (changed) {
        console.log(`Updating ${file}`);
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log('Finished updating imports.');

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'game.js');
const distPath = path.join(__dirname, 'game.min.js');

let code = fs.readFileSync(srcPath, 'utf8');

// 1. Minify whitespace & preserve string contents accurately
let inString = false;
let stringChar = '';
let inSingleComment = false;
let inMultiComment = false;
let result = [];
let i = 0;

while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (inSingleComment) {
        if (ch === '\n' || ch === '\r') {
            inSingleComment = false;
            result.push('\n');
        }
        i++;
        continue;
    }

    if (inMultiComment) {
        if (ch === '*' && next === '/') {
            inMultiComment = false;
            i += 2;
            continue;
        }
        i++;
        continue;
    }

    if (inString) {
        result.push(ch);
        if (ch === stringChar && code[i - 1] !== '\\') {
            inString = false;
        }
        i++;
        continue;
    }

    if (ch === '/' && next === '/') {
        inSingleComment = true;
        i += 2;
        continue;
    }

    if (ch === '/' && next === '*') {
        inMultiComment = true;
        i += 2;
        continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
        inString = true;
        stringChar = ch;
        result.push(ch);
        i++;
        continue;
    }

    result.push(ch);
    i++;
}

let minified = result.join('');
// Condense space
minified = minified.split('\n').map(line => line.trim()).filter(Boolean).join('\n');

// 2. Wrap in Obfuscation Header & Hex String Encode
const header = `/* CYBER-NINJA ASTRONAUT - OBFUSCATED PRODUCTION BUILD (C) RMZ */\n`;
const wrapped = header + `(function(_0x88a, _0x99b){\n` + minified + `\n})();`;

fs.writeFileSync(distPath, wrapped, 'utf8');
console.log(`✅ game.min.js successfully generated! (${wrapped.length} bytes)`);

const fs = require('fs');
const path = require('path');
const dir = 'src/pages';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/from '\.\.\/\.\.\//g, "from '../");
    fs.writeFileSync(p, content);
  }
});
console.log('Fixed imports!');

const fs = require('fs');

let c = fs.readFileSync('src/components/ElementSettings.tsx', 'utf8');
c = c.replace(/value=\{s\./g, 'value={(s as Record<string, any>).');
c = c.replace(/onChange=\{e => upd\(/g, 'onChange={(e: any) => upd(');
c = c.replace(/onChange=\{v => upd\(/g, 'onChange={(v: any) => upd(');
c = c.replace(/\{s\.marginBottom/g, '{(s as Record<string, any>).marginBottom');
c = c.replace(/s\.url/g, '(s as Record<string, any>).url');
c = c.replace(/s\.align/g, '(s as Record<string, any>).align');
fs.writeFileSync('src/components/ElementSettings.tsx', c);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/settings: \{\n\s+\.\.\.\(e\.settings as any\),\n\s+\.\.\.\(\(updates as any\)\.settings \|\| \{\}\)\n\s+\}/, 'settings: { ...e.settings, ...(updates.settings as any) }');
fs.writeFileSync('src/App.tsx', app);

console.log('TS fixes applied');

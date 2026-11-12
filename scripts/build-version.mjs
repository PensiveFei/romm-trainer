import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Include chart files as well as the catalog so a chart-only edit cannot
// reuse a cached copy from the preceding deployment.
export async function buildVersion(root) {
  const paths=[];
  async function collect(dir,relative,accept) {
    for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
      const name=relative ? `${relative}/${entry.name}` : entry.name;
      const full=path.join(dir,entry.name);
      if (entry.isDirectory()) await collect(full,name,accept);
      else if (entry.isFile() && accept(name)) paths.push(name);
    }
  }
  await collect(path.join(root,'src'),'src',name=>/\.(js|css)$/.test(name));
  await collect(path.join(root,'data'),'data',name=>/\.json$/.test(name));
  const hash=crypto.createHash('sha256');
  for (const name of paths.sort()) hash.update(name).update(await fs.readFile(path.join(root,...name.split('/'))));
  return hash.digest('hex').slice(0,8);
}

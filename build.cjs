const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
for(const video of require('./videos.json')){
 const data=Buffer.concat(video.parts.map(part=>fs.readFileSync(path.join(__dirname,part))));
 if(crypto.createHash('sha256').update(data).digest('hex')!==video.sha256)throw Error('Video integrity check failed');
 const output=path.join(__dirname,'public',video.output);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,data);
}
console.log('Site ready. Original video bytes verified.');

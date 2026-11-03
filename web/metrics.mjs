export function metrics(a,b,tolerance=0) {
  if(!a.length || a.length!==b.length) throw new Error('Samples must have equal, non-zero lengths');
  if(!Number.isFinite(tolerance)||tolerance<0) throw new Error('Invalid tolerance');
  let max=0,sum=0,changed=0;
  for(let i=0;i<a.length;i++) {
    if(!Number.isFinite(a[i])||!Number.isFinite(b[i])) throw new Error('Non-finite sample');
    const d=Math.abs(a[i]-b[i]); max=Math.max(max,d); sum+=d*d; if(d>tolerance) changed++;
  }
  return {samples:a.length,changed,maxAbsoluteError:max,rmse:Math.sqrt(sum/a.length),tolerance};
}
export function decode64(s) {return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
export function floatsLE(bytes) {
 if(bytes.length%4) throw new Error('Invalid Float32 byte length');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 return Array.from({length:bytes.length/4},(_,i)=>v.getFloat32(i*4,true));
}
export function validate(r) {
 if(r?.schema!==1 || r?.fixture!=='canvas-audio-v1' || !Array.isArray(r.runs)||r.runs.length<1||r.runs.length>10) throw new Error('Unsupported report');
 for(const x of r.runs) {
  if(decode64(x.canvas.bytes).length!==256*128*4 || decode64(x.audio.bytes).length!==16384*4 || x.audio.sampleRate!==44100) throw new Error('Unexpected fixture dimensions');
  floatsLE(decode64(x.audio.bytes)).forEach(v=>{if(!Number.isFinite(v))throw new Error('Non-finite audio');});
 }
 return r;
}

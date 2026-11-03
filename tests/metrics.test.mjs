import {test} from 'node:test';
import assert from 'node:assert/strict';
import {metrics,floatsLE,validate} from '../web/metrics.mjs';
test('numeric differences and tolerance',()=>{
 assert.deepEqual(metrics([0,2],[0,4],1),{samples:2,changed:1,maxAbsoluteError:2,rmse:Math.sqrt(2),tolerance:1});
 assert.equal(metrics([0],[.01],.02).changed,0);
});
test('malformed samples rejected',()=>{
 for(const f of [()=>metrics([],[]),()=>metrics([0],[0,1]),()=>metrics([NaN],[0]),()=>metrics([0],[0],-1),()=>floatsLE(new Uint8Array(3)),()=>validate({schema:2})])assert.throws(f);
});
test('explicit little endian decoding',()=>{assert.deepEqual(floatsLE(new Uint8Array([0,0,128,63])),[1]);});
test('report validation checks dimensions and finite audio',()=>{
 const b64=b=>Buffer.from(b).toString('base64');
 const r={schema:1,fixture:'canvas-audio-v1',runs:[{canvas:{bytes:b64(new Uint8Array(256*128*4))},audio:{bytes:b64(new Uint8Array(16384*4)),sampleRate:44100}}]};
 assert.equal(validate(r),r);
 const truncated=structuredClone(r);truncated.runs[0].canvas.bytes='AA==';assert.throws(()=>validate(truncated));
 const invalid=structuredClone(r), bytes=Buffer.alloc(16384*4);bytes.writeFloatLE(NaN,0);invalid.runs[0].audio.bytes=b64(bytes);assert.throws(()=>validate(invalid));
});

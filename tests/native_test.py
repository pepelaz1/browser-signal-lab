import json, pathlib, struct, subprocess, sys, tempfile
exe = str(pathlib.Path(sys.argv[1]).resolve())
with tempfile.TemporaryDirectory() as d:
    a,b = pathlib.Path(d)/'a', pathlib.Path(d)/'b'
    def run(x,y,*args):
        a.write_bytes(x); b.write_bytes(y)
        return subprocess.run([exe,str(a),str(b),*args],capture_output=True,text=True)
    data=struct.pack('<3f',0,1,-1)
    p=run(data,data); assert p.returncode==0 and json.loads(p.stdout)['changed']==0
    p=run(data,struct.pack('<3f',0,1,1)); r=json.loads(p.stdout)
    assert p.returncode==1 and r['changed']==1 and r['maxAbsoluteError']==2
    assert run(data,struct.pack('<3f',0,1,1),'3').returncode==0
    for x,y in [(b'',b''),(b'x',b'x'),(data,data[:4]),(struct.pack('<f',float('nan')),data[:4])]:
        assert run(x,y).returncode==2
    for arg in ['-1','nan','0.1junk']:
        assert run(data,data,arg).returncode==2
print('Native checks passed: equal, changed, tolerance, malformed input, invalid tolerance')

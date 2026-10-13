// Original procedural character and renderer, authored for Magia Archive.
// No models, textures, shaders or code from Magi3Dviewer are included.
import { lumenMotion, type VisualPolicy } from './visual-policy.ts';
type Part = { at: number[]; scale: number[]; color: number[]; eye?: boolean };
export const lumenParts: Part[] = [
  { at:[0,-.37,0], scale:[.43,.55,.31], color:[.36,.2,.48] },
  { at:[0,.45,0], scale:[.53,.48,.4], color:[.72,.58,.85] },
  { at:[0,.68,-.14], scale:[.57,.4,.33], color:[.23,.14,.34] },
  { at:[-.49,.1,0], scale:[.12,.32,.14], color:[.65,.44,.77] },
  { at:[.49,.1,0], scale:[.12,.32,.14], color:[.65,.44,.77] },
  { at:[-.66,.24,-.22], scale:[.22,.43,.06], color:[.73,.48,.69] },
  { at:[.66,.24,-.22], scale:[.22,.43,.06], color:[.73,.48,.69] },
  { at:[0,-.21,.31], scale:[.105,.14,.035], color:[1,.79,.43] },
  { at:[-.19,.48,.376], scale:[.063,.09,.018], color:[.13,.08,.21], eye:true },
  { at:[.19,.48,.376], scale:[.063,.09,.018], color:[.13,.08,.21], eye:true },
  { at:[-.17,.51,.396], scale:[.018,.025,.008], color:[.98,.95,1], eye:true },
  { at:[.21,.51,.396], scale:[.018,.025,.008], color:[.98,.95,1], eye:true },
  { at:[0,.29,.374], scale:[.055,.017,.008], color:[.47,.21,.36] },
  { at:[-.32,.32,.317], scale:[.067,.026,.01], color:[.89,.46,.65] },
  { at:[.32,.32,.317], scale:[.067,.026,.01], color:[.89,.46,.65] },
  { at:[-.2,-.91,.04], scale:[.14,.12,.16], color:[.22,.12,.33] },
  { at:[.2,-.91,.04], scale:[.14,.12,.16], color:[.22,.12,.33] },
  { at:[0,.96,-.02], scale:[.36,.065,.31], color:[.89,.7,.4] },
  { at:[0,1.14,-.02], scale:[.19,.23,.18], color:[.42,.25,.58] },
];
export function sphereMesh(rings = 10, segments = 14) {
  const values: number[] = [];
  const point = (r: number, s: number) => { const phi = r / rings * Math.PI, theta = s / segments * Math.PI * 2; return [Math.sin(phi)*Math.cos(theta), Math.cos(phi), Math.sin(phi)*Math.sin(theta)]; };
  for (let r=0;r<rings;r++) for(let s=0;s<segments;s++) for(const [a,b] of [[r,s],[r+1,s],[r,s+1],[r,s+1],[r+1,s],[r+1,s+1]]) values.push(...point(a,b));
  return new Float32Array(values);
}
export function mountLumen(canvas: HTMLCanvasElement, policy: VisualPolicy) {
  if (typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  const gl = canvas.getContext('webgl', { alpha:true, antialias:false, powerPreference:'low-power', preserveDrawingBuffer:false });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const shader = (type: number, source: string) => {
    const s=gl.createShader(type); if(!s)throw Error('WEBGL_UNAVAILABLE'); shaders.push(s);
    gl.shaderSource(s,source); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('WEBGL_SHADER'); return s;
  };
  const program = gl.createProgram(), buffer = gl.createBuffer();
  let frame=0,disposed=false,visible=true,paused=false,lost=false,reaction=0,lastFrame=0,elapsed=0,pixelRatio=policy.pixelRatio;
  let width=1,height=1;
  const release = () => { for(const s of shaders)gl.deleteShader(s); if(buffer)gl.deleteBuffer(buffer); if(program)gl.deleteProgram(program); };
  try {
    if(!program||!buffer)throw Error('WEBGL_UNAVAILABLE');
    gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec3 position; uniform vec3 center; uniform vec3 scale; uniform float yaw; uniform float aspect; varying vec3 normal; void main(){vec3 p=position*scale+center; float c=cos(yaw),s=sin(yaw); p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c); normal=normalize(vec3(position.x*c+position.z*s,position.y,-position.x*s+position.z*c)); gl_Position=vec4(p.x*.7/aspect,p.y*.7,-p.z*.2,1.0);}'));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, 'precision mediump float; uniform vec3 color; varying vec3 normal; void main(){float light=dot(normalize(normal),normalize(vec3(-.4,.7,1.0))); float band=light>.6?1.0:light>.1?.86:.66; gl_FragColor=vec4(color*band,1.0);}'));
    gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WEBGL_PROGRAM');
    gl.useProgram(program); const mesh=sphereMesh(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['center','scale','color','yaw','aspect'].map(n=>[n,gl.getUniformLocation(program,n)]));
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0,0,0,0);
    const draw=()=>{
      if(disposed||lost)return;
      const start=performance.now(),m=lumenMotion(policy.motion?elapsed:0,reaction);
      gl.viewport(0,0,width,height); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.uniform1f(uniforms.aspect,width/height); gl.uniform1f(uniforms.yaw,m.yaw);
      for(const part of lumenParts){ gl.uniform3f(uniforms.center,part.at[0],part.at[1]+m.bob,part.at[2]); gl.uniform3f(uniforms.scale,part.scale[0],part.scale[1]*(part.eye?m.eyes:m.breathe),part.scale[2]); gl.uniform3fv(uniforms.color,part.color); gl.drawArrays(gl.TRIANGLES,0,mesh.length/3); }
      reaction*=.95;
      if(performance.now()-start>18&&pixelRatio>1){pixelRatio=1;resize();}
    };
    const resize=()=>{const rect=canvas.getBoundingClientRect();width=Math.max(1,Math.round(rect.width*Math.min(window.devicePixelRatio||1,pixelRatio)));height=Math.max(1,Math.round(rect.height*Math.min(window.devicePixelRatio||1,pixelRatio)));canvas.width=width;canvas.height=height;draw();};
    const loop=(now:number)=>{frame=0;if(disposed||lost||paused||!visible||document.hidden||!policy.motion)return;if(now-lastFrame>=1000/policy.fps){elapsed+=lastFrame?Math.min((now-lastFrame)/1000,.08):0;lastFrame=now;draw();}frame=requestAnimationFrame(loop);};
    const stop=()=>{cancelAnimationFrame(frame);frame=0;lastFrame=0;};
    const resume=()=>{stop();if(!disposed&&!lost&&!paused&&visible&&!document.hidden&&policy.motion)frame=requestAnimationFrame(loop);};
    const visibility=()=>resume();
    const onLost=(event:Event)=>{event.preventDefault();lost=true;stop();canvas.dataset.unavailable='true';};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;resume();});intersection.observe(canvas);
    canvas.addEventListener('webglcontextlost',onLost);document.addEventListener('visibilitychange',visibility);resume();
    return { greet(){if(policy.motion){reaction=1;if(!frame)draw();}},setPaused(value:boolean){paused=value;resume();},dispose(){if(disposed)return;disposed=true;stop();observer.disconnect();intersection.disconnect();canvas.removeEventListener('webglcontextlost',onLost);document.removeEventListener('visibilitychange',visibility);release();} };
  } catch { disposed=true;release();return null; }
}

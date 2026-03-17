"use client";

/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import * as THREE from "three";

// ── Vertex shader ──────────────────────────────────────────────────────────
const waveVert = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

// ── Wave fragment shader (Perlin fbm) ─────────────────────────────────────
const waveFrag = `
precision highp float;
uniform vec2  resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3  waveColor;

vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec2 fade(vec2 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec2 P){
  vec4 Pi=floor(P.xyxy)+vec4(0.,0.,1.,1.);
  vec4 Pf=fract(P.xyxy)-vec4(0.,0.,1.,1.);
  Pi=mod289(Pi);
  vec4 ix=Pi.xzxz,iy=Pi.yyww,fx=Pf.xzxz,fy=Pf.yyww;
  vec4 i=permute(permute(ix)+iy);
  vec4 gx=fract(i*(1./41.))*2.-1.;
  vec4 gy=abs(gx)-.5;
  vec4 tx=floor(gx+.5);
  gx=gx-tx;
  vec2 g00=vec2(gx.x,gy.x),g10=vec2(gx.y,gy.y),g01=vec2(gx.z,gy.z),g11=vec2(gx.w,gy.w);
  vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x;g01*=norm.y;g10*=norm.z;g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x));
  float n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z));
  float n11=dot(g11,vec2(fx.w,fy.w));
  vec2 fade_xy=fade(Pf.xy);
  vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
  return 2.3*mix(n_x.x,n_x.y,fade_xy.y);
}

const int OCTAVES=4;
float fbm(vec2 p){
  float v=0.,a=1.,f=waveFrequency;
  for(int i=0;i<OCTAVES;i++){v+=a*abs(cnoise(p));p*=f;a*=waveAmplitude;}
  return v;
}
float pattern(vec2 p){
  vec2 p2=p-time*waveSpeed;
  return fbm(p+fbm(p2));
}

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  uv-=.5;
  uv.x*=resolution.x/resolution.y;
  float f=pattern(uv);
  vec3 col=mix(vec3(0.),waveColor,f);
  gl_FragColor=vec4(col,1.);
}
`;

// ── Bayer 8×8 dither post-process effect ──────────────────────────────────
const ditherFrag = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;
const float bayerMatrix8x8[64]=float[64](
   0./64.,48./64.,12./64.,60./64., 3./64.,51./64.,15./64.,63./64.,
  32./64.,16./64.,44./64.,28./64.,35./64.,19./64.,47./64.,31./64.,
   8./64.,56./64., 4./64.,52./64.,11./64.,59./64., 7./64.,55./64.,
  40./64.,24./64.,36./64.,20./64.,43./64.,27./64.,39./64.,23./64.,
   2./64.,50./64.,14./64.,62./64., 1./64.,49./64.,13./64.,61./64.,
  34./64.,18./64.,46./64.,30./64.,33./64.,17./64.,45./64.,29./64.,
  10./64.,58./64., 6./64.,54./64., 9./64.,57./64., 5./64.,53./64.,
  42./64.,26./64.,38./64.,22./64.,41./64.,25./64.,37./64.,21./64.
);
vec3 dither(vec2 uv,vec3 color){
  vec2 sc=floor(uv*resolution/pixelSize);
  int x=int(mod(sc.x,8.));
  int y=int(mod(sc.y,8.));
  float thr=bayerMatrix8x8[y*8+x]-.25;
  float step=1./(colorNum-1.);
  color+=thr*step;
  float bias=0.2;
  color=clamp(color-bias,0.,1.);
  return floor(color*(colorNum-1.)+.5)/(colorNum-1.);
}
void mainImage(in vec4 inputColor,in vec2 uv,out vec4 outputColor){
  vec2 nps=pixelSize/resolution;
  vec2 uvp=nps*floor(uv/nps);
  vec4 color=texture2D(inputBuffer,uvp);
  color.rgb=dither(uv,color.rgb);
  outputColor=color;
}
`;

// ── Postprocessing effect class ────────────────────────────────────────────
class DitherEffectImpl extends Effect {
  private _u: Map<string, THREE.Uniform>;
  constructor() {
    const u = new Map([
      ["colorNum",  new THREE.Uniform(4.0)],
      ["pixelSize", new THREE.Uniform(2.0)],
    ]);
    super("DitherEffect", ditherFrag, { uniforms: u });
    this._u = u;
  }
  set colorNum(v: number)  { this._u.get("colorNum")!.value  = v; }
  get colorNum()           { return this._u.get("colorNum")!.value;  }
  set pixelSize(v: number) { this._u.get("pixelSize")!.value = v; }
  get pixelSize()          { return this._u.get("pixelSize")!.value; }
}

const WrappedDither = wrapEffect(DitherEffectImpl);

const DitherEffect = forwardRef<unknown, { colorNum: number; pixelSize: number }>(
  ({ colorNum, pixelSize }, ref) => (
    <WrappedDither ref={ref} colorNum={colorNum} pixelSize={pixelSize} />
  )
);
DitherEffect.displayName = "DitherEffect";

// ── Inner scene ───────────────────────────────────────────────────────────
interface WaveProps {
  waveSpeed: number;
  waveFrequency: number;
  waveAmplitude: number;
  waveColor: [number, number, number];
  colorNum: number;
  pixelSize: number;
}

function DitheredWaves({ waveSpeed, waveFrequency, waveAmplitude, waveColor, colorNum, pixelSize }: WaveProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, size, gl } = useThree();

  const uniforms = useRef({
    time:          new THREE.Uniform(0),
    resolution:    new THREE.Uniform(new THREE.Vector2()),
    waveSpeed:     new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    waveColor:     new THREE.Uniform(new THREE.Color(...waveColor)),
  });

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    uniforms.current.resolution.value.set(
      Math.floor(size.width * dpr),
      Math.floor(size.height * dpr)
    );
  }, [size, gl]);

  useFrame(({ clock }) => {
    uniforms.current.time.value = clock.getElapsedTime();
    uniforms.current.waveSpeed.value     = waveSpeed;
    uniforms.current.waveFrequency.value = waveFrequency;
    uniforms.current.waveAmplitude.value = waveAmplitude;
    uniforms.current.waveColor.value.set(...waveColor);
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVert}
          fragmentShader={waveFrag}
          uniforms={uniforms.current}
        />
      </mesh>
      <EffectComposer>
        <DitherEffect colorNum={colorNum} pixelSize={pixelSize} />
      </EffectComposer>
    </>
  );
}

// ── Public component ───────────────────────────────────────────────────────
interface DitherBgProps {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: [number, number, number];
  colorNum?: number;
  pixelSize?: number;
  className?: string;
}

export default function DitherBg({
  waveSpeed     = 0.018,
  waveFrequency = 2.2,
  waveAmplitude = 0.28,
  waveColor     = [0.52, 0.24, 0.07],
  colorNum      = 3,
  pixelSize     = 6,
  className     = "",
}: DitherBgProps) {
  return (
    <Canvas
      className={`!w-full !h-full ${className}`}
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: false, preserveDrawingBuffer: false }}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
      />
    </Canvas>
  );
}

import { seedTraits } from './worlds.js';

export const CAMERAS=['drift','forward','rise','orbit','zoom','crane','random','glide'];
export const WORLD_COUNT=12;
const MAX_MOTES=32;
const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time,u_seed,u_speed,u_grain,u_intensity,u_travel,u_moteStrength;
uniform int u_palette,u_camera,u_moteCount;
const int u_world=__WORLD__;
uniform vec2 u_mouse;
uniform vec4 u_audio,u_traits;
uniform vec4 u_mote[32],u_mote2[32];
const float PI=3.14159265;
float seed;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=rot(.53)*p*2.05;a*=.5;}return v;}
float hex(vec2 p){p=abs(p);return max(p.x*.8660254+p.y*.5,p.y);}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float dune(vec2 p){p*=mix(.72,1.28,u_traits.x);float h=sin(p.x*.30+sin(p.y*.16)*2.)*1.05+sin(p.y*.29+p.x*.11)*.52;return h+fbm(p*.3)*.26;}
float ellipsoid(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/max(k1,.0001);}
float torus(vec3 p,vec2 r){return length(vec2(length(p.xz)-r.x,p.y))-r.y;}
vec2 nearest(vec2 a,vec2 b){return a.x<b.x?a:b;}
float mirrorSlabs(vec3 p){
  float g=u_traits.x,d=1e3;
  float cell=floor(max(-p.z,0.)/30.),lz=-mod(max(-p.z,0.),30.),later=step(.5,cell);
  for(int i=0;i<3;i++){
    float fi=float(i),rnd=hash(vec2(cell+fi*3.,31.));
    vec3 center=mix(vec3((fi-1.)*5.2,.6+rnd*1.2+g*.4,-6.-fi*8.),vec3(mix(-7.,7.,hash(vec2(cell,fi+1.))),.6+rnd*1.3+g*.4,-6.-fi*8.-hash(vec2(cell,fi+9.))*3.),later);
    vec3 q=vec3(p.x,p.y,lz)-center;q.xz=rot(rnd*3.+u_traits.w)*q.xz;
    float slab=box(q,vec3(.9+rnd*1.1,.06+rnd*.05,.35+rnd*.5))-.03;
    slab+=later*step(hash(vec2(cell,fi+17.)),.3)*6.;
    d=min(d,slab);
  }
  return d;
}

vec2 map(vec3 p){
  float g=u_traits.x;
  if(u_world==0){
    float ground=p.y+1.35+fbm(p.xz*.22)*.3;
    float spacing=mix(6.1,4.0,g);
    vec2 cell=floor((p.xz+spacing*.5)/spacing);
    vec2 q=mod(p.xz+spacing*.5,spacing)-spacing*.5;
    float rnd=hash(cell+vec2(3,7));
    q-=vec2(hash(cell),hash(cell+2.))*.9-.45;
    q=rot(rnd*2.)*q;
    float h=.9+pow(rnd,1.3)*mix(3.2,6.7,g);
    float radius=.36+rnd*.46;
    float crystal=max(hex(q)-radius+max(p.y+.7,0.)*.075,max(-p.y-1.35,p.y-h+q.x*.58));
    vec2 q2=q-vec2(radius*.84,.2);
    float bud=max(hex(rot(.6)*q2)-radius*.54+max(p.y,0.)*.11,max(-p.y-1.35,p.y-h*.46-q2.x*.9));
    crystal=min(crystal,bud);
    crystal=max(crystal,2.1-abs(p.x));
    if(rnd<mix(.34,.13,g))crystal+=4.;
    return ground<crystal?vec2(ground,1):vec2(crystal,2.+rnd);
  }
  if(u_world==1){
    float waves=sin(p.x*.7+u_time*.22)*.035+sin(p.z*1.2-u_time*.32)*.025+noise(p.xz*2.+u_time*.06)*.032;
    vec2 result=vec2(p.y+.65-waves,3);
    float cell=floor(max(-p.z,0.)/36.),lz=-mod(max(-p.z,0.),36.),later=step(.5,cell);
    float rnd=hash(vec2(cell,17.));
    for(int i=0;i<3;i++){
      float fi=float(i),side=(i==1?1.:-1.)*mix(1.,rnd<.5?-1.:1.,later);
      float jitter=later*(hash(vec2(cell,fi))*3.-1.5);
      vec3 q=vec3(p.x,p.y,lz)-vec3(side*(4.+fi*2.+u_traits.w+jitter),-.1,-11.-fi*8.);q.xz=rot(.2+u_traits.w*.5+later*rnd)*q.xz;
      float radius=mix(.85,1.8,g)*(1.-fi*.13)*(1.+later*(hash(vec2(cell,fi+5.))-.5)*.5),height=mix(1.3,3.1,g)*(1.+later*(hash(vec2(cell+3.,fi))-.5)*.6);
      float island=max(hex(q.xz)-radius+max(q.y,0.)*.12,max(-q.y-1.7,q.y-height+q.x*.35));
      island+=later*step(hash(vec2(cell,fi+11.)),.25)*6.;
      result=nearest(result,vec2(island,4));
    }
    return result;
  }
  if(u_world==2){
    float size=mix(2.15,3.2,g);
    vec3 q=(p-vec3(0.,.7,-2.5))*(2.7/size);q.xz=rot(.2+u_time*.018+u_traits.w*.65)*q.xz;q.xy=rot(.08+u_traits.w*.16)*q.xy;
    float b=box(q,vec3(2.7));
    float scale=1.;
    for(int i=0;i<4;i++){
      vec3 a=mod(q*scale,2.)-1.;scale*=3.;
      vec3 r=abs(1.-3.*abs(a));
      float c=(min(max(r.x,r.y),min(max(r.y,r.z),max(r.z,r.x)))-1.)/scale;
      b=max(b,c);
    }
    b*=size/2.7;float ground=p.y+3.7;
    return ground<b?vec2(ground,1):vec2(b,5);
  }
  if(u_world==3){
    vec2 result=vec2(p.y+1.8-dune(p.xz+u_traits.w*6.),6);
    float cell=floor(max(-p.z,0.)/32.),lz=-mod(max(-p.z,0.),32.),later=step(.5,cell);
    for(int i=0;i<3;i++){
      float fi=float(i),jx=later*(hash(vec2(cell,fi+2.))*5.-2.5),jh=1.+later*(hash(vec2(cell+1.,fi))-.5)*.7;
      vec3 q=vec3(p.x,p.y,lz)-vec3(1.7-fi*3.4+u_traits.w+jx,-.1,-5.5-fi*7.);q.xz=rot(.25+u_traits.w*.4+later*fi)*q.xz;
      float monolith=box(q,vec3(.15+g*.13,(1.15+g*1.2+fi*.25)*jh,.21));
      monolith+=later*step(hash(vec2(cell,fi+9.)),.3)*6.;
      result=nearest(result,vec2(monolith,7));
    }
    return result;
  }
  if(u_world==4){
    float ground=p.y+1.45+noise(p.xz*.38)*.22,spacing=mix(7.2,5.1,g);
    vec2 cell=floor((p.xz+spacing*.5)/spacing),q=mod(p.xz+spacing*.5,spacing)-spacing*.5;
    float rnd=hash(cell+vec2(5,19));q-=vec2(hash(cell+4.),hash(cell+9.))*.9-.45;
    float height=1.6+rnd*mix(2.6,5.1,g),radius=.8+rnd*1.15;
    float stem=max(length(q)-(.12+rnd*.17),max(-p.y-1.45,p.y-height));
    float cap=ellipsoid(vec3(q.x,p.y-height,q.y),vec3(radius,.42+rnd*.2,radius));cap=max(cap,height-.16-p.y);
    stem=max(stem,2.35-abs(p.x));cap=max(cap,2.35-abs(p.x));
    vec2 object=stem<cap?vec2(stem,8):vec2(cap,9);
    return ground<object.x?vec2(ground,1):object;
  }
  if(u_world==5){
    vec2 result=vec2(p.y+1.65+sin(p.x*.22)*.1+noise(p.xz*.27)*.13,10);
    float cell=floor(max(-p.z,0.)/36.),lz=-mod(max(-p.z,0.),36.),later=step(.5,cell);
    for(int i=0;i<3;i++){
      float fi=float(i),radius=mix(2.5,4.,g)*(1.-fi*.12)*(1.+later*(hash(vec2(cell,fi+4.))-.5)*.5);
      float flip=mix(1.,hash(vec2(cell,fi+8.))<.5?-1.:1.,later);
      vec3 q=vec3(p.x,p.y,lz)-vec3(flip*(i==1?-6.4:i==2?7.7:0.)+later*(hash(vec2(cell,fi+1.))*4.-2.),.35+g*.6,-5.-fi*9.);q.xz=rot((u_traits.w-.5)*.65+fi*.35)*q.xz;
      float arch=length(vec2(length(q.xy)-radius,q.z))-mix(.38,.65,g);
      arch+=later*step(hash(vec2(cell,fi+14.)),.2)*6.;
      result=nearest(result,vec2(arch,11));
    }
    return result;
  }
  if(u_world==6){
    vec2 result=vec2(p.y+8.,12);
    for(int i=0;i<4;i++){
      float fi=float(i),angle=fi*2.4+u_traits.w*.6;
      vec3 center=vec3(sin(angle)*fi*mix(3.6,5.3,g),1.7+sin(fi*2.)*1.1,-8.+cos(angle)*fi*3.1);
      vec3 q=p-center;float size=(1.-fi*.13)*mix(2.7,3.8,g);q.xz=rot(fi*.6+u_traits.w)*q.xz;
      float stone=ellipsoid(q,vec3(size,1.1+g*.7,size*.75))+(noise(q.xz*.8)-.5)*.10;
      result=nearest(result,vec2(stone,13.+step(.45,q.y)));
    }
    vec3 q=p-vec3(0.,3.7,-8.);q.xy=rot(.12+u_traits.w*.15)*q.xy;
    return nearest(result,vec2(torus(q,vec2(mix(5.0,6.1,g),.11)),15));
  }
  if(u_world==8){
    vec2 flow=vec2(u_time*.012,0.);
    float bank=noise(p.xz*.14+flow)*1.25+noise(rot(.6)*p.xz*.31+flow*1.6)*.75+noise(rot(1.1)*p.xz*.66+flow*3.)*.35;
    vec2 result=vec2(p.y+1.55-bank*(.5+g*.5),20);
    float cell=floor(max(-p.z,0.)/40.),lz=-mod(max(-p.z,0.),40.),later=step(.5,cell);
    for(int i=0;i<2;i++){
      float fi=float(i),rnd=hash(vec2(cell+fi*7.,23.));
      vec3 center=mix(vec3(i==0?-6.5+g*3.:7.5,-1.5,i==0?-18.:-31.),vec3(mix(-9.,9.,hash(vec2(cell,fi+5.))),-1.5,-mix(8.,34.,hash(vec2(cell,fi+13.)))),later);
      vec3 q=vec3(p.x,p.y,lz)-center;
      float h=mix(3.6,6.6,mix(g,rnd,later))*(.8+.35*g);
      float tt=clamp((q.y+1.5)/(h+1.5),0.,1.);
      float r=(2.2*pow(1.-tt,1.2)+.13)*(1.+.2*sin(q.y*2.7+rnd*6.)*(1.-tt));
      float spire=max(length(q.xz)-r,max(-q.y-1.5,q.y-h));
      if(spire<1.5)spire+=(fbm(q.xz*.8+q.y*.5+rnd*9.)-.5)*(.15+.75*(1.-tt))*(1.-smoothstep(.75,1.,tt));
      spire+=later*step(hash(vec2(cell,fi+17.)),.25)*8.;
      result=nearest(result,vec2(spire,21));
    }
    return result;
  }
  if(u_world==9){
    float ripple=(sin(p.x*3.1+u_time*.4)+sin(p.z*2.3-u_time*.3))*.003*(1.+u_audio.w*u_intensity*4.);
    return nearest(vec2(p.y+.9-ripple,30),vec2(mirrorSlabs(p),31));
  }
  if(u_world==10){
    float ground=p.y+1.5+noise(p.xz*.3)*.08,spacing=mix(6.4,4.6,g);
    vec2 cell=floor((p.xz+spacing*.5)/spacing),q=mod(p.xz+spacing*.5,spacing)-spacing*.5;
    float rnd=hash(cell+vec2(9,31));q-=vec2(hash(cell+2.),hash(cell+7.))*1.2-.6;
    float height=3.5+rnd*mix(4.,8.5,g),radius=.18+rnd*.32;
    float column=max(length(q)-radius,max(-p.y-1.5,p.y-height));column=max(column,2.-abs(p.x));
    column+=step(rnd,mix(.28,.08,g))*4.;
    return ground<column?vec2(ground,32):vec2(column,33);
  }
  if(u_world==11){
    vec3 q=p-vec3(0.,.7,-4.);
    vec2 result=vec2(length(q)-mix(.55,.8,g),50);
    for(int i=0;i<4;i++){
      float fi=float(i),R=mix(1.25,1.6,g)+fi*mix(.55,.75,g),spin=u_time*.03*(1.+fi*.4)*(i%2==0?1.:-1.);
      vec3 r=q;r.xy=rot(.35+fi*.42+u_traits.w*.6)*r.xy;r.xz=rot(spin)*r.xz;
      result=nearest(result,vec2(length(vec2(length(r.xz)-R,r.y))-(.02+.008*fi),51));
      float a=u_time*.08/(1.+fi*.5)+fi*1.9+u_traits.y*6.;
      result=nearest(result,vec2(length(r-vec3(cos(a)*R,0.,sin(a)*R))-(.06+.022*fi),52));
    }
    return result;
  }
  float ridge=dune(p.xz*.8)*.65+noise(p.xz*.22)*.48;
  vec2 result=vec2(p.y+1.7-ridge,16);
  float spacing=mix(7.1,5.1,g);vec2 cell=floor((p.xz+spacing*.5)/spacing),q=mod(p.xz+spacing*.5,spacing)-spacing*.5;
  float rnd=hash(cell+vec2(13,8)),height=.5+rnd*(2.+g*2.2);
  float column=max(hex(rot(rnd)*q)-(.45+rnd*.36),max(-p.y-1.65,p.y-height));column=max(column,2.8-abs(p.x));
  return nearest(result,vec2(column,17));
}

vec3 normal(vec3 p,float t){float e=max(.001,.00016*t);vec2 k=vec2(1.,-1.);return normalize(k.xyy*map(p+k.xyy*e).x+k.yyx*map(p+k.yyx*e).x+k.yxy*map(p+k.yxy*e).x+k.xxx*map(p+k.xxx*e).x);}
float ao(vec3 p,vec3 n){float occ=0.,s=1.;for(int i=1;i<=4;i++){float h=.07*float(i);occ+=(h-map(p+n*h).x)*s;s*=.55;}return clamp(1.-2.2*occ,.25,1.);}
float shadow(vec3 p,vec3 l){float r=1.,t=.07;for(int i=0;i<14;i++){float h=map(p+l*t).x;r=min(r,12.*h/t);t+=clamp(h,.06,.7);if(r<.08)break;}return clamp(r,.18,1.);}

vec3 sky(vec3 rd,vec3 ro){
  vec3 low,high;vec3 c;
  if(u_world==0){low=vec3(.72,.76,.59);high=vec3(.14,.38,.38);}
  else if(u_world==1){low=vec3(.61,.43,.29);high=vec3(.055,.12,.19);}
  else if(u_world==2){low=vec3(.26,.18,.24);high=vec3(.035,.075,.11);}
  else if(u_world==3){low=vec3(.83,.48,.23);high=vec3(.18,.22,.23);}
  else if(u_world==4){low=vec3(.28,.38,.32);high=vec3(.045,.105,.15);}
  else if(u_world==5){low=vec3(.58,.70,.72);high=vec3(.075,.20,.29);}
  else if(u_world==6){low=vec3(.67,.58,.46);high=vec3(.18,.30,.35);}
  else if(u_world==8){low=vec3(.95,.66,.56);high=vec3(.14,.22,.42);}
  else if(u_world==9){low=vec3(.94,.91,.85);high=vec3(.28,.48,.66);}
  else if(u_world==10){low=vec3(.62,.70,.66);high=vec3(.22,.32,.34);}
  else if(u_world==11){low=vec3(.05,.06,.11);high=vec3(.01,.013,.035);}
  else{low=vec3(.53,.26,.22);high=vec3(.07,.075,.13);}
  vec3 tone=mix(vec3(.83,1.02,1.1),vec3(1.12,.96,.81),u_traits.z);low*=tone;high*=tone;
  c=mix(low,high,smoothstep(-.09,.85,rd.y));
  float cloud=fbm(rd.xz/(abs(rd.y)+.3)*2.+u_time*.012);
  c+=smoothstep(mix(.58,.39,u_traits.y),.82,cloud)*mix(.055,.17,u_traits.y)*smoothstep(0.,.5,rd.y);
  vec3 sun=normalize(u_world==3?vec3(mix(-.35,.14,u_traits.y),.08+u_traits.y*.045,-1.):u_world==8?vec3(-.28,.07,-1.):u_world==9?vec3(-.4,.62,-.66):u_world==10?vec3(-.5,.3,-1.):vec3(-.6+u_traits.z*.3,.48,-.8));
  float sd=dot(rd,sun);c+=vec3(.9,.56,.27)*pow(max(sd,0.),12.)*.18;
  if(u_world==3){
    float disk=1.-smoothstep(.031,.034,length(rd-sun));
    float eclipse=1.-smoothstep(.024,.026,length(rd-normalize(sun+vec3(.009,.002,0))));
    c=mix(c,vec3(2.1,1.5,.67),disk);c=mix(c,vec3(.10,.14,.15),eclipse*disk);
    c+=vec3(1.,.5,.17)*exp(-length(rd-sun)*17.)*.16;
  }
  vec3 moonDir=normalize(vec3(mix(-.30,.29,u_traits.y),.11+u_traits.y*.13,-1.));
  if(u_world==0||u_world==1||u_world==4||u_world==6||u_world==7){
    float size=(u_world==1?.13:.07)+u_traits.y*.045;
    vec3 dif=rd-moonDir;float d=length(dif);
    float mask=1.-smoothstep(size-.002,size,d);
    vec3 mn=normalize(vec3(dif.xy/size,sqrt(max(.0001,1.-d*d/(size*size)))));
    float band=sin((mn.y+mn.x*.15)*45.+fbm(mn.xy*8.)*5.)*.045;
    vec3 mc=mix(vec3(.28,.37,.35),vec3(.84,.79,.61),clamp(dot(mn,normalize(vec3(-1.,.7,1.)))*.5+.5,0.,1.))+band;
    c=mix(c,mc,mask*(u_world==0?.55:1.));
    if(u_world==1){
      vec2 ring=rot(-.38+u_traits.w*.4)*dif.xy;float ell=length(ring/vec2(size*1.9,size*.32));
      float rings=(1.-smoothstep(.98,1.,ell))*smoothstep(.66,.69,ell);
      float stripe=.60+.25*sin(ell*150.);
      float front=step(ring.y,0.);rings*=max(1.-mask,front);
      c=mix(c,vec3(.76,.65,.45)*stripe,rings*.8);
    }
    if(u_traits.y>.62){
      vec3 smallDir=normalize(vec3(-moonDir.x-.18,.32+u_traits.w*.06,-1.));
      float smallMask=1.-smoothstep(.026,.028,length(rd-smallDir));c=mix(c,vec3(.64,.66,.57),smallMask*.8);
    }
  }
  if(u_world==2||u_world==4||u_world==6||u_world==7||u_world==11){
    vec2 sp=rd.xz/(abs(rd.y)+.3)*100.,sc=floor(sp),sf=fract(sp)-.5;
    float star=pow(hash(sc),80.)*smoothstep(.22,.0,length(sf-(vec2(hash(sc+7.1),hash(sc+3.3))*.5-.25)));
    c+=star*2.2*smoothstep(.08,.3,rd.y);
    c+=vec3(.12,.22,.22)*pow(max(0.,1.-abs(rd.x+rd.y*.3)),20.)*fbm(rd.xz*7.);
  }
  if(u_world==5){
    float curtain=sin(rd.x*12.+sin(rd.z*8.+u_time*.018)*2.+u_traits.w*4.);
    float aurora=exp(-pow((rd.y-.36-curtain*.045)*12.,2.))*smoothstep(.0,.3,rd.y);
    c+=mix(vec3(.08,.31,.20),vec3(.19,.16,.32),u_traits.y)*aurora*.6;
  }
  if(u_world==8){
    float s8=max(dot(rd,sun),0.);
    c+=vec3(1.,.55,.32)*(pow(s8,5.)*.5+pow(s8,90.)*1.4);
    c+=vec3(1.,.8,.7)*smoothstep(.55,.9,fbm(vec2(rd.x*2.2,rd.y*14.)+3.))*.16*smoothstep(.04,.4,rd.y);
  }
  if(u_world==9){
    float s9=max(dot(rd,sun),0.);
    c+=vec3(1.,.95,.85)*pow(s9,60.)*.55;
    c+=vec3(.9,.95,1.)*smoothstep(.5,.85,fbm(vec2(rd.x*1.6,rd.y*9.)+7.))*.12*smoothstep(.02,.5,rd.y);
  }
  if(u_world==10){float s10=max(dot(rd,sun),0.);c+=vec3(.9,.95,.88)*(pow(s10,8.)*.25+pow(s10,120.)*.7);}
  if(u_world==11)c+=vec3(.08,.10,.18)*pow(max(0.,1.-abs(rd.x*.7+rd.y*.5+.15)),14.)*fbm(rd.xz*5.+rd.y*3.)*1.4;
  return c;
}

void cameraMode(int mode,float t,vec2 m,out vec3 ro,out vec3 ta,out float lens){
  float drift=sin(t*.065+u_traits.w*6.28),offset=(u_traits.w-.5)*.55;lens=1.65;
  if(u_world==0){ro=vec3(.35+drift*.42+m.x+offset,1.25+m.y,7.7+sin(t*.04)*.5);ta=vec3(-.2,1.0,-6.);}
  else if(u_world==1){ro=vec3(drift*.5+m.x,.48+m.y,5.5);ta=vec3(.1,.6,-10.);}
  else if(u_world==2){ro=vec3(5.9+drift*.8+m.x,2.8+m.y,8.);ta=vec3(0.,.6,-2.5);}
  else if(u_world==3){ro=vec3(3.2+drift*.7+m.x,2.7+m.y,9.);ta=vec3(-.4,.7,-8.);}
  else if(u_world==4){ro=vec3(drift*.45+m.x+offset,1.15+m.y,8.);ta=vec3(0.,1.8,-9.);}
  else if(u_world==5){ro=vec3(5.5+drift*.6+m.x,2.35+m.y,10.);ta=vec3(0.,.65,-5.);}
  else if(u_world==6){ro=vec3(8.5+drift*.7+m.x,5.2+m.y,12.5);ta=vec3(0.,1.2,-8.);}
  else if(u_world==8){ro=vec3(drift*.5+m.x,1.9+m.y,6.);ta=vec3(0.,-.15,-14.);}
  else if(u_world==9){ro=vec3(drift*.6+m.x,-.42+m.y*.5,6.);ta=vec3(0.,.25,-12.);}
  else if(u_world==10){ro=vec3(drift*.45+m.x+offset,.9+m.y,8.);ta=vec3(0.,2.1,-10.);}
  else if(u_world==11){ro=vec3(drift*.6+m.x,2.9+m.y,9.4);ta=vec3(0.,.7,-4.);}
  else{ro=vec3(drift*.6+m.x+offset,2.5+m.y,9.5);ta=vec3(-.5,.45,-9.);}
  if(u_world!=0&&u_world!=4&&u_world!=7&&u_world!=10)ro.x+=offset;
  float flow=.5-.5*cos(t*.05),side=sin(t*.035);vec3 forward=normalize(ta-ro);
  if(mode==7){
    // Glide: a continuous, patient drift forward. Solid subjects are circled instead.
    if(u_world==2||u_world==6||u_world==11){vec2 around=rot(t*.03)*(ro.xz-ta.xz);ro.xz=ta.xz+around;ro.y+=sin(t*.03)*.5;}
    else{ro.z-=u_travel;ta.z-=u_travel;ro.x+=sin(u_travel*.045)*.45;ro.y+=sin(u_travel*.031)*.1;ta.x+=sin(u_travel*.038)*.9;}
  }else if(mode==1){
    float travel=u_world==2?2.6:u_world==6?4.2:3.6;ro+=forward*flow*travel;ta+=forward*flow*.3;
  }else if(mode==2){
    ro+=vec3(side*.45,flow*3.5,-flow*1.9);ta.y+=flow*.55;
  }else if(mode==3){
    if(u_world==2||u_world==6||u_world==11){vec2 around=rot(t*.035)*(ro.xz-ta.xz);ro.xz=ta.xz+around;ro.y+=sin(t*.035)*.7;}
    else{ro.x+=side*.48;ro.z+=cos(t*.035)*.6;ta.x+=sin(t*.035)*1.6;}
  }else if(mode==4){lens=mix(1.65,2.45,flow);ro-=forward*flow*.45;}
  else if(mode==5){ro+=vec3(side*.65,flow*2.6,-flow*1.35);ta+=vec3(-side*.4,flow*.25,0.);}
  if(u_world==0||u_world==4||u_world==7||u_world==10){float edge=u_world==0?1.75:u_world==4?1.95:u_world==10?1.55:2.35;ro.x=edge*ro.x/sqrt(edge*edge+ro.x*ro.x);}
  if(u_world==1)ro.y=max(ro.y,.17);
}

int randomCameraMode(float slot){
  // Alternating groups guarantee a new choice at each stop, without mutable state.
  return int(floor(hash(vec2(slot,91.))*3.)+3.*mod(slot,2.));
}

float cameraPolarAngle(int mode,float t,vec2 position){
  float angle=atan(position.y,position.x);
  // Unwrap the orbit's angle so it stays continuous through atan's ±PI seam.
  if(mode==3)angle+=2.*PI*floor((1.2-t*.035-angle)/(2.*PI)+.5);
  return angle;
}

void camera(float t,vec2 m,out vec3 ro,out vec3 ta,out float lens){
  if(u_camera!=6){cameraMode(u_camera,t,m,ro,ta,lens);return;}
  // Use the unscaled transport: each seeded stop lasts 20–40 real-time seconds.
  float interval=mix(20.,40.,u_traits.w),journey=max(0.,u_time)/interval;
  float slot=floor(journey),blend=smoothstep(.15,.85,fract(journey));
  int fromMode=randomCameraMode(slot),toMode=randomCameraMode(slot+1.);
  vec3 fromRo,fromTa,toRo,toTa;float fromLens,toLens;
  cameraMode(fromMode,t,m,fromRo,fromTa,fromLens);
  cameraMode(toMode,t,m,toRo,toTa,toLens);
  ro=mix(fromRo,toRo,blend);ta=mix(fromTa,toTa,blend);lens=mix(fromLens,toLens,blend);
  if(u_world==2||u_world==6||u_world==11){
    // Follow a circular arc around solid subjects, never the chord through them.
    vec2 focus=u_world==2?vec2(0.,-2.5):u_world==11?vec2(0.,-4.):vec2(0.,-8.);
    vec2 a=fromRo.xz-focus,b=toRo.xz-focus;
    float fromAngle=cameraPolarAngle(fromMode,t,a),toAngle=cameraPolarAngle(toMode,t,b);
    // Choose one winding at the start of this interval and keep it throughout.
    float startPhase=slot*interval*(.2+u_speed*1.5)*.035;
    float anchorFrom=fromMode==3?1.2-startPhase:1.2,anchorTo=toMode==3?1.2-startPhase:1.2;
    toAngle+=2.*PI*floor((anchorFrom-anchorTo)/(2.*PI)+.5);
    float radius=mix(length(a),length(b),blend);
    float angle=mix(fromAngle,toAngle,blend);ro.xz=focus+vec2(cos(angle),sin(angle))*radius;
  }
}

void main(){
  seed=u_seed;
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
  float t=u_time*(.2+u_speed*1.5),lens;vec3 ro,ta;camera(t,u_mouse*vec2(.55,.27),ro,ta,lens);
  vec3 ww=normalize(ta-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
  vec3 rd=normalize(uv.x*uu+uv.y*vv+lens*ww);
  float dist=.08;vec2 h=vec2(1.,0.);float limit=u_world==2?50.:u_world==10?46.:70.;bool found=false;
  for(int i=0;i<88;i++){h=map(ro+rd*dist);if(h.x<.0015*dist){found=true;break;}if(dist>limit)break;dist+=max(.002,h.x*(u_world==1||u_world==4||u_world==6||u_world==10?.62:u_world==8?.5:.78));}
  vec3 c=sky(rd,ro);
  if(found&&dist<limit){
    vec3 p=ro+rd*dist,n=normal(p,dist);float mat=h.y;
    vec3 light=normalize(u_world==8?vec3(-.3,.16,-.9):u_world==10?vec3(-.55,.38,-.8):vec3(mix(-.95,.15,u_traits.z),.8,.3));
    float dif=max(dot(n,light),0.);float amb=.35+.35*n.y;vec3 ambCol=u_world==8?vec3(.68,.56,.64):u_world==9?vec3(.58,.66,.70):vec3(.50,.65,.62);
    float occ=ao(p,n);float sh=shadow(p+n*.02,light);
    vec3 base,emission=vec3(0.);
    if(u_world==0){
      if(mat<1.5)base=vec3(.49,.41,.29)+fbm(p.xz*1.8)*.15;
      else{
        base=mix(vec3(.31,.19,.14),vec3(.77,.42,.27),noise(p.xz*.5));
        base+=vec3(.11,.035,.01)*sin(p.y*29.+fbm(p.xz*6.)*4.)*.13;
        float seams=smoothstep(.97,1.,sin(p.y*17.+noise(p.xz*4.)*3.));base*=1.-seams*.18;
      }
    }else if(u_world==1){
      if(mat<3.5){
        vec3 reflected=sky(reflect(rd,n),p);
        float fres=pow(1.-max(dot(-rd,n),0.),3.);
        base=mix(vec3(.035,.14,.17),reflected,.44+fres*.4);
        float shimmer=pow(max(dot(reflect(-light,n),-rd),0.),90.);
        c=base+vec3(.9,.54,.25)*shimmer*.5;
      }else base=vec3(.11,.19,.19);
    }else if(u_world==2){
      base=mix(vec3(.28,.14,.14),vec3(.63,.39,.27),.5+.5*sin(p.y*.6+p.z*.2));
      base+=vec3(.1,.18,.17)*pow(max(dot(n,normalize(vec3(-1.,1.,-1.))),0.),4.);
    }else if(u_world==3){
      base=mat<6.5?vec3(.67,.34,.14):vec3(.065,.10,.10);
      float ripple=sin(p.x*42.+p.z*17.+dune(p.xz)*12.);base*=.95+.05*ripple;
    }else if(u_world==4){
      base=mat<1.5?vec3(.09,.16,.14):mat<8.5?vec3(.19,.25,.20):mix(vec3(.16,.40,.37),vec3(.48,.28,.31),u_traits.z);
      if(mat>8.5){float gills=.65+.35*sin(length(p.xz)*26.+p.y*8.);emission=vec3(.13,.55,.42)*gills*(.18+.36*max(-n.y,0.))*(1.+u_audio.w*.5);}
    }else if(u_world==5){
      base=mat<10.5?vec3(.65,.77,.79):mix(vec3(.20,.45,.56),vec3(.54,.76,.79),noise(p.xy*.8));base*=.97+sin(p.y*13.+p.x*.8)*.03;emission=vec3(.05,.15,.19)*pow(1.-occ,2.);
    }else if(u_world==6){
      base=mat<12.5?vec3(.39,.45,.40):mat<13.5?vec3(.35,.29,.23):mat<14.5?vec3(.32,.40,.24):vec3(.51,.42,.30);if(mat>14.5)emission=vec3(.15,.29,.26)*.35;
    }else if(u_world==8){
      base=mat<20.5?vec3(.98,.92,.90):vec3(.16,.14,.18);
      if(mat<20.5)emission=vec3(.70,.38,.28)*pow(max(dot(rd,light),0.),3.)*.38+vec3(.12,.12,.22)*.10;
      else emission=vec3(.95,.50,.32)*pow(1.-max(dot(n,-rd),0.),2.2)*.5;
    }else if(u_world==9){
      if(mat<30.5){
        vec3 nw=normalize(n+vec3(sin(p.x*1.7+u_time*.3)*.012,0.,sin(p.z*1.3-u_time*.25)*.012)*(1.+u_audio.w*u_intensity*3.));vec3 rr=reflect(rd,nw),po=p+n*.02;float tr=.05,hitR=0.;
        for(int j=0;j<40;j++){float hh=mirrorSlabs(po+rr*tr);if(hh<.002*tr){hitR=1.;break;}tr+=hh*.8;if(tr>40.)break;}
        vec3 reflected=sky(rr,p);
        if(hitR>.5){
          vec3 pr=po+rr*tr;vec2 e=vec2(.01,0.);
          vec3 nr=normalize(vec3(mirrorSlabs(pr+e.xyy)-mirrorSlabs(pr-e.xyy),mirrorSlabs(pr+e.yxy)-mirrorSlabs(pr-e.yxy),mirrorSlabs(pr+e.yyx)-mirrorSlabs(pr-e.yyx)));
          reflected=vec3(.82,.80,.74)*(vec3(.50,.65,.62)*(.35+.35*nr.y)+vec3(1.3,.99,.63)*max(dot(nr,light),0.)*.8)*.9+reflected*.1;
        }
        float fres=pow(1.-max(dot(-rd,n),0.),2.5);
        base=mix(vec3(.62,.70,.70)*(.55+.45*max(dot(n,light),0.)),reflected,.66+fres*.32);
        c=base;
      }else base=vec3(.82,.80,.74);
    }else if(u_world==10){
      base=mat<32.5?vec3(.13,.19,.18):vec3(.10,.145,.14)+vec3(.03,.04,.035)*hash(vec2(floor(p.y*2.),mat));
    }else if(u_world==11){
      base=mat<50.5?mix(vec3(.82,.76,.62),vec3(.50,.45,.38),.5+.5*sin(p.y*14.+fbm(p.xz*3.)*3.)):mat<51.5?vec3(.80,.62,.30):vec3(.86,.86,.90);
    }else{
      float vein=1.-smoothstep(.035,.15,abs(sin(p.x*mix(.35,.68,u_traits.x)+fbm(p.xz*.29)*4.+p.z*.24)));
      base=mat>16.5?vec3(.075,.065,.065):mix(vec3(.08,.09,.095),vec3(.29,.12,.075),vein);if(mat<16.5)emission=mix(vec3(.9,.12,.025),vec3(1.35,.49,.10),u_traits.z)*vein*(.48+u_audio.w*.35);
    }
    if(!((u_world==1&&mat<3.5)||(u_world==9&&mat<30.5))){
      base*=mix(vec3(.85,1.03,1.09),vec3(1.12,.96,.83),u_traits.z);
      c=base*(ambCol*amb*occ+vec3(1.3,.99,.63)*dif*sh*.8);
      bool brass=u_world==11&&mat>50.5&&mat<51.5;
      float spec=pow(max(dot(reflect(-light,n),-rd),0.),u_world==0?28.:brass?90.:45.);
      c+=vec3(.8,.77,.59)*spec*(u_world==5?.36:brass?.9:.18)*sh;
      c+=vec3(.23,.39,.40)*pow(1.-max(dot(-rd,n),0.),3.)*.12+emission;
    }
    if(u_world==2){float glow=pow(1.-occ,2.);c+=vec3(.18,.67,.64)*glow*(.18+u_audio.w*u_intensity*.9);}
    vec3 fog=sky(normalize(vec3(rd.x,.02,rd.z)),ro);
    float fogAmount=1.-exp(-dist*(u_world==2?.017:u_world==6?.021:u_world==10?.07:u_world==8?.03:u_world==9?.022:u_world==11?.004:mix(.028,.043,u_traits.y)));
    c=mix(c,fog,fogAmount);
  }
  float response=u_audio.w*u_intensity;
  c*=1.+response*.16;c+=vec3(.025,.012,.006)*u_audio.x*u_intensity;
  vec3 glow=vec3(0.);
  for(int i=0;i<32;i++){
    if(i>=u_moteCount)break;
    vec4 m=u_mote[i],n2=u_mote2[i];vec2 dd=uv-m.xy;float r2=dot(dd,dd),s=m.z;
    float body=exp(-r2/(s*s*.2))+.35*exp(-r2/(s*s*2.2));
    glow+=mix(vec3(1.,.86,.62),vec3(.62,.82,1.),n2.x)*body*m.w;
  }
  c+=glow*u_moteStrength;
  if(u_palette==1)c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(.64,1.04,1.12),.63);
  if(u_palette==2)c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(1.22,.93,.61),.6);
  if(u_palette==3)c=vec3(dot(c,vec3(.299,.587,.114)))*vec3(1.02,1.02,.96);
  if(u_palette==4)c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(1.28,.92,.86),.58)+vec3(.035,.006,.016);
  if(u_palette==5)c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(.55,.74,1.25),.7)*.82+vec3(.004,.008,.03);
  c=c/(.84+c*.34);c=pow(max(c,0.),vec3(.91));
  float vig=1.-.26*pow(length(v_uv-.5)*1.35,1.7);c*=vig;
  float grain=hash(gl_FragCoord.xy+fract(u_time*.23)*392.5)-.5;
  c+=grain*(.007+u_grain*.09);
  c=mix(c,vec3(.12,.15,.13),.025);
  fragColor=vec4(clamp(c,0.,1.),1.);
}`;

const COMPOSITE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_old,u_new;
uniform float u_mix;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec3 a=texture(u_old,v_uv).rgb,b=texture(u_new,v_uv).rgb;
  float n=noise(v_uv*vec2(6.,4.)+3.)*.6+noise(v_uv*18.)*.25;
  float k=smoothstep(0.,1.,clamp(u_mix*1.5-n*.5,0.,1.));
  fragColor=vec4(mix(a,b,k),1.);
}`;

const UNIFORMS = ['resolution', 'time', 'seed', 'speed', 'grain', 'intensity', 'travel', 'palette', 'camera', 'mouse', 'audio', 'traits', 'moteCount', 'moteStrength', 'mote', 'mote2'];
const clampInt = (value, low, high, fallback = 0) => Math.max(low, Math.min(high, Math.round(Number(value)) || fallback));

export class OrbitRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!this.gl) throw new Error('WebGL 2 is unavailable.');
    const gl = this.gl;
    this.programs = new Map();
    this.failed = new Set();
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.state = { world: 0, seed: 714029, speed: 0.35, grain: 0.28, intensity: 0.55, palette: 0, camera: 'glide', travel: 0, motes: true };
    this.motes = { count: 0, a: new Float32Array(MAX_MOTES * 4), b: new Float32Array(MAX_MOTES * 4) };
    this.mouse = [0, 0];
    this.quality = 0.85;
    this.lastTime = 0;
    this.lastLevels = { bass: 0, mid: 0, high: 0, energy: 0 };
    this.lost = false;
    this.transition = null;
    this.fboSize = null;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.lost = true;
      canvas.dispatchEvent(new CustomEvent('rendererror', { detail: 'The render was interrupted. Reload the studio to resume.' }));
    });
  }

  compile(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  build(fragment, names) {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, VERTEX);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'a_position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    const u = {};
    for (const name of names) u[name] = gl.getUniformLocation(program, `u_${name}`);
    return { program, u };
  }

  // Each world compiles on its own, the first time it is needed: a lean program, a fast start.
  entry(world) {
    let entry = this.programs.get(world);
    if (entry) return entry;
    try {
      entry = this.build(FRAGMENT.replace('__WORLD__', String(world)), UNIFORMS);
    } catch (error) {
      console.error(`ORBITE world ${world}:`, error);
      this.failed.add(world);
      this.canvas.dispatchEvent(new CustomEvent('worldfailed', { detail: { world, message: String(error.message || error) } }));
      return world === 0 ? null : this.entry(0);
    }
    this.programs.set(world, entry);
    return entry;
  }

  setState(state) { Object.assign(this.state, state); }

  // Sounds in the landscape: [{ x, y, size, intensity, depth, tone }] in the screen space of the shader.
  setMotes(list) {
    const count = Math.min(MAX_MOTES, list.length);
    for (let i = 0; i < count; i++) {
      const m = list[i];
      this.motes.a.set([m.x, m.y, m.size, m.intensity], i * 4);
      this.motes.b.set([m.depth, m.tone ?? 0.5, 0, 0], i * 4);
    }
    this.motes.count = count;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75) * this.quality;
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.transition = null;
    }
  }

  ensureTargets(w, h) {
    const gl = this.gl;
    if (this.fboSize && this.fboSize[0] === w && this.fboSize[1] === h) return;
    for (const texture of [this.oldTex, this.newTex]) if (texture) gl.deleteTexture(texture);
    const make = (internal, format) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.UNSIGNED_BYTE, null);
      for (const [name, value] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, name, value);
      return texture;
    };
    this.oldTex = make(gl.RGB8, gl.RGB);
    this.newTex = make(gl.RGBA8, gl.RGBA);
    if (!this.fbo) this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.newTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.fboSize = [w, h];
  }

  // Freeze the current picture; the next frames dissolve from it into the new place.
  beginTransition(ms = 2400) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.lost || w < 8 || h < 8) return;
    const gl = this.gl;
    this.ensureTargets(w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, this.oldTex);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, w, h);
    this.transition = { start: performance.now(), ms };
  }

  drawWorld(entry, traits, time, levels, offscreen) {
    const gl = this.gl;
    const u = entry.u;
    const s = this.state;
    const w = this.canvas.width;
    const h = this.canvas.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen ? this.fbo : null);
    gl.useProgram(entry.program);
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.resolution, w, h);
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.seed, clampInt(s.seed, 1, 999999, 714029) * 0.0137 + 1);
    gl.uniform1f(u.speed, s.speed);
    gl.uniform1f(u.grain, s.grain);
    gl.uniform1f(u.intensity, s.intensity);
    gl.uniform1f(u.travel, Number(s.travel) || 0);
    gl.uniform1i(u.palette, s.palette);
    gl.uniform1i(u.camera, Math.max(0, CAMERAS.indexOf(s.camera)));
    gl.uniform4f(u.traits, traits.geometry, traits.sky, traits.light, traits.composition);
    gl.uniform2f(u.mouse, this.mouse[0], this.mouse[1]);
    gl.uniform4f(u.audio, levels.bass || 0, levels.mid || 0, levels.high || 0, levels.energy || 0);
    const showMotes = s.motes && this.motes.count > 0;
    gl.uniform1i(u.moteCount, showMotes ? this.motes.count : 0);
    gl.uniform1f(u.moteStrength, showMotes ? 1 : 0);
    gl.uniform4fv(u.mote, this.motes.a);
    gl.uniform4fv(u.mote2, this.motes.b);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  composite(k) {
    const gl = this.gl;
    if (!this.compositeEntry) this.compositeEntry = this.build(COMPOSITE, ['old', 'new', 'mix']);
    const { program, u } = this.compositeEntry;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program);
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.oldTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.newTex);
    gl.uniform1i(u.old, 0);
    gl.uniform1i(u.new, 1);
    gl.uniform1f(u.mix, k);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.activeTexture(gl.TEXTURE0);
  }

  render(time = this.lastTime, levels = this.lastLevels) {
    if (this.lost) return;
    this.lastTime = time;
    this.lastLevels = levels;
    const world = clampInt(this.state.world, 0, WORLD_COUNT - 1);
    const seed = clampInt(this.state.seed, 1, 999999, 714029);
    const entry = this.entry(world);
    if (!entry) return;
    const traits = seedTraits(seed, world);
    if (this.transition) {
      const k = (performance.now() - this.transition.start) / this.transition.ms;
      if (k >= 1 || !this.fboSize) {
        this.transition = null;
      } else {
        this.drawWorld(entry, traits, time, levels, true);
        this.composite(k);
        return;
      }
    }
    this.drawWorld(entry, traits, time, levels, false);
  }

  capture(width = 3840, height = 2160) {
    const oldW = this.canvas.width;
    const oldH = this.canvas.height;
    this.transition = null;
    try {
      this.canvas.width = width;
      this.canvas.height = height;
      this.render();
      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      out.getContext('2d').drawImage(this.canvas, 0, 0);
      return out;
    } finally {
      this.canvas.width = oldW;
      this.canvas.height = oldH;
      this.render();
    }
  }

  thumbnail(world, width = 240, height = 150) {
    const old = { ...this.state };
    const time = this.lastTime;
    const mouse = this.mouse;
    const motes = this.motes.count;
    try {
      this.state = { ...old, world, seed: 714029, grain: 0.18, palette: 0, camera: 'drift', travel: 0, motes: false };
      this.mouse = [0, 0];
      this.lastTime = 20;
      this.motes.count = 0;
      return this.capture(width, height).toDataURL('image/jpeg', 0.75);
    } finally {
      this.state = old;
      this.mouse = mouse;
      this.lastTime = time;
      this.motes.count = motes;
      this.render();
    }
  }
}

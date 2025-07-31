import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import React from 'react'

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;

float hash( float n ) {
    return fract(sin(n)*43758.5453);
}

bool getMaterialColor( int i, vec2 coord, out vec3 color ) {
    vec2 uv = floor( coord );
    float n = uv.x + uv.y*347.0 + 4321.0 * float(i);
    float h = hash(n);
    float br = 1. - h * (96./255.);
    color = vec3( 150./255., 108./255.,  74./255.);
    
    if (i == 4) {
        color = vec3( 127./255., 127./255., 127./255.);
    }
    
    float xm1 = mod((uv.x * uv.x * 3. + uv.x * 81.) / 4., 4.);
    
    if (i == 1) {
        if( uv.y < (xm1 + 18.)) {
            color = vec3( 106./255., 170./255.,  64./255.);
        } else if (uv.y < (xm1 + 19.)) {
            br = br * (2. / 3.);
        }
    }
    
    if (i == 7) {
        color = vec3( 103./255., 82./255.,  49./255.);
        if (uv.x > 0. && uv.x < 15. && ((uv.y > 0. && uv.y < 15.) || (uv.y > 32. && uv.y < 47.))) {
            color = vec3( 188./255., 152./255.,  98./255.);
            float xd = (uv.x - 7.);
            float yd = (mod(uv.y, 16.) - 7.);
            if (xd < 0.) xd = 1. - xd;
            if (yd < 0.) yd = 1. - yd;
            if (yd > xd) xd = yd;
            br = 1. - (h * (32./255.) + mod(xd, 4.) * (32./255.));
        } else if ( h < 0.5 ) {
            br = br * (1.5 - mod(uv.x, 2.));
        }
    }
    
    if (i == 5) {
        color = vec3( 181./255.,  58./255.,  21./255.);
        if ( mod(uv.x + (floor(uv.y / 4.) * 5.), 8.) == 0. || mod( uv.y, 4.) == 0.) {
            color = vec3( 188./255., 175./255., 165./255.);
        }
    }
    if (i == 9) {
        color = vec3(  64./255.,  64./255., 255./255.);
    }
    
    float brr = br;
    if (uv.y >= 32.) brr /= 2.;
    
    if (i == 8) {
        color = vec3(  80./255., 217./255.,  55./255.);
        if ( h < 0.5) {
            return false;
        }
    }
    
    color *= brr;
    return true;
}

int getMap( vec3 pos ) {	
    vec3 posf = floor( (pos - vec3(32.))  );
    float n = posf.x + posf.y*517.0 + 1313.0*posf.z;
    float h = hash(n);
    
    if( h > sqrt( sqrt( dot( posf.yz, posf.yz )*0.16 ) ) - 0.8  ) {
        return 0;
    }	
    
    return int( hash( n * 465.233 ) * 16. );
}

vec3 renderMinecraft( vec2 uv ) {
    float xRot = sin( iTime*0.5 ) * 0.4 + (3.1415 / 2.);
    float yRot = cos( iTime*0.5 ) * 0.4;
    float yCos = cos(yRot);
    float ySin = sin(yRot);
    float xCos = cos(xRot);
    float xSin = sin(xRot);
    
    vec3 opos = vec3( 32.5 + iTime * 6.4, 32.5, 32.5 );
    
    float gggxd = (uv.x - 0.5) * (iResolution.x / iResolution.y );
    float ggyd = (1.-uv.y - 0.5);
    float ggzd = 1.;
    
    float gggzd = ggzd * yCos + ggyd * ySin;
    
    vec3 _posd = vec3( gggxd * xCos + gggzd * xSin,
                       ggyd * yCos - gggzd * ySin,
                       gggzd * xCos - gggxd * xSin );
    
    vec3 col = vec3( 0. );
    float br = 1.;
    vec3 bdist = vec3( 255. - 100., 255. -   0., 255. -  50.  );
    float ddist = 0.;
    
    float closest = 32.;
    
    for ( int d = 0; d < 3; d++) {
        float dimLength = _posd[d];
        float ll = abs( 1. / dimLength );
        vec3 posd = _posd * ll;
        
        float initial = fract( opos[d] );
        if (dimLength > 0.) initial = 1. - initial;
        
        float dist = ll * initial;
        vec3 pos = opos + posd * initial;
        
        if (dimLength < 0.) {
            pos[d] -= 1.;
        }
        
        for (int i=0; i<30; i++) {
            if( dist > closest )continue;
            
            int tex = getMap( pos );
            
            if (tex > 0) {
                vec2 texcoord;
                texcoord.x = mod(((pos.x + pos.z) * 16.), 16.);
                texcoord.y = mod((pos.y * 16.), 16.) + 16.;
                if (d == 1) {
                    texcoord.x = mod(pos.x * 16., 16.);
                    texcoord.y = mod(pos.z * 16., 16.);
                    if (posd.y < 0.) texcoord.y += 32.;
                }
                
                if ( getMaterialColor( tex, texcoord, col ) ) {
                    ddist = 1. - (dist / 32.);
                    br = bdist[d];
                    closest = dist;
                }
            }
            pos += posd;
            dist += ll;
        }
    }
    
    return col * ddist * (br/255.);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    fragColor = vec4( renderMinecraft( uv ) ,1.0);
}

varying vec2 vUv;

void main() {
    mainImage(gl_FragColor, vUv * iResolution);
}
`

export const MinecraftBackground = React.memo(({ timeScale = 0.3, onTogglePause }) => {
    const mesh = useRef()
    const { size } = useThree()
    const [isPaused, setIsPaused] = useState(false)
    const [pauseTime, setPauseTime] = useState(0)
    
    const uniforms = useMemo(
        () => ({
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(size.width, size.height) }
        }),
        [size]
    )

    useEffect(() => {
        if (mesh.current) {
            mesh.current.material.uniforms.iResolution.value.set(size.width, size.height)
        }
    }, [size])

    useFrame((state) => {
        const { clock } = state
        if (mesh.current && mesh.current.material) {
            if (isPaused) {
                mesh.current.material.uniforms.iTime.value = pauseTime
            } else {
                const currentTime = clock.getElapsedTime() * timeScale
                mesh.current.material.uniforms.iTime.value = currentTime
                setPauseTime(currentTime)
            }
        }
    })

    const handleClick = () => {
        setIsPaused(!isPaused)
        if (onTogglePause) {
            onTogglePause(!isPaused)
        }
    }

    return (
        <mesh ref={mesh} onClick={handleClick}>
            <planeGeometry args={[4, 4]} />
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    )
})

MinecraftBackground.displayName = 'MinecraftBackground' 
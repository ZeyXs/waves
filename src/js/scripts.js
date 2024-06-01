import * as THREE from 'three';
import Stats from 'stats.js';
import Perlin from '../libs/perlin';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

var renderer, scene, camera, orbit, line, plane;
const perlin = new Perlin();
const stats = new Stats();
stats.showPanel(0)
document.body.appendChild(stats.dom);
const SIZE = 10;

// ShaderToy shader code translated to Three.js ShaderMaterial
const waterShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        iTime: { value: 0 },
        WATER_COL: { value: new THREE.Vector3(0.0, 0.4453, 0.7305) },
        WATER2_COL: { value: new THREE.Vector3(0.0, 0.4180, 0.6758) },
        FOAM_COL: { value: new THREE.Vector3(0.8125, 0.9609, 0.9648) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #define M_2PI 6.283185307
        #define M_6PI 18.84955592
        uniform float iTime;
        uniform vec3 WATER_COL;
        uniform vec3 WATER2_COL;
        uniform vec3 FOAM_COL;
        varying vec2 vUv;
        
        float circ(vec2 pos, vec2 c, float s)
        {
            c = abs(pos - c);
            c = min(c, 1.0 - c);
            return dot(c, c) < s ? -1.0 : 0.0;
        }
        
        float waterlayer(vec2 uv)
        {
            uv = mod(uv, 1.0); // Clamp to [0..1]
            float ret = 1.0;
            ret += circ(uv, vec2(0.37378, 0.277169), 0.0268181);
            ret += circ(uv, vec2(0.37378, 0.277169), 0.0268181);
            ret += circ(uv, vec2(0.0317477, 0.540372), 0.0193742);
            ret += circ(uv, vec2(0.430044, 0.882218), 0.0232337);
            ret += circ(uv, vec2(0.641033, 0.695106), 0.0117864);
            ret += circ(uv, vec2(0.0146398, 0.0791346), 0.0299458);
            ret += circ(uv, vec2(0.43871, 0.394445), 0.0289087);
            ret += circ(uv, vec2(0.909446, 0.878141), 0.028466);
            ret += circ(uv, vec2(0.310149, 0.686637), 0.0128496);
            ret += circ(uv, vec2(0.928617, 0.195986), 0.0152041);
            ret += circ(uv, vec2(0.0438506, 0.868153), 0.0268601);
            ret += circ(uv, vec2(0.308619, 0.194937), 0.00806102);
            ret += circ(uv, vec2(0.349922, 0.449714), 0.00928667);
            ret += circ(uv, vec2(0.0449556, 0.953415), 0.023126);
            ret += circ(uv, vec2(0.117761, 0.503309), 0.0151272);
            ret += circ(uv, vec2(0.563517, 0.244991), 0.0292322);
            ret += circ(uv, vec2(0.566936, 0.954457), 0.00981141);
            ret += circ(uv, vec2(0.0489944, 0.200931), 0.0178746);
            ret += circ(uv, vec2(0.569297, 0.624893), 0.0132408);
            ret += circ(uv, vec2(0.298347, 0.710972), 0.0114426);
            ret += circ(uv, vec2(0.878141, 0.771279), 0.00322719);
            ret += circ(uv, vec2(0.150995, 0.376221), 0.00216157);
            ret += circ(uv, vec2(0.119673, 0.541984), 0.0124621);
            ret += circ(uv, vec2(0.629598, 0.295629), 0.0198736);
            ret += circ(uv, vec2(0.334357, 0.266278), 0.0187145);
            ret += circ(uv, vec2(0.918044, 0.968163), 0.0182928);
            ret += circ(uv, vec2(0.965445, 0.505026), 0.006348);
            ret += circ(uv, vec2(0.514847, 0.865444), 0.00623523);
            ret += circ(uv, vec2(0.710575, 0.0415131), 0.00322689);
            ret += circ(uv, vec2(0.71403, 0.576945), 0.0215641);
            ret += circ(uv, vec2(0.748873, 0.413325), 0.0110795);
            ret += circ(uv, vec2(0.0623365, 0.896713), 0.0236203);
            ret += circ(uv, vec2(0.980482, 0.473849), 0.00573439);
            ret += circ(uv, vec2(0.647463, 0.654349), 0.0188713);
            ret += circ(uv, vec2(0.651406, 0.981297), 0.00710875);
            ret += circ(uv, vec2(0.428928, 0.382426), 0.0298806);
            ret += circ(uv, vec2(0.811545, 0.62568), 0.00265539);
            ret += circ(uv, vec2(0.400787, 0.74162), 0.00486609);
            ret += circ(uv, vec2(0.331283, 0.418536), 0.00598028);
            ret += circ(uv, vec2(0.894762, 0.0657997), 0.00760375);
            ret += circ(uv, vec2(0.525104, 0.572233), 0.0141796);
            ret += circ(uv, vec2(0.431526, 0.911372), 0.0213234);
            ret += circ(uv, vec2(0.658212, 0.910553), 0.000741023);
            ret += circ(uv, vec2(0.514523, 0.243263), 0.0270685);
            ret += circ(uv, vec2(0.0249494, 0.252872), 0.00876653);
            ret += circ(uv, vec2(0.502214, 0.47269), 0.0234534);
            ret += circ(uv, vec2(0.693271, 0.431469), 0.0246533);
            ret += circ(uv, vec2(0.415, 0.884418), 0.0271696);
            ret += circ(uv, vec2(0.149073, 0.41204), 0.00497198);
            ret += circ(uv, vec2(0.533816, 0.897634), 0.00650833);
            ret += circ(uv, vec2(0.0409132, 0.83406), 0.0191398);
            ret += circ(uv, vec2(0.638585, 0.646019), 0.0206129);
            ret += circ(uv, vec2(0.660342, 0.966541), 0.0053511);
            ret += circ(uv, vec2(0.513783, 0.142233), 0.00471653);
            ret += circ(uv, vec2(0.124305, 0.644263), 0.00116724);
            ret += circ(uv, vec2(0.99871, 0.583864), 0.0107329);
            ret += circ(uv, vec2(0.894879, 0.233289), 0.00667092);
            ret += circ(uv, vec2(0.246286, 0.682766), 0.00411623);
            ret += circ(uv, vec2(0.0761895, 0.16327), 0.0145935);
            ret += circ(uv, vec2(0.949386, 0.802936), 0.0100873);
            ret += circ(uv, vec2(0.480122, 0.196554), 0.0110185);
            ret += circ(uv, vec2(0.896854, 0.803707), 0.013969);
            ret += circ(uv, vec2(0.292865, 0.762973), 0.00566413);
            ret += circ(uv, vec2(0.0995585, 0.117457), 0.00869407);
            ret += circ(uv, vec2(0.377713, 0.00335442), 0.0063147);
            ret += circ(uv, vec2(0.506365, 0.531118), 0.0144016);
            ret += circ(uv, vec2(0.408806, 0.894771), 0.0243923);
            ret += circ(uv, vec2(0.143579, 0.85138), 0.00418529);
            ret += circ(uv, vec2(0.0902811, 0.181775), 0.0108896);
            ret += circ(uv, vec2(0.780695, 0.394644), 0.00475475);
            ret += circ(uv, vec2(0.298036, 0.625531), 0.00325285);
            ret += circ(uv, vec2(0.218423, 0.714537), 0.00157212);
            ret += circ(uv, vec2(0.658836, 0.159556), 0.00225897);
            ret += circ(uv, vec2(0.987324, 0.146545), 0.0288391);
            ret += circ(uv, vec2(0.222646, 0.251694), 0.00092276);
            ret += circ(uv, vec2(0.159826, 0.528063), 0.00605293);
            return max(ret, 0.0);
        }
        
        vec3 water(vec2 uv, vec3 cdir)
        {
            uv *= vec2(0.25);
            vec2 a = 0.025 * cdir.xz / cdir.y; // Parallax offset
            float h = sin(uv.x + iTime); // Height at UV
            uv += a * h;
            h = sin(0.841471 * uv.x - 0.540302 * uv.y + iTime);
            uv += a * h;
            float d1 = mod(uv.x + uv.y, M_2PI);
            float d2 = mod((uv.x + uv.y + 0.25) * 1.3, M_6PI);
            d1 = iTime * 0.07 + d1;
            d2 = iTime * 0.5 + d2;
            vec2 dist = vec2(
                sin(d1) * 0.15 + sin(d2) * 0.05,
                cos(d1) * 0.15 + cos(d2) * 0.05
            );
            vec3 ret = mix(WATER_COL, WATER2_COL, waterlayer(uv + dist.xy));
            ret = mix(ret, FOAM_COL, waterlayer(vec2(1.0) - uv - dist.yx));
            return ret;
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord)
        {
            fragColor = vec4(water(fragCoord * 64., vec3(0,1,0)), 1.0);
        }

        void main() {
            vec4 fragColor;
            mainImage(fragColor, vUv);
            gl_FragColor = fragColor;
        }
    `
});

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    orbit = new OrbitControls(camera, renderer.domElement);
    
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    
    camera.position.set(0, 2, 5);
    orbit.update();
}

function createGeometry() {
    const planeGeometry = new THREE.PlaneGeometry( SIZE, SIZE, 150, 150 );
    plane = new THREE.Mesh(planeGeometry, waterShaderMaterial);
    plane.rotation.x = -Math.PI / 2;
    //const wireframe = new THREE.WireframeGeometry( planeGeometry );
    //const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    //line = new THREE.LineSegments( wireframe, lineMaterial );

    //line.rotation.x = Math.PI / 2;
    
    scene.add(plane);
}

function updateVertices(time) {
    let vertices = plane.geometry.attributes.position.array;
    const octaves = 8;
    const persistence = 0.2;
    const lacunarity = 3;

    for (let i = 0; i <= vertices.length; i += 3) {
        let sampleX = vertices[i] + (time * 0.001);
        let sampleY = vertices[i+1] + (time * 0.001);
        vertices[i+2] = perlin.fractalNoise(sampleX, sampleY, octaves, persistence, lacunarity) * 0.05;
        //vertices[i+2] = Math.sin(sampleX * 5) * Math.cos(sampleY * 5) * 0.05;
    }
    plane.geometry.attributes.position.needsUpdate = true;
}

function animate(time) {
    stats.begin();
    waterShaderMaterial.uniforms.iTime.value = time * 0.001;
    updateVertices(time);
    renderer.render(scene, camera);
    stats.end();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
createGeometry();
renderer.setAnimationLoop(animate);
window.addEventListener('resize', onWindowResize, false);
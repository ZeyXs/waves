import * as THREE from 'three';
import Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';


class Three {

    stats: Stats;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    orbit: OrbitControls;

    sky: Sky;
    sun: THREE.Vector3;
    pmremGenerator: THREE.PMREMGenerator;
    sceneEnv: THREE.Scene;
    water: Water;

    time: number = 0;

    // Geometry
    planeMesh: any;

    constructor() {
        this.stats = new Stats();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);

        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);

        this.sky = new Sky();
        this.sun = new THREE.Vector3();

        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.sceneEnv = new THREE.Scene();
    }

    public init(debug: boolean = false) {
        if (debug) {
            this.debug();
        }
        this.createGeometry();
        this.renderer.setAnimationLoop(() => this.animate());
    }

    public debug() {
        document.body.appendChild(this.stats.dom);
        this.stats.showPanel(2);
        const axesHelper: THREE.AxesHelper = new THREE.AxesHelper(3);
        this.scene.add(axesHelper);
    }

    public initSky() {
        this.sky.scale.setScalar(10000);
        this.scene.add(this.sky);

        const skyUniforms = this.sky.material.uniforms;
        skyUniforms[ 'turbidity' ].value = 10;
        skyUniforms[ 'rayleigh' ].value = 2;
        skyUniforms[ 'mieCoefficient' ].value = 0.005;
        skyUniforms[ 'mieDirectionalG' ].value = 0.8;

        this.updateSun();
    }

    public updateSun() {
        let renderTarget: any;
    
        const parameters = {
            elevation: 2,
            azimuth: 180
        };
    
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);
    
        this.sun.setFromSphericalCoords(1, phi, theta);
    
        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
        this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun ).normalize();
    
        if (renderTarget !== undefined) {
            renderTarget.dispose();
        }
    
        this.sceneEnv.add(this.sky);
        renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
        this.scene.add(this.sky);
    
        this.scene.environment = renderTarget.texture;
    }

    public createGeometry() {
        const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(10000, 10000, 200, 200);

        this.water = new Water(
            planeGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( './src/textures/waternormals.jpg', texture => {
                    console.log("texture", texture);
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }, () => {}, err => {
                    console.log(err);
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            },
        );


        this.water.rotateX(-Math.PI * 0.5);
        this.scene.add(this.water);

        this.initSky();

        //this.planeMesh = new THREE.Mesh(planeGeometry, material);
        
        //this.scene.add(this.planeMesh);
    }

    public animate() {
        this.time += performance.now() + 0.01;
        this.stats.begin();

        //this.planeMesh.material.uniforms.u_time.value = this.time;
        this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        this.renderer.render(this.scene, this.camera);
        
        this.stats.end();
    }

}

const three: Three = new Three();
three.init(true);
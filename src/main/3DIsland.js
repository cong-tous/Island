import * as THREE from 'three';

//导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//导入水面
import { Water } from "three/examples/jsm/objects/Water2";

//导入gltf载入库
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//导入draco载入库
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

//导入HDR纹理
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

//设置相机的位置
camera.position.set(-150, 100, 200);

//更新摄像头宽高比例
camera.aspect = window.innerWidth / window.innerHeight;

//更新摄像头投影矩阵
camera.updateProjectionMatrix();

//场景中添加相机
scene.add(camera);

//初始化渲染器
const renderer = new THREE.WebGL1Renderer({
    //设置抗锯齿
    antialias: true,
    //设置对数深度缓冲区
    logarithmicDepthBuffer: true,
});
renderer.outputEncoding = THREE.sRGBEncoding;

//设置渲染器宽高
renderer.setSize(window.innerWidth, window.innerHeight);

//监听屏幕的大小变化，实时修改渲染器的宽高，相机的比例
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//降渲染器添加到页面中
document.body.appendChild(renderer.domElement);

//实例化控制器
const controls = new OrbitControls(camera, renderer.domElement);

//设置一个函数，不断的渲染画面
function render() { 
    //渲染场景
    renderer.render(scene, camera);
    //引擎自动更新渲染器
    requestAnimationFrame(render);
}
render();



//创建一个巨大的天空球体
let texture = new THREE.TextureLoader().load("./textures/sky.jpg");
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60);
const skyMaterial = new THREE.MeshBasicMaterial({
    map:texture, 
});
skyGeometry.scale(1, 1, -1);
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

//添加视频纹理
const video = document.createElement("video");
video.src = "./textures/sky.mp4";
//视频循环播放
video.loop = true;

//浏览器会禁止播放，需加入一些交互效果使视频播放
window.addEventListener("click", (e) => {
    //当鼠标点击的时候播放视频
    //判断视频是否处于播放状态
    if (video.paused) {
        let texture = new THREE.VideoTexture(video);
        video.play();
        skyMaterial.map = texture;
        skyMaterial.map.needsUpdate = true;
    }
});

//载入HDR的环境纹理
const hdrLoader = new RGBELoader();
hdrLoader.loadAsync("./assets/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
});

//添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 100, 10);
scene.add(light);

//创建水面
const waterGeometry = new THREE.CircleBufferGeometry(300, 64);
const water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureWidth: 1024,
    color: 0xeeeeff,
    flowDirection: new THREE.Vector2(1, 1),
    scale: 1,
});
water.position.y = 3;
//水面旋转至水平
water.rotation.x = -Math.PI / 2;
scene.add(water);

//添加小岛模型
//实例化gltf载入库
const loader = new GLTFLoader();
//实例化draco载入库
const dracoLoader = new DRACOLoader();
//添加draco载入库
dracoLoader.setDecoderPath("./draco/");

loader.setDRACOLoader(dracoLoader);
loader.load("./model/island2.glb", (gltf) => {
    scene.add(gltf.scene);
});
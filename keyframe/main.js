var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var camera = new THREE.PerspectiveCamera(30, width / height, 1, 100);
camera.position.set(0, 0, 20);
camera.lookAt(new THREE.Vector3());
camera.updateMatrixWorld();
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ canvas: canvas });

var ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xaaaaaa, 0.9);
directionalLight.position.set(0, 100, 40);
scene.add(directionalLight);

var material = new THREE.MeshLambertMaterial();
var geometry = new THREE.TeapotBufferGeometry(1, 3);

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var controls = new THREE.OrbitControls(camera);
controls.enableZoom = false;
controls.enablePan = false;

var positionKeyframeTrackJSON = {
    name: ".position",
    type: "vector",
    times: [0, 1, 2],
    values: [0, 0, 0, 2, 1, 15, 0, 0, 0]
}

var rotationKeyframeTrackJSON = {
    name: ".rotation[y]",
    type: "number",
    times: [0, 2],
    values: [0, 2 * Math.PI],
    interpolation: THREE.InterpolateSmooth
}

var clipJSON = {
    duration: 2,
    tracks: [
        positionKeyframeTrackJSON,
        rotationKeyframeTrackJSON
    ]
}

var clip = THREE.AnimationClip.parse(clipJSON)

var mixer = new THREE.AnimationMixer(cube)
var action = mixer.clipAction(clip)
action.play()

animate()
function animate() {

    requestAnimationFrame(animate)

    mixer.update(0.01)
    controls.update();
    renderer.render(scene, camera);

}




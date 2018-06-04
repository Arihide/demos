var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(30, width / height, 1, 50);
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer({ canvas: canvas });

var controls = new THREE.OrbitControls(camera);
controls.enablePan = false;

var loader = new THREE.BufferGeometryLoader();
loader.load('./monkey.json', function (geo) {

    var lightmap = new THREE.TextureLoader().load('./lightmap.png');

    var mat = new THREE.MeshBasicMaterial({ color: 0x0000ff, lightMap: lightmap })

    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

   
    render();
});

function render() {

    requestAnimationFrame(render)
    controls.update();
    renderer.render(scene, camera);

}




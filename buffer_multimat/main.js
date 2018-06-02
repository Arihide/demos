var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var camera = new THREE.PerspectiveCamera(30, width / height, 1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3());
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

var controls = new THREE.OrbitControls(camera);
controls.enableZoom = false;
controls.enablePan = false;

var ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xaaaaaa, 0.9);
directionalLight.position.set(0, 100, 40);
scene.add(directionalLight);

var loader = new THREE.BufferGeometryLoader();
loader.load('./monkey.json', function (geo) {

    //ジオメトリのグループ分け。
    //第1引数：配列の開始地点　第2引数：開始地点から数えた範囲　第3引数：マテリアルのIndex
    //1452は頂点数。つまり右半分の面の数(484)*3=1452　1449も同様に左半分の面を表す。
    geo.addGroup(0, 1452, 0);     //mat[0]
    geo.addGroup(1452, 1449, 1);  //mat[1]

    let mat = [
        new THREE.MeshBasicMaterial({ color: 0x0000ff, }),
        new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xaaaaaa, shininess: 80 })
    ];
 
    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    renderer.render(scene, camera);
});

window.addEventListener('mousemove', function () {
    controls.update();
    renderer.render(scene, camera);
}, false);
window.addEventListener('touchmove', function () {
    controls.update();
    renderer.render(scene, camera);
}, true);

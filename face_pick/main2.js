var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var camera = new THREE.PerspectiveCamera(30, width / height, 1, 100);
camera.position.set(0, 20, 20);
camera.lookAt(new THREE.Vector3());
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

var ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xaaaaaa, 0.9);
directionalLight.position.set(0, 100, 40);
scene.add(directionalLight);

var loader = new THREE.JSONLoader();
var mesh;
loader.load('./rough_plane.json', function (geo) {
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
    mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);
    renderer.render(scene, camera);
});

window.addEventListener('click', function (e) {
    //面番号の取得
    var square = getIntersectedIndex(e);
    if (square !== undefined && mesh) {
        mesh.geometry.colorsNeedUpdate = true;
        mesh.geometry.faces[square].color.set(0x00ff00);
        if(square % 2 === 0){
            mesh.geometry.faces[square+1].color.set(0x00ff00);
        }else{
            mesh.geometry.faces[square-1].color.set(0x00ff00);
        }
    }
    renderer.render(scene, camera);
}, true);

var raycaster = new THREE.Raycaster();
function getIntersectedIndex(e) {
    var raymouse = new THREE.Vector2();

    raymouse.x = (e.offsetX / width) * 2 - 1;
    raymouse.y = -(e.offsetY / height) * 2 + 1;
    raycaster.setFromCamera(raymouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        var square = intersects[0].faceIndex;
    }

    return square;
}
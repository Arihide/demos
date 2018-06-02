Object.assign(THREE.Box3.prototype, {
    project: function () {
        var points = [
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3()
        ];

        return function (camera) {
            // transform of empty box is an empty box.
            if (this.isEmpty()) return this;

            // NOTE: I am using a binary pattern to specify all 2^3 combinations below
            points[0].set(this.min.x, this.min.y, this.min.z).project(camera); // 000
            points[1].set(this.min.x, this.min.y, this.max.z).project(camera); // 001
            points[2].set(this.min.x, this.max.y, this.min.z).project(camera); // 010
            points[3].set(this.min.x, this.max.y, this.max.z).project(camera); // 011
            points[4].set(this.max.x, this.min.y, this.min.z).project(camera); // 100
            points[5].set(this.max.x, this.min.y, this.max.z).project(camera); // 101
            points[6].set(this.max.x, this.max.y, this.min.z).project(camera); // 110
            points[7].set(this.max.x, this.max.y, this.max.z).project(camera); // 111

            this.setFromPoints(points);

            return this;
        };
    }()
});

var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var camera = new THREE.PerspectiveCamera(30, width / height, 1, 100);
camera.position.set(24, 24, 24);
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
var geometry = new THREE.BoxGeometry(10, 12, 14);

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

geometry.computeBoundingBox();

var controls = new THREE.OrbitControls(camera);
controls.enableZoom = false;
controls.enablePan = false;

var cameraDir = new THREE.Vector3();
var nearPoint = new THREE.Vector3();
var tempBox = new THREE.Box3();

function fitCamera(object, camera) {
    tempBox.copy(object.geometry.boundingBox);

    //直方体からカメラに向かう単位ベクトルを求める
    cameraDir.subVectors(camera.position, mesh.position);
    cameraDir.normalize();

    //「今一番カメラに近い直方体の角」を求める
    if (cameraDir.x > 0) {
        nearPoint.x = tempBox.max.x;
    } else {
        nearPoint.x = tempBox.min.x;
    }

    if (cameraDir.y > 0) {
        nearPoint.y = tempBox.max.y;
    } else {
        nearPoint.y = tempBox.min.y;
    }

    if (cameraDir.z > 0) {
        nearPoint.z = tempBox.max.z;
    } else {
        nearPoint.z = tempBox.min.z;
    }

    //単位ベクトルの軸上で、最もカメラに近い座標を計算する
    nearPoint.projectOnVector(cameraDir);

    //最も近い角が「原点を通るスクリーンに平行な面」に来るように移動する
    tempBox.min.sub(nearPoint);
    tempBox.max.sub(nearPoint);

    //クリッピング座標に変換
    tempBox.project(camera);

    //最もスクリーンの端に近い点を求める（tempBoxはクリッピング座標系であることに注意)
    var scale = Math.max(tempBox.max.x, tempBox.max.y, -tempBox.min.x, -tempBox.min.y);

    camera.position.multiplyScalar(scale);
    camera.position.add(nearPoint);
}

window.addEventListener('load', function () {
    controls.update();
    fitCamera(mesh, camera);
    renderer.render(scene, camera);
}, false);
window.addEventListener('mousemove', function () {
    controls.update();
    fitCamera(mesh, camera);
    renderer.render(scene, camera);
}, false);
window.addEventListener('touchmove', function () {
    controls.update();
    fitCamera(mesh, camera);
    renderer.render(scene, camera);
}, true);





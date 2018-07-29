var container = document.getElementById("container");
var canvas = container.firstElementChild;

var width = container.clientWidth;
var height = container.clientHeight;

canvas.width = width;
canvas.height = height;

var camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
camera.position.set(0.5, 1.4, 2);
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

var ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 2.9);
directionalLight.position.set(0, 100, 40);
scene.add(directionalLight);

var controls = new THREE.OrbitControls(camera);
controls.target.set(0.5, 1.4, 0);
// controls.enableZoom = false;
// controls.enablePan = false;
// window.addEventListener('mousemove', render, false);

let target = new THREE.Object3D()

let transformControl = new THREE.TransformControls(camera, renderer.domElement);
transformControl.attach(target)
target.position.set(0.66, 1.31, 0)
scene.add(target)
scene.add(transformControl)
// transformControl.addEventListener('change', render)

let mesh
let loader = new THREE.GLTFLoader()
let IKSolver
loader.load('./leftArm.gltf', (gltf) => {

    console.log(gltf)

    mesh = gltf.scene.getObjectByName("Arms")

    console.log(mesh)

    scene.add(gltf.scene)

    let bones = mesh.skeleton.bones

    let helper = new THREE.SkeletonHelper(mesh)
    scene.add(helper)

    console.log(mesh.skeleton)
    bones[0].updateMatrixWorld(true)

    IKSolver = new AnaliticalIK(bones[1], bones[3], bones[5], target, mesh.skeleton.boneInverses[0])

    animate()

})

function render() {


    controls.update()
    transformControl.update()

    renderer.render(scene, camera)

}

function animate() {

    IKSolver.solve()
    // mesh.position.x = 1

    requestAnimationFrame(animate)

    render()

}


class AnaliticalIK {

    // 7自由度IKについて
    // Tolani et al. Real-time inverse kinematics techniques for anthropomorphic limbs

    // BlenderはBoneのtwist回転軸がyである。

    constructor(shoulder, elbow, wrist, target, worldInverse) {
        this.worldInverse = worldInverse.clone()
        this.shoulder = shoulder
        this.elbow = elbow // 1 DOF on x-axis
        this.wrist = wrist
        this.target = target
        this.swivelAngle = 0 // Parameter

        let shoulderMatrixWorld = shoulder.matrixWorld.elements
        let elbowMatrixWorld = elbow.matrixWorld.elements
        let wristMatrixWorld = wrist.matrixWorld.elements

        this._lowerArmLengthSq =
            Math.pow(shoulderMatrixWorld[12] - elbowMatrixWorld[12], 2) +
            Math.pow(shoulderMatrixWorld[13] - elbowMatrixWorld[13], 2) +
            Math.pow(shoulderMatrixWorld[14] - elbowMatrixWorld[14], 2)
        this._foreArmLengthSq =
            Math.pow(wristMatrixWorld[12] - elbowMatrixWorld[12], 2) +
            Math.pow(wristMatrixWorld[13] - elbowMatrixWorld[13], 2) +
            Math.pow(wristMatrixWorld[14] - elbowMatrixWorld[14], 2)

        this._lowerArmLength = Math.sqrt(this._lowerArmLengthSq)
        this._foreArmLength = Math.sqrt(this._foreArmLengthSq)


        this.shoulder.matrixAutoUpdate = false
        this.elbow.matrixAutoUpdate = false

        // this.bendNormal = new Vector3(0, 1, 0)

    }

    solve(pos) {

        let shoulderMatrix = this.shoulder.matrix.elements
        let shoulderMatrixWorld = this.shoulder.matrixWorld.elements
        let elbowMatrix = this.elbow.matrix.elements
        let wristMatrix = this.wrist.matrix.elements
        let _target = this.target

        let shoulderToWrist = [
            _target.position.x - shoulderMatrixWorld[12],
            _target.position.y - shoulderMatrixWorld[13],
            _target.position.z - shoulderMatrixWorld[14]
        ]

        // console.log(shoulderToWrist)

        let shoulderToWristLengthSq =
            shoulderToWrist[0] * shoulderToWrist[0] +
            shoulderToWrist[1] * shoulderToWrist[1] +
            shoulderToWrist[2] * shoulderToWrist[2]

        let shoulderToWristLength = Math.sqrt(shoulderToWristLengthSq)

        let lowerArmLengthSq = this._lowerArmLengthSq
        let foreArmLengthSq = this._foreArmLengthSq
        let lowerTimesfore = this._lowerArmLength * this._foreArmLength

        // let toBendPoint

        let x = [0, 3, 0]
        let y = []

        let bendDir = [
            shoulderToWrist[1] * x[2] - shoulderToWrist[2] * x[1],
            shoulderToWrist[2] * x[0] - shoulderToWrist[0] * x[2],
            shoulderToWrist[0] * x[1] - shoulderToWrist[1] * x[0]
        ]

        let cos = -(lowerArmLengthSq + foreArmLengthSq - shoulderToWristLengthSq) / (2 * lowerTimesfore)
        let sin = Math.sqrt(1 - cos * cos)

        elbowMatrix[5] = cos
        elbowMatrix[6] = sin
        elbowMatrix[9] = -sin
        elbowMatrix[10] = cos

        cos = (shoulderToWristLengthSq + lowerArmLengthSq - foreArmLengthSq) / (2 * shoulderToWristLength * this._lowerArmLength)
        sin = Math.sqrt(1 - cos * cos)

        let tmp = new Array(9)

        tmp[3] = shoulderToWrist[0] / shoulderToWristLength
        tmp[4] = shoulderToWrist[1] / shoulderToWristLength
        tmp[5] = shoulderToWrist[2] / shoulderToWristLength

        let length = bendDir[0] * bendDir[0] + bendDir[1] * bendDir[1] + bendDir[2] * bendDir[2]
        length = Math.sqrt(length)

        tmp[0] = bendDir[0] / length
        tmp[1] = bendDir[1] / length
        tmp[2] = bendDir[2] / length

        // shoulderMatrix[4] = cos
        // shoulderMatrix[5] = sin
        // shoulderMatrix[6] = 0

        // let inner = x[0] * shoulderMatrix[4] + x[1] * shoulderMatrix[5] + x[2] * shoulderMatrix[6]
        // x[0] -= inner * shoulderMatrix[4]
        // x[1] -= inner * shoulderMatrix[5]
        // x[2] -= inner * shoulderMatrix[6]
        // inner = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2])

        // shoulderMatrix[0] = x[0] / inner
        // shoulderMatrix[1] = x[1] / inner
        // shoulderMatrix[2] = x[2] / inner

        tmp[6] = tmp[1] * tmp[5] - tmp[2] * tmp[4]
        tmp[7] = tmp[2] * tmp[3] - tmp[0] * tmp[5]
        tmp[8] = tmp[0] * tmp[4] - tmp[1] * tmp[3]

        let be = this.worldInverse.elements

        let b11 = tmp[0], b12 = tmp[3] * cos + tmp[6] * -sin, b13 = tmp[3] * sin + tmp[6] * cos;
        let b21 = tmp[1], b22 = tmp[4] * cos + tmp[7] * -sin, b23 = tmp[4] * sin + tmp[7] * cos;
        let b31 = tmp[2], b32 = tmp[5] * cos + tmp[8] * -sin, b33 = tmp[5] * sin + tmp[8] * cos;

        let a11 = be[0], a12 = be[4], a13 = be[8];
        let a21 = be[1], a22 = be[5], a23 = be[9];
        let a31 = be[2], a32 = be[6], a33 = be[10];

        shoulderMatrix[0] = a11 * b11 + a12 * b21 + a13 * b31;
        shoulderMatrix[4] = a11 * b12 + a12 * b22 + a13 * b32;
        shoulderMatrix[8] = a11 * b13 + a12 * b23 + a13 * b33;

        shoulderMatrix[1] = a21 * b11 + a22 * b21 + a23 * b31;
        shoulderMatrix[5] = a21 * b12 + a22 * b22 + a23 * b32;
        shoulderMatrix[9] = a21 * b13 + a22 * b23 + a23 * b33;

        shoulderMatrix[2] = a31 * b11 + a32 * b21 + a33 * b31;
        shoulderMatrix[6] = a31 * b12 + a32 * b22 + a33 * b32;
        shoulderMatrix[10] = a31 * b13 + a32 * b23 + a33 * b33;

        // let matrix = this.worldInverse.clone()
        // this.shoulder.matrix.premultiply(matrix)
        // console.log(...this.shoulder.matrix.elements)
        // console.log(...this.worldInverse.elements)

    }

}
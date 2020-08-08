import CameraFitter from './CameraFitter.js'

const container = document.getElementById("container")
const canvas = container.firstElementChild

const width = container.clientWidth
const height = container.clientHeight

canvas.width = width
canvas.height = height

const camera = new THREE.PerspectiveCamera(30, width / height, 10, 100)
camera.position.set(10, 10, 10)
camera.lookAt(0, 0, 0)

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ canvas: canvas })

const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xaaaaaa, 0.9)
directionalLight.position.set(0, 100, 40)
scene.add(directionalLight)

const material = new THREE.MeshLambertMaterial()
const geometry = new THREE.BoxGeometry(10, 12, 14)

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableZoom = false
controls.enablePan = false

const cameraFitter = new CameraFitter(camera)
geometry.computeBoundingBox()
cameraFitter.targetBox = geometry.boundingBox

cameraFitter.fitCamera()
renderer.render(scene, camera)

controls.addEventListener('change', function () {
    cameraFitter.fitCamera()
    renderer.render(scene, camera)
})

window.addEventListener('resize', function () {
    const width = document.body.clientWidth
    const height = document.body.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    cameraFitter.fitCamera()
    renderer.render(scene, camera)
})




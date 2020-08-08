// targetBoxが収まるようにカメラの奥行きを調整するクラス
export default class CameraFitter {

    constructor(camera) {

        this.camera = camera

        this._targetBox = new THREE.Box3() // 画面に収めるべき領域
        this._targetCenter = new THREE.Vector3() // その領域の中心

        // 最終的にtargetCenterから見たカメラ位置が格納される。
        // 球座標系だと radius だけの変更で済むので計算が楽
        this.spherical = new THREE.Spherical()
    }

    set targetBox(value) {

        this._targetBox = value
        this._targetBox.getCenter(this._targetCenter)

    }

    fitCamera() {

        const targetToCamera = new THREE.Vector3()
        const farthestPoint = new THREE.Vector3() // スクリーン座標中心から最も遠い点

        this.camera.lookAt(this._targetCenter)

        { // 1. スクリーン座標の中心からみて最も遠い点を求める
            let max = -Infinity, maxIndex = 0
            let point = new THREE.Vector3()

            for (let i = 0; i < 8; i++) {

                point.set(
                    i & 0b100 ? this._targetBox.max.x : this._targetBox.min.x,
                    i & 0b010 ? this._targetBox.max.y : this._targetBox.min.y,
                    i & 0b001 ? this._targetBox.max.z : this._targetBox.min.z,
                ).sub(this._targetCenter).project(this.camera)

                let pointMax = Math.max(point.x, point.y, -point.x, -point.y)

                if (pointMax >= max) {
                    max = pointMax
                    maxIndex = i
                }
            }

            farthestPoint.set(
                maxIndex & 0b100 ? this._targetBox.max.x : this._targetBox.min.x,
                maxIndex & 0b010 ? this._targetBox.max.y : this._targetBox.min.y,
                maxIndex & 0b001 ? this._targetBox.max.z : this._targetBox.min.z,
            )
        }

        // 2.スクリーンから一番遠い点が画面内に収まるように奥行きを調整する
        // 直方体からカメラに向かう単位ベクトル
        targetToCamera.subVectors(this.camera.position, this._targetCenter).normalize()

        // 直方体→カメラベクトルに射影
        const farthestPointProjected = new THREE.Vector3()
        farthestPointProjected.copy(farthestPoint).projectOnVector(targetToCamera)

        farthestPoint
            .sub(farthestPointProjected) // 原点を通るスクリーンに並行な面に移動する
            .project(this.camera)

        const scale = Math.max(farthestPoint.x, farthestPoint.y, -farthestPoint.x, -farthestPoint.y)

        // 結果を格納
        this.spherical.setFromCartesianCoords(
            this.camera.position.x - this._targetCenter.x,
            this.camera.position.y - this._targetCenter.y,
            this.camera.position.z - this._targetCenter.z,
        )
        this.spherical.radius = (this.spherical.radius * scale) + farthestPointProjected.length()

        // 球座標から元に戻す
        this.camera.position
            .setFromSpherical(this.spherical)
            .add(this._targetCenter)

    }

}
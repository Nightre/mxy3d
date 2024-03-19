import { MATRIX_TYPE } from "./const"
import MatrixStack from "./matrixStack"
import override from "./override"

class ViewMatrix {
    // eye = [0, 50, 500]
    // target = [0, 0, 0]
    // up = [0, 1, 0]
    matrix
    constructor(twgl) {
        this.twgl = twgl
        this.matrix = this.twgl.m4.identity()
    }
    // update(projectionMatrix, time) {
    //     const m4 = this.twgl.m4;

    //     const camera = m4.lookAt(this.eye, this.target, this.up);
    //     const viewMatrix = m4.inverse(camera);
    //     const world = m4.rotationY(time);
    //     m4.multiply(projectionMatrix, viewMatrix, viewMatrix);
    //     m4.multiply(viewMatrix, world, viewMatrix);
    //     return viewMatrix
    // }
    lookAt(eye, target, up) {
        const m4 = this.twgl.m4
        const camera = m4.lookAt(eye, target, up);
        this.matrix = m4.inverse(camera);
    }

}

class MatrixMannager {
    constructor(runtime) {
        this.time = 0

        this.runtime = runtime
        this.renderer = runtime.renderer
        this.twgl = this.renderer.exports.twgl

        this.threeDrawables = new Set

        this.initWebgl()
        override(this)

        this.matrixStack = new MatrixStack(this.twgl)
        this.viewMatrix = new ViewMatrix(this.twgl)
        this.projectionMatrix = this.initProjections() // 投影矩阵
        this.vpm
        window.t = this
    }
    // customizedProjection
    get modelMat() {
        return this.matrixStack.matrix
    }
    set modelMat(v) {
        this.matrixStack.matrix = v
    }


    getMatrixData(matrixType) {
        switch (matrixType) {
            case MATRIX_TYPE.MATRIX_STACK:
                return this.matrixStack.matrix
            case MATRIX_TYPE.VIEW:
                return this.viewMatrix.matrix
            default:
                throw new Error("Invalid MATRIX_TYPE value")
        }
    }
    setMatrixData(matrixType, data) {
        switch (matrixType) {
            case MATRIX_TYPE.MATRIX_STACK:
                this.matrixStack.matrix = data
                break;
            case MATRIX_TYPE.VIEW:
                this.viewMatrix.matrix = data
                break;
            default:
                throw new Error("Invalid MATRIX_TYPE value")
        }
    }

    initWebgl() {
        /**@type {WebGLRenderingContext} */
        const gl = this.renderer.gl
        gl.enable(gl.DEPTH_TEST);
        //
        gl.depthFunc(gl.LESS)
        //gl.enable(gl.CULL_FACE);

        //gl.enable(gl.CULL_FACE);
    }

    //////////////////////////////////////////////////////////////////////////////
    // 投影矩阵操作 TODO:加个projection view dirty

    updateMatrix() {
        //this.viewMatrix.eye[1] = this.time
        const m4 = this.twgl.m4
        this.vpm = m4.multiply(this.projectionMatrix, this.viewMatrix.matrix);

        this.renderer.dirty = true
    }

    initProjections() {
        const r = this.renderer
        this.setStageSize(r._xLeft, r._xRight, r._yBottom, r._yTop)
        return this.projectionMatrix
    }
    setStageSize(xLeft, xRight, yBottom, yTop) {
        const fovy = Math.PI / 4; // 视野角度，这里使用了默认值
        const aspect = (xRight - xLeft) / (yTop - yBottom); // 宽高比
        const near = 1; // 近裁剪面的距离
        const far = 1000; // 远裁剪面的距离 TODO:提供一个设置
        // const sp = this.renderer._projection
        // // scratch projection的远裁面是 -1~1 所以 1*1 = 1 就是最远的了
        // this.twgl.m4.translate(sp, [0, 0, 1], sp)
        this.projectionMatrix = this.twgl.m4.perspective(fovy, aspect, near, far);
    }
    updateDrawablesProjections() {
        this.updateMatrix()
        this.threeDrawables.forEach((drawable) => {
            if (this.renderer._drawList.includes(drawable._id)) {
                drawable.customizedProjection = this.vpm
            }else{
                this.threeDrawables.delete(drawable)
            }
        })
    }

    ////////////////////////////////////////////////////////////////////////////

    identityMatrix(matrixType) {
        const m4 = this.twgl.m4
        this.setMatrixData(matrixType, m4.identity())
    }
    inverseMatrix(matrixType) {
        const m4 = this.twgl.m4
        const mat = this.getMatrixData(matrixType)
        if (!mat) return
        return m4.inverse(mat)
    }
    // [scale[0] ?? 1, scale[1] ?? 1, scale[2] ?? 1]
    scaleMatrix(matrixType, scale) {
        const m4 = this.twgl.m4
        const mat = this.getMatrixData(matrixType)
        if (!mat) return

        m4.scale(mat, scale, mat)
    }

    rotateMatrix(matrixType, rotate) {
        const m4 = this.twgl.m4
        const mat = this.getMatrixData(matrixType)
        if (!mat) return
        m4.rotateX(mat, rotate[0], mat)
        m4.rotateY(mat, rotate[1], mat)
        m4.rotateZ(mat, rotate[2], mat)
    }

    translateMatrix(matrixType, translate) {
        const m4 = this.twgl.m4
        const mat = this.getMatrixData(matrixType)
        if (!mat) return
        m4.translate(mat, translate, mat)
    }

    setViewByEyeTargetUp(eye, target, up) {
        this.viewMatrix.lookAt(eye, target, up)
    }
}


export default MatrixMannager
import Scratch from "Scratch"
import MatrixMannager from "./3d";
import blockInfo from "./block/block";
import { MATRIX_TYPE, SHOW_TYPE } from "./const";
import { getCallerInfo, is4x4Matrix, standardV3 } from "./utils";

/**
 * 小项目，就不需要那么多讲究了，唔唔唔！
 * 
 * 实际上都是在操控矩阵实现的，scratch shader 中的是 P * M
 * 但是需要一个V，直接把P = P*V，然后就变成了 (P*V)*M = P*V*M （MVP）
 * 
 */
class HelloWorld {
    constructor(runtime) {
        this.runtime = runtime ?? Scratch.vm?.runtime
        if (!this.runtime) {
            return
        }
        this.matrix = new MatrixMannager(this.runtime)
    }
    // args.MATRIX_TYPE


    getInfo() {
        return blockInfo(Scratch)
    }

    setShowType(args, utils) {
        const { drawable } = getCallerInfo(utils)
        switch (args.SHOW_TYPE) {
            case SHOW_TYPE.THREED:
                this.matrix.threeDrawables.add(drawable)
                break;
            case SHOW_TYPE.TOWD:
                drawable.threeModelMat = undefined
                drawable.customizedProjection = undefined
                this.matrix.threeDrawables.delete(drawable)
                break;
            default:
                throw new Error("Invalid SHOW_TYPE value")
        }
        this.makeDirty(utils)
    }

    setDrawableModel(args, utils) {
        const { drawable } = getCallerInfo(utils)
        const mat = this.matrix.getMatrixData(args.MATRIX_TYPE)
        if (mat) {
            drawable.threeModelMat = mat
        }
        this.makeDirty(utils)
    }

    setDrawableModelByJSON(args, utils) {
        const { drawable } = getCallerInfo(utils)
        const mat = JSON.parse(args.MATRIX_DATA)
        if (is4x4Matrix(mat)) {
            drawable.threeModelMat = mat
        }
        this.makeDirty(utils)
    }

    saveMatrixStack(args, utils) {
        this.matrix.matrixStack.save()
        this.makeDirty(utils)
    }

    restoreMatrixStack(args, utils) {
        this.matrix.matrixStack.restore()
        this.makeDirty(utils)
    }

    clearMatrixStack(args, utils) {
        this.matrix.matrixStack.clear()
        this.makeDirty(utils)
    }

    resetTransformation(args, utils) {
        this.matrix.identityMatrix(args.MATRIX_TYPE)
        this.makeDirty(utils)
    }

    setTransformationByJSON(args, utils) {
        this.matrix.setMatrixData(args.MATRIX_TYPE, args.MATRIX_DATA)
        this.makeDirty(utils)
    }

    getMatrixStack(args, utils) {
        return JSON.stringify(this.matrix.modelMat)
    }

    inverseMatrix(args, utils) {
        return JSON.stringify(this.matrix.inverseMatrix(args.MATRIX_TYPE))
    }

    setLook(args, utils) {
        const eye = standardV3(JSON.parse(args.EYE), 0)
        const target = standardV3(JSON.parse(args.TARGET), 0)
        const up = standardV3(JSON.parse(args.UP), 0)
        this.matrix.setViewByEyeTargetUp(eye, target, up)
        this.makeDirty(utils)
    }

    scaleMatrix(args, utils) {
        const scale = JSON.parse(args.SCALE)
        this.matrix.scaleMatrix(args.MATRIX_TYPE, standardV3(scale, 1))
        this.makeDirty(utils)
    }

    rotateMatrix(args, utils) {
        const rotate = JSON.parse(args.ROTATE)
        this.matrix.rotateMatrix(args.MATRIX_TYPE, standardV3(rotate, 0))
        this.makeDirty(utils)
    }

    translateMatrix(args, utils) {
        const translate = JSON.parse(args.TRANSLATE)
        this.matrix.translateMatrix(args.MATRIX_TYPE, standardV3(translate, 0))
        this.makeDirty(utils)
    }

    makeDirty(utils) {
        const { drawable } = getCallerInfo(utils)
        drawable._transformDirty = true
        this.matrix.renderer.dirty = true
    }

    set2DZ(args, utils) {
        const { drawable } = getCallerInfo(utils)
        drawable.towDZ = args.Z
    }
}

Scratch.extensions.register(new HelloWorld());
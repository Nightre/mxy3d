import { MATRIX_TYPE, SHOW_TYPE } from "../const"

export default (Scratch) => {
    return {
        id: 'helloworld',
        name: 'It works!',
        blocks: [
            {
                opcode: "setShowType",
                text: "设置角色 [SHOW_TYPE] 3D",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    SHOW_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "SHOW_TYPE",
                    },
                }
            },
            {
                opcode: "set2DZ",
                text: "设置2D角色的Z为[Z]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    Z: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 0
                    },
                }
            },
            '---',
            {
                opcode: "setDrawableModel",
                text: "设置该精灵的模型矩阵的为 [MATRIX_TYPE]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                }
            },
            {
                opcode: "setDrawableModelByJSON",
                text: "直接设置该精灵的模型矩阵的为 [MATRIX_DATA]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_DATA: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]"
                    }
                }
            },
            {
                opcode: "setLook",
                text: "设置view矩阵为摄像机 眼睛:[EYE], 目标:[TARGET], 上方向:[UP]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    EYE: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[0,0,0]",
                    },
                    TARGET: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[0,0,0]",
                    },
                    UP: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[0,1,0]",
                    }
                }
            },
            {
                opcode: "setTransformationByJSON",
                text: "直接设置 [MATRIX_TYPE] [MATRIX_DATA]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                    MATRIX_DATA: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]"
                    }
                }
            },
            '---',
            {
                opcode: "saveMatrixStack",
                text: "保存变换堆叠",
                blockType: Scratch.BlockType.COMMAND,
            },
            {
                opcode: "restoreMatrixStack",
                text: "恢复变换堆叠",
                blockType: Scratch.BlockType.COMMAND,
            },
            {
                opcode: "clearMatrixStack",
                text: "清除变换堆叠",
                blockType: Scratch.BlockType.COMMAND,
            },
            '---',
            {
                opcode: "resetTransformation",
                text: "重置（单位化）[MATRIX_TYPE]变换",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                }
            },
            {
                opcode: "getMatrixStack",
                text: "矩阵堆叠的最前矩阵",
                blockType: Scratch.BlockType.REPORTER,
            },
            {
                opcode: "inverseMatrix",
                text: "逆矩阵 [MATRIX_TYPE]",
                blockType: Scratch.BlockType.REPORTER,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                }
            },
            '---',
            {
                opcode: "scaleMatrix",
                text: "缩放 [MATRIX_TYPE] [SCALE]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                    SCALE: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[1,1,1]"
                    }
                }
            },
            {
                opcode: "rotateMatrix",
                text: "旋转 [MATRIX_TYPE] [ROTATE]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                    ROTATE: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[0,0,0]"
                    }
                }
            },
            {
                opcode: "translateMatrix",
                text: "平移 [MATRIX_TYPE] [TRANSLATE]",
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    MATRIX_TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "MATRIX_TYPE",
                    },
                    TRANSLATE: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[0,0,0]"
                    }
                }
            },
        ],
        menus: {
            MATRIX_TYPE: {
                items: [
                    {
                        value: MATRIX_TYPE.MATRIX_STACK,
                        text: "矩阵堆叠上层矩阵",
                    },
                    {
                        value: MATRIX_TYPE.VIEW,
                        text: "view 矩阵",
                    },
                ],
            },
            SHOW_TYPE: {
                items: [
                    {
                        value: SHOW_TYPE.THREED,
                        text: "开启",
                    },
                    {
                        value: SHOW_TYPE.TOWD,
                        text: "关闭",
                    },
                ],
            },
        }
    }
}
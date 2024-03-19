export const getCallerInfo = (u) => {
    return {
        target: u.target,
        sprite: u.target.sprite,
        drawable: u.runtime.renderer._allDrawables[u.target.drawableID],
    };
};

export const is4x4Matrix = (matrix) => {
    // TODO: 貌似有问题，9999 测试
    if (!Array.isArray(matrix) || matrix.length !== 4) {
        return false;
    }

    for (let i = 0; i < 4; i++) {
        if (!Array.isArray(matrix[i]) || matrix[i].length !== 4) {
            return false;
        }

        for (let j = 0; j < 4; j++) {
            if (typeof matrix[i][j] !== 'number') {
                return false;
            }
        }
    }

    return true;
}

export const standardV3 = (v, defaultValue) => {
    return [v[0] ?? defaultValue , v[1] ?? defaultValue , v[2] ?? defaultValue ]
}
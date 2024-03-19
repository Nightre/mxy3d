
// import spriteVert from "./shader/sprite.vert"
// import spriteFrag from "./shader/sprite.frag"


const override = (matrixMannager) => {
    const renderer = matrixMannager.renderer
    const twgl = matrixMannager.twgl

    const oldSetStageSize = renderer.setStageSize
    /** @type {WebGLRenderingContext} */
    const gl = renderer.gl

    renderer.setStageSize = function () {
        // setStageSize 修改 projection 矩阵
        oldSetStageSize.call(this, ...arguments)
        matrixMannager.setStageSize(arguments)
    }
    const oldDraw = renderer.draw
    renderer.draw = function () {
        if (this.dirty) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            matrixMannager.updateDrawablesProjections()
        }
        oldDraw.call(this, ...arguments)
    }


    const Drawable = renderer.exports.Drawable
    const oldCalculateTransform = Drawable.prototype._calculateTransform
    Drawable.prototype._calculateTransform = function () {
        // 原先scratch不会重置，3维基向量加工必须手动
        const modelMatrix = this._uniforms.u_modelMatrix;
        oldCalculateTransform.call(this);
        if (this.threeModelMat) {
            modelMatrix[2] = 0;
            modelMatrix[3] = 0;
            modelMatrix[6] = 0;
            modelMatrix[7] = 0;
            modelMatrix[8] = 0;
            modelMatrix[9] = 0;
            modelMatrix[10] = 1;
            modelMatrix[11] = 0;
            modelMatrix[14] = 0;
            modelMatrix[15] = 1;
            twgl.m4.multiply(
                this.threeModelMat,
                modelMatrix,
                modelMatrix
            )
        }
        if(this.towDZ){
            debugger
            modelMatrix[14] = this.towDZ;
        }
    }

    renderer._drawThese = function (drawables, drawMode, projection, opts = {}) {
        /**@type {WebGL2RenderingContext} */
        const gl = this._gl;
        let currentShader = null;
        const framebufferSpaceScaleDiffers = (
            'framebufferWidth' in opts && 'framebufferHeight' in opts &&
            opts.framebufferWidth !== this._nativeSize[0] && opts.framebufferHeight !== this._nativeSize[1]
        );

        const numDrawables = drawables.length;
        for (let drawableIndex = 0; drawableIndex < numDrawables; ++drawableIndex) {
            const drawableID = drawables[drawableIndex];

            // If we have a filter, check whether the ID fails
            if (opts.filter && !opts.filter(drawableID)) continue;

            const drawable = this._allDrawables[drawableID];
            /** @todo check if drawable is inside the viewport before anything else */

            // Hidden drawables (e.g., by a "hide" block) are not drawn unless
            // the ignoreVisibility flag is used (e.g. for stamping or touchingColor).
            if (!drawable.getVisible() && !opts.ignoreVisibility) continue;

            // drawableScale is the "framebuffer-pixel-space" scale of the drawable, as percentages of the drawable's
            // "native size" (so 100 = same as skin's "native size", 200 = twice "native size").
            // If the framebuffer dimensions are the same as the stage's "native" size, there's no need to calculate it.
            const drawableScale = framebufferSpaceScaleDiffers ? [
                drawable.scale[0] * opts.framebufferWidth / this._nativeSize[0],
                drawable.scale[1] * opts.framebufferHeight / this._nativeSize[1]
            ] : drawable.scale;

            // If the skin or texture isn't ready yet, skip it.
            if (!drawable.skin || !drawable.skin.getTexture(drawableScale)) continue;

            // Skip private skins, if requested.
            if (opts.skipPrivateSkins && drawable.skin.private) continue;

            const uniforms = {};

            let effectBits = drawable.enabledEffects;
            effectBits &= Object.prototype.hasOwnProperty.call(opts, 'effectMask') ? opts.effectMask : effectBits;
            const newShader = this._shaderManager.getShader(drawMode, effectBits);

            // Manually perform region check. Do not create functions inside a
            // loop.
            if (this._regionId !== newShader) {
                this._doExitDrawRegion();
                this._regionId = newShader;

                currentShader = newShader;
                gl.useProgram(currentShader.program);
                twgl.setBuffersAndAttributes(gl, currentShader, this._bufferInfo);
                // Object.assign(uniforms, {
                //     u_projectionMatrix: projection
                // });
            }

            if (drawable.customizedProjection && drawMode !== 'straightAlpha') {
                Object.assign(uniforms, {
                    u_projectionMatrix: drawable.customizedProjection
                });
            } else {
                Object.assign(uniforms, {
                    u_projectionMatrix: projection
                });
            }

            Object.assign(uniforms,
                drawable.skin.getUniforms(drawableScale),
                drawable.getUniforms());

            // Apply extra uniforms after the Drawable's, to allow overwriting.
            if (opts.extraUniforms) {
                Object.assign(uniforms, opts.extraUniforms);
            }

            if (uniforms.u_skin) {
                twgl.setTextureParameters(
                    gl, uniforms.u_skin, {
                    minMag: drawable.skin.useNearest(drawableScale, drawable) ? gl.NEAREST : gl.LINEAR
                }
                );
            }

            twgl.setUniforms(currentShader, uniforms);
            twgl.drawBufferInfo(gl, this._bufferInfo, gl.TRIANGLES);
        }

        this._regionId = null;

    }

    // const sm = renderer._shaderManager
    // const ShaderManager = Object.getPrototypeOf(sm)


    // /**
    //  * The available draw modes.
    //  * @readonly
    //  * @enum {string}
    //  */
    // ShaderManager.DRAW_MODE = {
    //     /**
    //      * Draw normally. Its output will use premultiplied alpha.
    //      */
    //     default: 'default',

    //     /**
    //      * Draw with non-premultiplied alpha. Useful for reading pixels from GL into an ImageData object.
    //      */
    //     straightAlpha: 'straightAlpha',

    //     /**
    //      * Draw a silhouette using a solid color.
    //      */
    //     silhouette: 'silhouette',

    //     /**
    //      * Draw only the parts of the drawable which match a particular color.
    //      */
    //     colorMask: 'colorMask',

    //     /**
    //      * Draw a line with caps.
    //      */
    //     line: 'line',

    //     /**
    //      * Draw the background in a certain color. Must sometimes be used instead of gl.clear.
    //      */
    //     background: 'background'
    // };

    // ShaderManager.EFFECT_INFO = {
    //     /** Color effect */
    //     color: {
    //         uniformName: 'u_color',
    //         mask: 1 << 0,
    //         converter: x => (x / 200) % 1,
    //         shapeChanges: false
    //     },
    //     /** Fisheye effect */
    //     fisheye: {
    //         uniformName: 'u_fisheye',
    //         mask: 1 << 1,
    //         converter: x => Math.max(0, (x + 100) / 100),
    //         shapeChanges: true
    //     },
    //     /** Whirl effect */
    //     whirl: {
    //         uniformName: 'u_whirl',
    //         mask: 1 << 2,
    //         converter: x => -x * Math.PI / 180,
    //         shapeChanges: true
    //     },
    //     /** Pixelate effect */
    //     pixelate: {
    //         uniformName: 'u_pixelate',
    //         mask: 1 << 3,
    //         converter: x => Math.abs(x) / 10,
    //         shapeChanges: true
    //     },
    //     /** Mosaic effect */
    //     mosaic: {
    //         uniformName: 'u_mosaic',
    //         mask: 1 << 4,
    //         converter: x => {
    //             x = Math.round((Math.abs(x) + 10) / 10);
    //             /** @todo cap by Math.min(srcWidth, srcHeight) */
    //             return Math.max(1, Math.min(x, 512));
    //         },
    //         shapeChanges: true
    //     },
    //     /** Brightness effect */
    //     brightness: {
    //         uniformName: 'u_brightness',
    //         mask: 1 << 5,
    //         converter: x => Math.max(-100, Math.min(x, 100)) / 100,
    //         shapeChanges: false
    //     },
    //     /** Ghost effect */
    //     ghost: {
    //         uniformName: 'u_ghost',
    //         mask: 1 << 6,
    //         converter: x => 1 - (Math.max(0, Math.min(x, 100)) / 100),
    //         shapeChanges: false
    //     }
    // };
    // ShaderManager.EFFECTS = Object.keys(ShaderManager.EFFECT_INFO);

    // ShaderManager._buildShader = function (drawMode, effectBits) {
    //     const numEffects = ShaderManager.EFFECTS.length;

    //     const defines = [
    //         `#define DRAW_MODE_${drawMode}`
    //     ];
    //     for (let index = 0; index < numEffects; ++index) {
    //         if ((effectBits & (1 << index)) !== 0) {
    //             defines.push(`#define ENABLE_${ShaderManager.EFFECTS[index]}`);
    //         }
    //     }

    //     const definesText = `${defines.join('\n')}\n`;

    //     /* eslint-disable global-require */
    //     const vsFullText = definesText + spriteVert;
    //     const fsFullText = definesText + spriteFrag;
    //     /* eslint-enable global-require */

    //     return twgl.createProgramInfo(this._gl, [vsFullText, fsFullText]);
    // }
    // sm._shaderCache = {};
    // for (const modeName in ShaderManager.DRAW_MODE) {
    //     if (Object.prototype.hasOwnProperty.call(ShaderManager.DRAW_MODE, modeName)) {
    //         sm._shaderCache[modeName] = [];
    //     }
    // }
}

export default override
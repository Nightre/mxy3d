class MatrixStack {
    constructor(twgl) {
        this.stack = [];
        this.matrix = twgl.m4.identity();
        this.twgl = twgl;
    }

    clear() {
        this.stack = []
        this.matrix = this.twgl.m4.identity();
    }

    restore() {
        if (this.stack.length > 0) {
            this.matrix = this.stack.pop();
        } else {
            console.warn("Matrix stack is empty, cannot restore");
        }
    }

    save() {
        this.stack.push(this.matrix);
        this.matrix = this.twgl.m4.copy(this.matrix);
    }
}

export default MatrixStack
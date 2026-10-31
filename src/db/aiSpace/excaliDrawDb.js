import Dexie from 'dexie';

class ExcaliDrawDb {
    constructor() {
        this.db = new Dexie('aiSpace-excaliDraw');
        this.db.version(2).stores({
            canvasData: 'id',
        });
    }

    async saveCanvasData(data) {
        try {
            await this.db.canvasData.clear()
            await this.db.canvasData.put({ id: 'currentCanvas', data });
        } catch (error) {
            console.error('保存画布数据失败:', error);
        }
    }

    async loadCanvasData() {
        return await this.db.canvasData.get('currentCanvas');
    };

}

export default ExcaliDrawDb;
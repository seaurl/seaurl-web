import Dexie from 'dexie';

class BpmnDb {
    constructor() {
        this.db = new Dexie('aiSpace-bpmn');
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

    // async setChooseCity(obj) {
    //     try {
    //         await this.db.chooseCity.clear()
    //         await this.db.chooseCity.add(obj);
    //     } catch (error) {
    //         console.error('Error adding weather data:', error);
    //     }
    // }
    //
    // async getChooseCity() {
    //     try {
    //         const data = await this.db.chooseCity.toCollection().first(); // 无论数据量多少都返回第一条
    //         console.log('getChooseCity data:', data);
    //         return data;
    //     } catch (error) {
    //         console.error('Error fetching originList data:', error);
    //         return [];
    //     }
    // }

}

export default BpmnDb;
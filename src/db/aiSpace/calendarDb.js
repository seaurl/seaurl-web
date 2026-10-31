import Dexie from 'dexie';

class CalendarDb {
    constructor() {
        this.db = new Dexie('aiSpace-calendar');
        this.db.version(2).stores({
            holidays: 'id, year',
        });
    }

    async saveData(year, list) {
        try {
            await this.db.holidays.clear()
            await this.db.holidays.put({
                id: year,      // 直接使用年份作为ID
                year: year,
                list: list
            });
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    // 获取某年假日数据
    async getHolidays(year) {
        return await this.db.holidays.get(year);
    }

    // 获取全部数据（调试用）
    async getAll() {
        return this.db.holidays.toArray();
    }

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

export default CalendarDb;
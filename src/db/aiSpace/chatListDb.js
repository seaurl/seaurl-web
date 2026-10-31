import Dexie from 'dexie';

class WeatherDb {
    constructor() {
        this.db = new Dexie('aiSpace-weather');
        this.db.version(1).stores({
            originList: 'usedId, updatedDt',
            chatAiList: 'id, updatedDt',
            chooseCity: 'id',
            cityWeatherIn24Hours: '++id',
            cityWeatherIn30d: '++id',
            chooseCityWeatherOneOfDay: '++id',
        });
    }

    async setChooseCity(obj) {
        try {
            await this.db.chooseCity.clear()
            await this.db.chooseCity.add(obj);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    async getChooseCity() {
        try {
            const data = await this.db.chooseCity.toCollection().first(); // 无论数据量多少都返回第一条
            console.log('getChooseCity data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }

}

export default WeatherDb;
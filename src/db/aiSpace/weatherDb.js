import Dexie from 'dexie';

class WeatherDb {
    constructor() {
        this.db = new Dexie('aiSpace-weather');
        this.db.version(1).stores({
            originList: 'id, updatedDt',
            targetList: 'id, updatedDt',
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

    async setChooseCityWeatherOneOfDay(obj) {
        try {
            await this.db.chooseCityWeatherOneOfDay.clear()
            await this.db.chooseCityWeatherOneOfDay.add(obj);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    async getChooseCityWeatherOneOfDay() {
        try {
            const data = await this.db.chooseCityWeatherOneOfDay.toCollection().first()
            console.log('getChooseCityWeatherOneOfDay data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }

    async setCityWeatherIn24Hours(list) {
        try {
            await this.db.cityWeatherIn24Hours.clear()
            await this.db.cityWeatherIn24Hours.bulkPut(list);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    async getCityWeatherIn24Hours() {
        try {
            const data = await this.db.cityWeatherIn24Hours.toArray();
            console.log('All getCityWeatherIn24Hours data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }

    async setCityWeatherIn30d(list) {
        try {
            await this.db.cityWeatherIn30d.clear()
            await this.db.cityWeatherIn30d.bulkPut(list);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    async getCityWeatherIn30d() {
        try {
            const data = await this.db.cityWeatherIn30d.toArray();
            console.log('All getCityWeatherIn24Hours data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }

    // 添加天气数据
    async setOriginList(list) {
        try {
            await this.db.originList.clear()
            await this.db.originList.bulkPut(list);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    // 获取所有天气数据
    async getOriginList() {
        try {
            const data = await this.db.originList.orderBy('updatedDt').reverse().toArray();
            console.log('All originList data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }

    async setTargetList(list) {
        try {
            await this.db.targetList.clear()
            await this.db.targetList.bulkPut(list);
        } catch (error) {
            console.error('Error adding weather data:', error);
        }
    }

    async getTargetList() {
        try {
            const data = await this.db.targetList.orderBy('updatedDt').reverse().toArray();
            console.log('All originList data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching originList data:', error);
            return [];
        }
    }
}

export default WeatherDb;
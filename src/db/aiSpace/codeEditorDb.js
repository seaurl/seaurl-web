import Dexie from 'dexie';

// 代码片段操作类
class SnippetManager {
    constructor() {
        this.db = new Dexie('aiSpace-codeEditor');
        this.db.version(1).stores({
            snippets: '++id, fileId, fileName, fileContent, language, createdAt, updatedAt',
            tabs: '++id, fileId, fileName, fileContent, language, createdAt, updatedAt,sortIndex'
        });
    }
    /**
     * 添加代码片段
     * @param {Object} snippet - 代码片段对象
     * @param {string} snippet.name - 代码标题
     * @param {string} snippet.content - 代码内容
     * @param {string} snippet.language - 编程语言
     * @returns {Promise} 新创建的代码片段（包含id）
     */
    async addSnippet(snippet) {
        const now = new Date();
        const newSnippet = {
            ...snippet,
            createdAt: now,
            updatedAt: now
        };

        const id = await this.db.snippets.add(newSnippet);
        return { ...newSnippet, id };
    }

    async addTab(tab) {
        const now = new Date();
        const newSnippet = {
            ...tab,
            createdAt: now,
            updatedAt: now
        };

        const id = await this.db.tabs.add(newSnippet);
        return { ...newSnippet, id };
    }

    /**
     * 获取所有代码片段
     * @returns {Promise} 代码片段数组
     */
    async getAllSnippets() {
        return this.db.snippets.toArray();
    }

    async getAllTabs() {
        return this.db.tabs.orderBy('sortIndex').toArray();
    }

    async resetTabs(newTabs) {
        // 首先清空现有的tabs表
        await this.db.tabs.clear();

        // 获取当前时间用于所有新tab的创建和更新时间
        const now = new Date();

        // 为每个新tab添加时间戳并插入数据库
        const tabsWithTimestamps = newTabs.map((tab, index) => ({
            ...tab,
            sortIndex: index,  // 显式存储顺序
        }));

        // 批量添加新的tabs
        await this.db.tabs.bulkAdd(tabsWithTimestamps);

        // 返回新的tabs列表（包含生成的id）
        return this.getAllTabs();
    }

    /**
     * 按ID获取单个代码片段
     * @param {number} id - 代码片段ID
     * @returns {Promise} 代码片段或undefined
     */
    async getSnippet(id) {
        return this.db.snippets.get(id);
    }

    async getTab(id) {
        return this.db.tabs.get(id);
    }

    /**
     * 更新代码片段
     * @param {number} fileId - 要更新的代码片段ID
     * @param {Object} updates - 更新内容
     * @returns {Promise} 更新后的完整代码片段
     */
    async updateSnippet(fileId, updateData) {
        try {
            // 更新所有匹配 fileId 的记录
            const updatedCount = await this.db.snippets
                .where('fileId')
                .equals(fileId)
                .modify(updateData);

            if (updatedCount === 0) {
                console.warn(`没有找到 fileId=${fileId} 的记录`);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`更新 fileId=${fileId} 的记录失败:`, error);
            throw error;
        }
    }

    /**
     * 删除代码片段
     * @param {number} id - 要删除的代码片段ID
     */
    async deleteSnippet(id) {
        await this.db.snippets.delete(id);
    }

    async deleteTab(id) {
        await this.db.tabs.delete(id);
    }

    async deleteSnippetByFileId(fileId) {
        try {
            await this.db.snippets.where('fileId').equals(fileId).delete();
            console.log(`fileId 为 ${fileId} 的数据已删除`);
        } catch (error) {
            console.error('删除数据失败:', error);
        }
    }

    /**
     * 按语言筛选代码片段
     * @param {string} language - 编程语言
     * @returns {Promise} 匹配的代码片段数组
     */
    async filterByLanguage(language) {
        return this.db.snippets
            .where('language')
            .equalsIgnoreCase(language)
            .toArray();
    }

    /**
     * 按标题搜索代码片段
     * @param {string} keyword - 搜索关键词
     * @returns {Promise} 匹配的代码片段数组
     */
    async searchByTitle(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.db.snippets
            .filter(snippet =>
                snippet.title.toLowerCase().includes(lowerKeyword)
            )
            .toArray();
    }

    /**
     * 清空所有代码片段
     */
    async clearAll() {
        await this.db.snippets.clear();
    }
}

export default SnippetManager;

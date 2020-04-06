<template>
    <div id="resourceCnter">
        <el-input
            placeholder="请输入搜索关键字"
            v-model="searchKeyword"
            clearable
            width="300"
            @input="searchKeywordChange">
        </el-input>
        <el-select v-model="searchType" placeholder="请选择搜索类型" @change="searchTypeChange">
            <el-option
                v-for="item in searchOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        <el-table
            :data="listData"
            stripe
            style="width: 100%">
            <el-table-column
                prop="name"
                label="资源名称">
            </el-table-column>
            <el-table-column
                prop="teacher"
                label="上传教师"
                width="180">
            </el-table-column>
            <el-table-column
                label="上传时间"
                width="180">
                <template slot-scope="scope">
                    {{ scope.row.create_time | getTime }}
                </template>
            </el-table-column>
            <el-table-column
                width="180"
                label="操作">
                <template slot-scope="scope">
                    <a :href="scope.row.address" class="download" download>下载</a>
                    <!-- <el-button type="primary" size="mini" @click="downloadResource(scope.row.address)">下载</el-button> -->
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="10"
                layout="prev, pager, next, jumper"
                :total="totalResource">
            </el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResourceCenter',
    data: function () {
        return {
            listData: [],
            httpAddress: '/api',
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalResource: 0,
            searchKeyword: '',
            searchType: 'name',
            searchOptions: [
                {
                    value: 'name',
                    label: '资源名',
                    key: 'name'
                },
                {
                    value: 'teacher',
                    label: '教师名',
                    key: 'teacher'
                },
            ],
        }
    },
    filters: {
        getTime: function(val) {
            let date = new Date(parseInt(val));
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    },
    mounted: function() {
        this.getResource();
    },
    methods: {
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.getResource();
        },
        searchKeywordChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getResource();
        },
        searchTypeChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getResource();
        },
        downloadResource(url) {
            window.open(url, '__blank');
        },
        getResource() {
            this.$http.post(`${this.httpAddress}/research/getResource`, 
                {
                    page: this.page,
                    type: this.searchType,
                    keyword: this.searchKeyword
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.listData = data.data.data;
                        this.totalResource = data.data.total;
                        this.totalPage = Math.ceil(data.data.total / 10);
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                })
        },
    }
}
</script>

<style scoped>
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
.el-input {
    width: 300px;
    margin-right: 20px;
}
.download {
    display: inline-block;
    width: 56px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    background: #409EFF;
    border-radius: 4px;
    color: #ffffff;
}
</style>


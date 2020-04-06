<template>
    <div id="allCourse">
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
                prop="course_id"
                label="课程编号"
                width="180">
            </el-table-column>
            <el-table-column
                prop="course_name"
                label="课程名称">
            </el-table-column>
            <el-table-column
                prop="course_teacher"
                label="任教老师"
                width="120">
            </el-table-column>
            <el-table-column
                prop="study_class"
                width="180"
                label="教学班级">
            </el-table-column>
            <el-table-column
                prop="note"
                width="100"
                label="备注">
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="10"
                layout="prev, pager, next, jumper"
                :total="totalCourse">
            </el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AllCourse',
    props: {
        msg: String
    },
    data: function () {
        return {
            listData: [],
            httpAddress: '/api',
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalCourse: 0,
            searchKeyword: '',
            searchType: 'name',
            searchOptions: [
                {
                    value: 'name',
                    label: '课程名',
                    key: 'name'
                },
                {
                    value: 'teacher',
                    label: '教师名',
                    key: 'teacher'
                },
            ],
            // isDisabled: true,
        }
    },
    mounted: function() {
        this.$http.post(`${this.httpAddress}/research/getAllCourse`, {page: this.page})
            .then((res) => {
                let data = res.data;
                if (data.status == 0 && data.msg == 'ok') {
                    this.listData = data.data.data;
                    this.totalCourse = data.data.total;
                    this.totalPage = Math.ceil(data.data.total / 10);
                }
            })
            .catch((err) => {
                console.log('err', err);
            })
    },
    methods: {
        addCourse(row) {
            this.$http.get(`${this.httpAddress}/research/operateCourse`, {
                params: {
                    action: "add",
                    course_id: row.course_id,
                }
            }).then((res) => {
                let data = res.data;
                if (data.status == 0) {
                    this.$message({
                        message: '添加成功',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: data.msg,
                        type: 'warning'
                    });
                }
            }).catch((err) => {
                console.log('err', err);
            })
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.getCourse();
        },
        searchKeywordChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getCourse();
        },
        searchTypeChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getCourse();
        },
        getCourse() {
            this.$http.post(`${this.httpAddress}/research/searchCourse`, {
                    keyword: this.searchKeyword,
                    type: this.searchType,
                    page: this.page
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.listData = data.data.data;
                        this.totalCourse = data.data.total;
                        this.totalPage = Math.ceil(data.data.total / 10);
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                })
        },
        changeDisabled() {
            this.isDisabled = true;
        }
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
</style>

<template>
    <div id="setPeriod">
        <div class="newPeriod" v-if="canInputNewPeriod">
            <el-input
                class="inputNewPeriod"
                placeholder="请输入新学期代码（五位数字）"
                v-model="period"
                clearable>
            </el-input>
            <el-button type="primary" @click="setNewPeriod">开始初始化</el-button>
        </div>
        <div class="newCourseUrl" v-if="canInputUrl">
            <el-input
                class="inputUrl"
                placeholder="请输入教务在线的学院课程链接"
                v-model="inputUrl"
                clearable>
            </el-input>
            <el-button type="primary" @click="createNewCourse">导入课程</el-button>
            <el-button class="buttonComfirm" v-if="canComfirmNewCourse" type="success" @click="comfirmNewCourse">确认课程信息</el-button>
            <el-button class="buttonImport" v-if="canImportStudent" type="success" @click="importStudent">导入学生列表</el-button>
        </div>
        <div class="newCourseList" v-if="nowData.length > 0">
            <el-table
                :data="nowData"
                border
                style="width: 100%">
                <el-table-column
                    prop="course_id"
                    label="课程编号"
                    width="100">
                </el-table-column>
                <el-table-column
                    prop="course_name"
                    label="课程名">
                </el-table-column>
                <el-table-column
                    prop="study_class"
                    label="教学班"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="note"
                    label="备注"
                    width="120">
                </el-table-column>
                <el-table-column
                    prop="teacher_name"
                    label="教师"
                    width="100">
                </el-table-column>
                <el-table-column
                    label="教师编号"
                    width="150">
                    <template slot-scope="scope">
                        <span>{{ scope.row.teacher_id }}</span>
                        <el-button v-if="canEditTeacherId" class="buttonEditTeacherId" @click="editTeacherId(scope)" size="small">修改</el-button>
                    </template>
                </el-table-column>
                <el-table-column
                    label="学生名单"
                    width="100">
                    <template slot-scope="scope">
                        <div v-if="scope.row.isImport">
                            <el-button class="buttonViewStudentList" @click="viewStudentList(scope)" size="small">学生名单</el-button>
                        </div>
                        <div v-else>
                            待导入
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    @current-change="handleCurrentChange"
                    :current-page.sync="currentPage"
                    :page-size="10"
                    layout="prev, pager, next, jumper"
                    :total="totalCourse">
                </el-pagination>
            </div>
        </div>
        <el-dialog title="输入教师编号" :visible.sync="dialogEditTeacherIdVisible">
            <el-input
                placeholder="请输入教师编号"
                v-model="teacherId"
                clearable>
            </el-input>
            <el-button classsize="small" type="success" @click="comfirmTeacherId">确定</el-button>
        </el-dialog>
        <el-dialog title="学生名单" :visible.sync="dialogViewStudentListVisible" width="800px">
            <el-table
                :data="nowStudentList"
                style="width: 100%">
                <el-table-column
                    prop="username"
                    label="学号"
                    width="120">
                </el-table-column>
                <el-table-column
                    prop="name"
                    label="姓名"
                    width="100">
                </el-table-column>
                <el-table-column
                    prop="sex"
                    label="性别"
                    width="50">
                </el-table-column>
                <el-table-column
                    prop="class"
                    label="班级"
                    width="100">
                </el-table-column>
                <el-table-column
                    prop="major"
                    label="专业名">
                </el-table-column>
                <el-table-column
                    prop="academy"
                    label="学院"
                    width="120">
                </el-table-column>
                <el-table-column
                    prop="grade"
                    label="年级"
                    width="100">
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'SetPeriod',
    data: function () {
        return {
            httpAddress: '/api',
            period: '',
            listData: [],
            nowData: [],
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalCourse: 0,
            canInputNewPeriod: true, // 可以输入新学期
            // canInputNewPeriod: false,
            canInputUrl: false, // 可以输入教务在线链接
            // canInputUrl: true,
            canComfirmNewCourse: false, // 可以确认新学期课程
            canImportStudent: false, // 可以开始导入学生名单
            // canImportStudent: true, 
            inputUrl: 'http://jwc.cqupt.edu.cn/kebiao/kb_yxh.php?yxh=03', // ''
            dialogEditTeacherIdVisible: false,
            canEditTeacherId: true,
            teacherId: '',
            editTeacherIdPosition: {},
            dialogViewStudentListVisible: false,
            studentList: {}, // 存储全部学生名单 ${course_id}_${study_class}
            nowStudentList: [], // 正在浏览的学生名单
        }
    },
    mounted: function () {

    },
    methods: {
        setNewPeriod() {
            this.$http.get(`${this.httpAddress}/research/createNewPeriod`, { params: { period: this.period } })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            message: '创建新学期成功',
                            type: 'success'
                        });
                        this.canInputUrl = true;
                        this.canInputNewPeriod = false;
                    } else {
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        createNewCourse() {
            let loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            this.$http.post(`${this.httpAddress}/research/createNewCourse`, { url: this.inputUrl })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.listData = data.data;
                        this.totalCourse = this.listData.length;
                        this.totalPage = Math.ceil(this.listData.length / 10);
                        this.nowData = this.listData.slice(0, 10);
                        this.canComfirmNewCourse = true;
                        loading.close();
                    } else {
                        loading.close();
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        });
                    }
                })
                .catch(err => {
                    loading.close();
                    console.log(err);
                })
        },
        editTeacherId(scope) {
            this.editTeacherIdPosition = {
                index: scope.$index,
                page: this.currentPage - 1,
            }
            this.dialogEditTeacherIdVisible = true;
        },
        viewStudentList(scope) {
            this.nowStudentList = this.studentList[`${scope.row.course_id}_${scope.row.study_class}`];
            console.log(this.nowStudentList);
            this.dialogViewStudentListVisible = true;
        },
        comfirmTeacherId() {
            if (this.teacherId != '') {
                let position = this.editTeacherIdPosition.page * 10 + this.editTeacherIdPosition.index;
                this.listData[position].teacher_id = this.teacherId;
            }
            this.teacherId = '';
            this.dialogEditTeacherIdVisible = false;
        },
        comfirmNewCourse() {
            this.$http.post(`${this.httpAddress}/research/comfirmNewCourse`, 
                {
                    course: this.listData
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.canImportStudent = true;
                        this.canEditTeacherId = false; // 不能再修改教师id
                        this.$message({
                            message: '确认成功',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        });
                    }
                })
                .catch(err => {
                    this.$message({
                        message: '确认失败',
                        type: 'warning'
                    });
                    console.log(err);
                })
        },
        importStudent() {
            this.importStudentOne();
        },
        async importStudentOne() {
            // this.listData.length
            let loading = this.$loading({
                lock: true,
                text: '正在逐个导入学生名单，请不要关闭或刷新页面！',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            for (let i = 0; i < this.listData.length; i++) {
                let result = await this.$http.post(`${this.httpAddress}/research/importStudentList`, 
                // let result = await this.$http.post(`/3000/research/importStudentList`, 
                    {
                        teacher_id: this.listData[i].teacher_id,
                        study_class: this.listData[i].study_class,
                        course_id: this.listData[i].course_id
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.listData[i].isImport = true;
                            this.$message({
                                message: `${this.listData[i].course_name}导入成功`,
                                type: 'success'
                            });
                            this.studentList[`${this.listData[i].course_id}_${this.listData[i].study_class}`] = data.data;
                            return data;
                        } else {
                            this.$message({
                                message: `${this.listData[i].course_name}${data.msg}`,
                                type: 'warning'
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
                console.log(result, i);
            }
            loading.close();
            this.$message({
                message: `新学期课程所有初始化成功，后续修改可在【课程管理】中进行`,
                type: 'success'
            });
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.nowData = this.listData.slice(this.page * 10, this.page * 10 + 10);
        },
        getNewCourse() {
            this.$http.post(`${this.httpAddress}/research/getNewCourse`, 
                {
                    page: this.page
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.listData = data.data;
                        this.totalCourse = data.data.total;
                        this.totalPage = Math.ceil(data.data.total / 10);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
    }
}
</script>

<style scoped>
.newPeriod {
    width: 400px;
    display: flex;
    margin-bottom: 20px;
}
.inputNewPeriod, .inputUrl {
    margin-right: 20px;
}
.newCourseUrl {
    /* width: 600px; */
    display: flex;
}
.inputUrl {
    width: 300px;
}
.newCourseList {
    margin-top: 10px;
}
.buttonEditTeacherId {
    margin-left: 10px;
}
.pagination {
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
#setPeriod .el-table {
    margin-top: 10px;
}
</style>
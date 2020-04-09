<template>
    <div id="manageCourse">
        <div class="searchClass">
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
            <el-select v-model="searchPeriod" clearable placeholder="请选择搜索学期" @change="searchTypeChange">
                <el-option
                    v-for="item in periodOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-button type="primary" @click="addNewCourse">添加课程</el-button>
        </div>
        <el-table
            :data="listData"
            border
            style="width: 100%">
            <el-table-column
                prop="course_id"
                label="课程编号"
                width="110">
            </el-table-column>
            <el-table-column
                prop="course_name"
                label="课程名称">
            </el-table-column>
            <el-table-column
                prop="course_teacher"
                label="任教老师"
                width="110">
            </el-table-column>
            <el-table-column
                prop="course_teacher_id"
                label="教师ID">
            </el-table-column>
            <el-table-column
                prop="study_class"
                width="150"
                label="教学班级">
            </el-table-column>
            <el-table-column
                prop="note"
                width="100"
                label="备注">
            </el-table-column>
            <el-table-column
                width="180"
                label="学生名单">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-document" @click="viewStudentList(scope)" size="mini"></el-button>
                    <el-tooltip class="item" effect="dark" content="从教务在线导入" placement="top-start">
                        <el-button type="danger" icon="el-icon-document-add" class="buttonImportStudentList" @click="importStudentList(scope)" size="mini"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column
                width="180"
                label="操作">
                <template slot-scope="scope">
                    <el-button icon="el-icon-edit" @click="editCourse(scope)" size="mini"></el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteCourse(scope)" size="mini"></el-button>
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
                :total="totalCourse">
            </el-pagination>
        </div>
        <el-dialog title="学生名单" :visible.sync="dialogViewStudentListVisible" width="800px">
            <el-button type="primary" @click="addStudent">新增学生</el-button>
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
                    label="性别"
                    width="50">
                    <template slot-scope="scope">
                        {{ scope.row.sex == 1 ? '女' : '男' }}
                    </template>
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
                    label="学院">
                </el-table-column>
                <el-table-column
                    prop="grade"
                    label="年级"
                    width="70">
                </el-table-column>
                <el-table-column
                    label="删除"
                    width="100">
                    <template slot-scope="scope">
                        <el-button class="buttonDeleteStudent" type="danger" @click="deleteStudent(scope)" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <el-dialog title="编辑课程" :visible.sync="dialogEditCourseVisible" width="530px">
            <el-form class="nowEditData" :model="nowEditData">
                <el-form-item>
                    <span class="loginLabel">课程名称</span><el-input v-model="nowEditData.course_name" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">任教老师</span><el-input v-model="nowEditData.course_teacher" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">教师账号</span><el-input v-model="nowEditData.course_teacher_id" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">班级备注</span><el-input v-model="nowEditData.note" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitEditCourse">提交</el-button>
                <el-button @click="cancelDialog('dialogEditCourseVisible')">取消</el-button>
            </div>
        </el-dialog>
        <el-dialog title="添加课程" :visible.sync="dialogAddCourseVisible" width="530px">
            <el-form class="nowAddData" :model="nowAddData">
                <el-form-item>
                   <span class="loginLabel">课程编号</span><el-input v-model="nowAddData.course_id" autocomplete="off" class="input"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">课程名称</span><el-input v-model="nowAddData.course_name" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">教学班号</span><el-input v-model="nowAddData.study_class" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">任教老师</span><el-input v-model="nowAddData.course_teacher" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">教师账号</span><el-input v-model="nowAddData.course_teacher_id" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">班级备注</span><el-input v-model="nowAddData.note" autocomplete="off" class="inputCourse"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitAddCourse">提交</el-button>
                <el-button @click="cancelDialog('dialogAddCourseVisible')">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'ManageCourse',
    data: function () {
        return {
            httpAddress: '/api',
            listData: [],
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalCourse: 0,
            searchKeyword: '',
            searchType: 'name',
            searchPeriod: '',
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
            periodOption: [],
            dialogViewStudentListVisible: false,
            dialogAddCourseVisible: false,
            dialogEditCourseVisible: false,
            nowStudentList: [], // 正在浏览的学生名单
            nowViewData: {
                course_id: '',
                study_class: '',
            },
            nowEditData: {
                course_id: '',
                course_name: '',
                study_class: '',
                course_teacher: '',
                course_teacher_id: '',
                note: ''
            },
            nowAddData: {
                course_id: '',
                course_name: '',
                study_class: '',
                course_teacher: '',
                course_teacher_id: '',
                note: ''
            },
        }
    },
    mounted: function () {
        this.$http.get(`${this.httpAddress}/research/getPeriod`)
            .then(res => {
                let data = res.data;
                if (data.status == 0 && data.msg == 'ok') {
                    this.periodOption = data.data.map(item => {
                        return {
                            value: item.period,
                            label: item.period,
                            key: item.period,
                        }
                    })
                } else {
                    this.$message({
                        message: data.msg,
                        type: 'warning'
                    });
                }
            })
            .catch((err) => {
                console.log('err', err);
            })
        this.$http.post(`${this.httpAddress}/research/getCourseRoot`, 
            {
                keyword: this.searchKeyword,
                type: this.searchType,
                page: this.page,
                period: this.searchPeriod,
            })
            .then((res) => {
                // console.log('res', res);
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
        addNewCourse() {
            this.dialogAddCourseVisible = true;
        },
        submitAddCourse() {
            this.$http.post(`${this.httpAddress}/research/operateCourse`, {
                    action: 'add',
                    course_id: this.nowAddData.course_id,
                    study_class: this.nowAddData.study_class,
                    course_name: this.nowAddData.course_name,
                    course_teacher: this.nowAddData.course_teacher,
                    course_teacher_id: this.nowAddData.course_teacher_id,
                    note: this.nowAddData.note
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.getCourse();
                        this.dialogAddCourseVisible = false;
                        this.$message({
                            type: 'success',
                            message: '添加成功'
                        })
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '添加失败'
                        })
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                    this.dialogAddCourseVisible = false;
                    this.$message({
                        type: 'warning',
                        message: '添加失败'
                    })
                })
        },
        deleteCourse(scope) {
            console.log(scope);
            this.$confirm('此操作将永久删除该课程, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post(`${this.httpAddress}/research/operateCourse`, {
                        action: 'delete',
                        course_id: scope.row.course_id,
                        study_class: scope.row.study_class,
                    })
                    .then((res) => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.getCourse();
                            this.$message({
                                type: 'success',
                                message: '删除成功'
                            })
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '删除失败'
                            })
                        }
                    })
                    .catch((err) => {
                        console.log('err', err);
                        this.$message({
                            type: 'warning',
                            message: '删除失败'
                        })
                    })
                }).catch(() => {
                    // this.$message({
                    //     type: 'info',
                    //     message: '已取消删除'
                    // });          
                });
            
        },
        editCourse(scope) {
            this.nowEditData = {
                course_id: scope.row.course_id,
                study_class: scope.row.study_class,
                course_name: scope.row.course_name,
                course_teacher: scope.row.course_teacher,
                course_teacher_id: scope.row.course_teacher_id,
                note: scope.row.note
            }
            this.dialogEditCourseVisible = true;
        },
        submitEditCourse() {
            this.$http.post(`${this.httpAddress}/research/operateCourse`, {
                    action: 'edit',
                    course_id: this.nowEditData.course_id,
                    study_class: this.nowEditData.study_class,
                    course_name: this.nowEditData.course_name,
                    course_teacher: this.nowEditData.course_teacher,
                    course_teacher_id: this.nowEditData.course_teacher_id,
                    note: this.nowEditData.note
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.getCourse();
                        this.dialogEditCourseVisible = false;
                        this.$message({
                            type: 'success',
                            message: '修改成功'
                        })
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '修改失败'
                        })
                    }
                })
                .catch((err) => {
                    console.log('err', err);
                    this.dialogEditCourseVisible = false;
                    this.$message({
                        type: 'warning',
                        message: '修改失败'
                    })
                })
        },
        getCourse() {
            this.$http.post(`${this.httpAddress}/research/getCourseRoot`, {
                    keyword: this.searchKeyword,
                    type: this.searchType,
                    page: this.page,
                    period: this.searchPeriod,
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
        viewStudentList(scope) {
            this.$http.post(`${this.httpAddress}/research/getStudentList`, {
                    study_class: scope.row.study_class,
                    course_id: scope.row.course_id,
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.nowStudentList = data.data;
                        this.nowViewData.course_id = scope.row.course_id;
                        this.nowViewData.study_class = scope.row.study_class;
                        this.dialogViewStudentListVisible = true;
                    } else {
                        this.$message({
                            message: `${data.msg}`,
                            type: 'warning'
                        });
                    }   
                })
                .catch((err) => {
                    console.log('err', err);
                })
        },
        getStudentList() {
            this.$http.post(`${this.httpAddress}/research/getStudentList`, {
                    study_class: this.nowViewData.study_class,
                    course_id: this.nowViewData.course_id,
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.nowStudentList = data.data;
                    } else {
                        this.$message({
                            message: `${data.msg}`,
                            type: 'warning'
                        });
                    }   
                })
                .catch((err) => {
                    console.log('err', err);
                })
        },
        importStudentList(scope) {
            this.$confirm('此操作将永久删除数据库该课程学生列表并重新从教务在线导入, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let loading = this.$loading({
                    lock: true,
                    text: '导入学生名单，请不要关闭或刷新页面！',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.post(`${this.httpAddress}/research/importStudentList`, 
                    {
                        teacher_id: scope.row.teacher_id,
                        study_class: scope.row.study_class,
                        course_id: scope.row.course_id
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.listData[scope.$index + (this.currentPage - 1) * 10].course_student = data.daa;
                            this.$message({
                                message: `${scope.row.course_name}导入成功`,
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: `${scope.row.course_name}${data.msg}`,
                                type: 'warning'
                            });
                        }
                        loading.close();
                    })
                    .catch(err => {
                        console.log(err);
                        loading.close();
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消删除'
                });          
            });
            
        },
        deleteStudent(scope) {
            this.$http.post(`${this.httpAddress}/research/operateStudentFromCourse`, 
                {
                    action: 'delete',
                    course_id: this.nowViewData.course_id,
                    study_class: this.nowViewData.study_class,
                    username: scope.row.username
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            message: `删除成功`,
                            type: 'success'
                        });
                        this.nowStudentList.splice(scope.$index, 1);
                    } else {
                        this.$message({
                            message: `${data.msg}`,
                            type: 'warning'
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        addStudent() {
            this.$prompt('请输入学生学号', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                this.$http.post(`${this.httpAddress}/research/operateStudentFromCourse`, 
                    {
                        action: 'add',
                        course_id: this.nowViewData.course_id,
                        study_class: this.nowViewData.study_class,
                        username: value
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                message: '新增成功',
                                type: 'success'
                            });
                            // this.nowStudentList.push(data.data);
                            this.getStudentList();
                        } else {
                            this.$message({
                                message: `${data.msg}`,
                                type: 'warning'
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.$message({
                            message: '新增失败',
                            type: 'warning'
                        });
                    })
            }).catch(() => {
                     
            });
        }
    }
}
</script>

<style scoped>
#manageCourse .el-table {
    margin-top: 10px;
}
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
.el-input {
    width: 300px;
    margin-right: 20px;
}
.el-select {
    width: 150px;
    margin-right: 20px;
}
.nowEditData, .nowAddData {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.loginLabel {
    display: inline-block;
    margin-right: 20px;
}
.inputCourse {
    width: 300px;
}
.dialog-footer {
    display: flex;
    justify-content: center;
}
</style>

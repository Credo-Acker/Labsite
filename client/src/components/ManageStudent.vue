<template>
    <div id="manageStudent">
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
            border
            style="width: 100%">
            <el-table-column
                prop="username"
                label="账号"
                width="110">
            </el-table-column>
            <el-table-column
                prop="name"
                label="姓名"
                width="100">
            </el-table-column>
            <el-table-column
                label="性别"
                width="80">
                <template slot-scope="scope">
                    {{ scope.row.sex == 1 ? '女' : '男' }}
                </template>
            </el-table-column>
            <el-table-column
                prop="class"
                label="班级">
            </el-table-column>
            <el-table-column
                prop="major"
                label="专业">
            </el-table-column>
            <el-table-column
                prop="email"
                label="邮箱">
            </el-table-column>
            <el-table-column
                width="120"
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" @click="editUserStudent(scope)" size="mini" icon="el-icon-edit" circle></el-button>
                    <el-button type="danger" @click="deleteUser(scope)" size="mini" icon="el-icon-delete" circle></el-button>
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
                :total="totalUser">
            </el-pagination>
        </div>
        <el-dialog title="修改学生信息" :visible.sync="dialogEditStudent">
            <el-form ref="editStudent" :model="editStudent">
                <div class="dialog_line">
                    <span class="dialog_label">账号：</span>
                    <el-input
                        v-model="editStudent.username"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                <span class="dialog_label">姓名：</span>
                <el-input
                    v-model="editStudent.name"
                    clearable>
                </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">密码：</span>
                    <el-input
                        type="password"
                        v-model="editStudent.password"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">邮箱：</span>
                    <el-input
                        v-model="editStudent.email"
                        clearable>
                    </el-input>
                </div>
            </el-form>
            <p class="comfirmEdit">
                <el-button classsize="small" type="primary" @click="comfirmEditStudent">确定</el-button>
                <el-button classsize="small" @click="cancelEditStudent">取消</el-button>
            </p>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'ManageStudent',
    data: function () {
        return {
            dialogEditStudent: false,
            listData: [],
            httpAddress: '/api',
            currentPage: 0,
            page: 0,
            totalUser: 0,
            searchKeyword: '',
            searchType: 'name',
            searchOptions: [
                {
                    value: 'name',
                    label: '姓名',
                    key: 'name'
                },
                {
                    value: 'username',
                    label: '登录名',
                    key: 'username'
                },
            ],
            editUsername: '', // 记录即将被修改/删除的username
            editStudent: { // 学生修改后的参数
                username: '',
                name: '',
                password: '',
                email: ''
            },
        }
    },
    mounted: function () {
        this.getStudents();
    },
    methods: {
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.getStudents();
        },
        searchKeywordChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getStudents();
        },
        searchTypeChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getStudents();
        },
        editUserStudent(scope) {
            this.dialogEditStudent = true;
            this.editUsername = scope.row.username;
            this.editStudent = {
                username: scope.row.username,
                name: scope.row.name,
                password: '',
                email: scope.row.email
            }
        },
        deleteUser(scope) {
            this.editUsername = scope.row.username;
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http.post(`${this.httpAddress}/research/operateUser`, 
                    {
                        action: 'delete',
                        username: this.editUsername,
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                type: 'success',
                                message: '删除成功'
                            })
                            this.getStudents();
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '删除失败'
                            })
                        }
                    })
                    .catch(err => {
                        console.log('err', err);
                        this.$message({
                            type: 'warning',
                            message: '删除失败'
                        })
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
            
        },
        comfirmEditStudent() {
            this.$http.post(`${this.httpAddress}/research/operateUser`, 
                {
                    action: 'edit',
                    username: this.editUsername,
                    userData: this.editStudent
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            type: 'success',
                            message: '编辑成功'
                        })
                        this.getStudents();
                        this.dialogEditStudent = false;
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '编辑失败'
                        })
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '编辑出错'
                    })
                })
        },
        cancelEditStudent() {
            this.dialogEditStudent = false;
            this.editStudent = {
                username: '',
                name: '',
                password: '',
                email: ''
            }
        },
        getStudents() {
            this.$http.post(`${this.httpAddress}/research/getStudents`, 
                {
                    page: this.page,
                    type: this.searchType,
                    keyword: this.searchKeyword,
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.listData = data.data.data;
                        this.totalUser = data.data.total;
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
#manageStudent .el-input {
    width: 300px;
    margin-right: 20px;
    margin-bottom: 10px;
}
</style>
<style>
#manageStudent .el-dialog__body {
    text-align: center;
}
</style>

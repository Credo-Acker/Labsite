<template>
    <div id="manageUser">
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
        <el-button type="primary" @click="addStudents">添加学生</el-button>
        <el-button type="primary" @click="addTeacher">添加教师</el-button>
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
            <el-tab-pane label="学生" name="1">
                <el-table
                    :data="listData"
                    stripe
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
            </el-tab-pane>
            <el-tab-pane label="教师" name="2">
                <el-table
                    :data="listData"
                    stripe
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
                        prop="email"
                        label="邮箱">
                    </el-table-column>
                    <el-table-column
                        width="120"
                        label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="editUserTeacher(scope)" size="mini" icon="el-icon-edit" circle></el-button>
                            <el-button type="danger" @click="deleteUser(scope)" size="mini" icon="el-icon-delete" circle></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
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
        <el-dialog title="修改学生信息" :visible.sync="dialogEditStudent" class="edit">
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
        <el-dialog title="修改教师信息" :visible.sync="dialogEditTeacher" class="edit">
            <el-form ref="editTeacher" :model="editTeacher">
                <div class="dialog_line">
                    <span class="dialog_label">账号：</span>
                    <el-input
                        v-model="editTeacher.username"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">姓名：</span>
                    <el-input
                        v-model="editTeacher.name"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">密码：</span>
                    <el-input
                        type="password"
                        v-model="editTeacher.password"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">邮箱：</span>
                    <el-input
                        v-model="editTeacher.email"
                        clearable>
                    </el-input>
                </div>
            </el-form>
            <p class="comfirmEdit">
                <el-button classsize="small" type="primary" @click="comfirmEditTeacher">确定</el-button>
                <el-button classsize="small" @click="cancelEditTeacher">取消</el-button>
            </p>
        </el-dialog>
        <el-dialog title="添加教师信息" :visible.sync="dialogAddTeacher" class="edit">
            <el-form ref="addTeacher" :model="addTeacherData">
                <div class="dialog_line">
                    <span class="dialog_label">账号：</span>
                    <el-input
                        v-model="addTeacherData.username"
                        clearable>
                    </el-input>
                </div>
                <div class="dialog_line">
                    <span class="dialog_label">姓名：</span>
                    <el-input
                        v-model="addTeacherData.name"
                        clearable>
                    </el-input>
                </div>
            </el-form>
            <p class="comfirmEdit">
                <el-button classsize="small" type="primary" @click="comfirmAddTeacher">确定</el-button>
                <el-button classsize="small" @click="cancelAddTeacher">取消</el-button>
            </p>
        </el-dialog>
        <el-dialog title="上传Excel" :visible.sync="dialogUploadVisible">
            <el-upload
                class="upload-demo"
                ref="upload"
                multiple
                :action="uploadUrl"
                :on-remove="handleRemove"
                :on-exceed="handelExceed"
                :file-list="uploadFileList"
                :with-credentials="true"
                :limit="1"
                :before-upload="beforeUploadFileHandler"
                :on-success="onSuccessFileHandler"
                :auto-upload="false">
                <el-button style="margin-left: 10px;" slot="trigger" size="small" type="primary">选取</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>
            </el-upload>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'ManageUser',
    data: function () {
        return {
            dialogEditStudent: false,
            dialogEditTeacher: false,
            dialogUploadVisible: false,
            dialogAddTeacher: false,
            uploadUrl: '/api/research/importNewStudent',
            listData: [],
            httpAddress: '/api',
            activeName: '1',
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
            searchIdentity: 1,
            editUsername: '', // 记录即将被修改/删除的username
            editStudent: { // 学生修改后的参数
                username: '',
                name: '',
                password: '',
                email: ''
            },
            editTeacher: { // 教师修改后的参数
                username: '',
                name: '',
                password: '',
                email: ''
            },
            addTeacherData: { // 添加教师的信息
                username: '',
                name: '',
            },
            uploadFileList: [],
        }
    },
    mounted: function () {
        this.getUsers();
    },
    methods: {
        handleTabClick() {
            this.getUsers();
        },
        addStudents() {
            this.dialogUploadVisible = true;
        },
        addTeacher() {
            this.addTeacherData = {
                username: '',
                name: '',
            }
            this.dialogAddTeacher = true;
        },
        handelExceed() {
            this.$message({
                type: 'warning',
                message: '每次只能上传一个文件'
            })
        },
        beforeUploadFileHandler() {
            // console.log(file);
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        submitUpload() {
            this.$refs.upload.submit();
        },
        onSuccessFileHandler() { // 上传成功后
            this.$message({
                type: 'success',
                message: '上传成功！'
            })
            this.uploadFileList = [];
            this.$refs.upload.clearFiles();
            this.getUsers();
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.getUsers();
        },
        searchKeywordChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getUsers();
        },
        searchTypeChange() {
            this.page = 0;
            this.currentPage = 0;
            this.getUsers();
        },
        editUserStudent(scope) {
            // console.log(scope);
            this.dialogEditStudent = true;
            this.editUsername = scope.row.username;
            this.editStudent = {
                username: scope.row.username,
                name: scope.row.name,
                password: '',
                email: scope.row.email || ''
            }
        },
        editUserTeacher(scope) {
            // console.log(scope);
            this.dialogEditTeacher = true;
            this.editUsername = scope.row.username;
            this.editTeacher = {
                username: scope.row.username,
                name: scope.row.name,
                password: '',
                email: scope.row.email || ''
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
                            this.getUsers();
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
            console.log(this.editStudent);
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
                        this.dialogEditStudent = false;
                        this.getUsers();
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
                        message: '编辑失败'
                    })
                })
        },
        comfirmEditTeacher() {
            this.$http.post(`${this.httpAddress}/research/operateUser`, 
                {
                    action: 'edit',
                    username: this.editUsername,
                    userData: this.editTeacher
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            type: 'success',
                            message: '编辑成功'
                        })
                        this.dialogEditTeacher = false;
                        this.getUsers();
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '编辑失败'
                    })
                })
        },
        comfirmAddTeacher() {
            this.$http.post(`${this.httpAddress}/research/importNewTeacher`, 
                {
                    userData: this.addTeacherData
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            type: 'success',
                            message: '添加成功'
                        })
                        this.dialogAddTeacher = false;
                        this.getUsers();
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '添加失败'
                        })
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '添加失败'
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
        cancelEditTeacher() {
            this.dialogEditTeacher = false;
            this.editTeacher = {
                username: '',
                name: '',
                password: '',
                email: ''
            }
        },
        cancelAddTeacher() {
            this.dialogAddTeacher = false;
            this.editTeacher = {
                username: '',
                name: '',
                password: '',
            }
        },
        getUsers() {
            this.$http.post(`${this.httpAddress}/research/getAllUser`, 
                {
                    page: this.page,
                    type: this.searchType,
                    keyword: this.searchKeyword,
                    identity: this.activeName
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
.el-input {
    width: 200px;
    margin-right: 10px;
    margin-bottom: 20px;
}
.el-select {
    width: 200px;
    margin-right: 10px;
}
</style>
<style>
#manageUser .edit .el-dialog__body {
    text-align: center;
}
</style>

<template>
    <div id="myTeacherCourse">
        <el-table
            :data="listData"
            border
            style="width: 100%"
            @expand-change="openTask"
            :row-key="getRowKeys"
            :expand-row-keys="expands">
            <el-table-column type="expand">
                <template slot-scope="props">
                    <div v-if="nowTask">
                         <div class="course_detail" v-for="(detailItem, detailIndex) in nowTask" :key="detailIndex">
                            {{ detailItem.name }}
                            <p class="primaryAcce"><span @click="downloadThis(detailItem.accessory_address[0], detailItem.accessory[0])">{{ detailItem.accessory[0] }}</span></p>
                            <!-- <a :href="detailItem.accessory_address[0]" download>{{ detailItem.accessory[0] }}</a> -->
                            <div class="classButtons">
                                <el-button type="primary" class="allButton" size="mini" @click="showAllAccessory(detailItem)">全部附件</el-button>
                                <el-button type="primary" class="uploadButton" size="mini" @click="showUploadDialog(detailItem)">上传附件</el-button>
                                <el-button type="primary" class="homeworkButton" size="mini" @click="showHomeworkDialog(detailItem, props)">学生作业</el-button>
                                <el-button type="primary" class="homeworkButton" size="mini" @click="showNoHomeworkDialog(detailItem)">未上传作业学生</el-button>
                                <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(detailItem)"></el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"  @click="alertDelete(detailItem)"></el-button>
                            </div>
                        </div>
                        <div class="addNew">
                            <el-button class="addNewButton" @click="showAddTaskDialog(props)">添加新实验</el-button>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="course_id"
                label="课程编号"
                width="120">
            </el-table-column>
            <el-table-column
                prop="course_name"
                label="课程名称"
                width="150">
            </el-table-column>
            <el-table-column
                prop="course_teacher"
                label="任教老师"
                width="120">
            </el-table-column>
            <el-table-column
                prop="study_class"
                label="教学班">
            </el-table-column>
            <el-table-column
                label="备注">
                <template slot-scope="scope">
                    {{ scope.row.note || '无' }} <el-button icon="el-icon-edit" size="mini" class="editNote" @click="editNote(scope)"></el-button>
                </template>
            </el-table-column>
            <el-table-column
                width="130"
                label="操作">
                <template slot-scope="scope">
                    <el-button @click="showStudentsDialog(scope)" size="small">学生名单</el-button>
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
        <el-dialog title="附件" :visible.sync="dialogAccessoryVisible">
            <el-tag
                v-for="(acceItem, acceIndex) in accessoryData.accessory"
                :key="acceIndex"
                closable
                @close="deleteOneAcce(accessoryData.accessory_address[acceIndex], acceIndex)"
                style="margin-right: 20px; margin-bottom: 10px">
                <!-- <a :href="accessoryData.accessory_address[acceIndex]" download class="downloadAcceButton">{{ acceItem }}</a> -->
                <span @click="downloadThis(accessoryData.accessory_address[acceIndex], acceItem)" class="downloadAcceButton">{{ acceItem }}</span>
            </el-tag>
        </el-dialog>
        <el-dialog title="上传附件" :visible.sync="dialogUploadVisible">
            <p class="newTaskp">添加附件：</p>
            <el-upload
                class="upload-demo"
                ref="upload"
                multiple
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="uploadFileList"
                :http-request="uploadFile"
                :with-credentials="true"
                :limit="10"
                :before-upload="beforeUploadFileHandler"
                :on-success="onSuccessFileHandler"
                :data="uploadExtraData"
                :auto-upload="false">
                <el-button style="margin-left: 10px;" slot="trigger" size="small" type="primary">选取</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>
            </el-upload>
        </el-dialog>
        <el-dialog title="编辑详情" :visible.sync="dialogEditVisible">
            <p class="newTaskp">实验名称：</p>
            <el-input
                placeholder="请输入实验名称"
                v-model="editTaskName"
                clearable>
            </el-input>
            <p class="newTaskp">截止日期：</p>
            <el-date-picker
                v-model="editDeadlineTime"
                type="datetime"
                placeholder="选择日期">
            </el-date-picker>
            <p class="comfirmEditTask">
                <el-button @click="dialogEditVisible = false">取消</el-button>
                <el-button classsize="small" type="primary" @click="submitEditTask">更改</el-button>
            </p>
        </el-dialog>
        <el-dialog title="学生作业" :visible.sync="dialogHomeworkVisible" class="dialog_homework">
            <el-button class="buttonDownload" type="primary" @click="downloadHomework()">下载</el-button>
            <el-table
                @selection-change="handleSelectionChange"
                :data="nowHomework"
                style="width: 100%">
                <el-table-column
                    type="selection"
                    width="55">
                </el-table-column>
                <el-table-column
                    prop="username"
                    label="学号">
                </el-table-column>
                <el-table-column
                    prop="student_name"
                    label="姓名">
                </el-table-column>
                <el-table-column
                    prop="name"
                    label="作业名"
                    show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                    label="上传日期">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | toTime }}    
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    @size-change="handleSizeChangeHomework"
                    @current-change="handleCurrentChangeHomework"
                    :current-page.sync="currentPageHomework"
                    :page-size="10"
                    layout="prev, pager, next, jumper"
                    :total="homeworkTotal">
                </el-pagination>
            </div>
        </el-dialog>
        <el-dialog title="添加新实验" :visible.sync="dialogAddTaskVisible">
            <p class="newTaskp">实验名称：</p>
            <el-input
                placeholder="请输入实验名称"
                v-model="taskName"
                clearable>
            </el-input>
            <p class="newTaskp">截止日期：</p>
            <el-date-picker
                v-model="deadlineTime"
                type="datetime"
                placeholder="选择日期">
            </el-date-picker>
            <p class="comfirmAddNewTask"><el-button classsize="small" type="success" @click="submitAddNewTask">确定添加</el-button></p>
        </el-dialog>
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
        <el-dialog title="未上传作业名单" :visible.sync="dialogNoHomeworkListVisible" >
            <el-table
                :data="noHomeworkList"
                style="width: 100%">
                <el-table-column
                    prop="username"
                    label="学号">
                </el-table-column>
                <el-table-column
                    prop="name"
                    label="姓名">
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'MyTeacherCourse',
    data: function() {
        return {
            httpAddress: '/api',
            dialogAccessoryVisible: false,
            dialogUploadVisible: false,
            dialogHomeworkVisible: false,
            dialogEditVisible: false,
            dialogAddTaskVisible: false,
            dialogViewStudentListVisible: false,
            dialogNoHomeworkListVisible: false,
            listData: [],
            nowTask: [],
            expands: [],
            expandsData: {
                course_id: '',
                study_class: '',
            },
            primaryAcces: [],
            accessoryData: [],
            homeworkData: [],
            uploadFileList: [],
            uploadExtraData: {
                course_id: '',
                study_class: '',
                name: '',
                index: '',
                action: 'edit'
            },
            fileData: new FormData(),
            list: [],
            uploadUrl: '/api/research/operateTask',
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalCourse: 0,
            deadlineTime: '',
            taskName: '',
            detailIndex: '',
            editTaskName: '',
            editDeadlineTime: '',
            nowStudentList: [],
            nowViewData: {
                course_id: '',
                study_class: '',
            },
            nowDetailName: '', // 修改任务时用来存储原任务信息
            nowHomework: [],
            allHomework: [],
            currentPageHomework: 0,
            homeworkTotal: 0,
            pageHomework: 0,
            requestHomework: {}, // 下载学生作业时的参数
            multipleSelection: [],
            requestHomeworkData: {}, // 请求作业列表
            noHomeworkList: [], // 未上传作业名单
            canRequestUploadFile: true,
        }
    },
    filters: {
        toTime(val) {
            let date = new Date(parseInt(val));
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    },
    mounted: function() {
        this.getMyCourse();
    },
    methods: {
        editNote(scope) {
            this.$prompt('请输入备注', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                console.log(value)
                this.$http.post(`${this.httpAddress}/research/editNote`, 
                    {
                        course_id: scope.row.course_id,
                        study_class: scope.row.study_class,
                        note: value,
                    })
                    .then((res) => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                message: '修改成功',
                                type: 'success'
                            })
                            this.getMyCourse();
                        } else {
                            this.$message({
                                message: `${data.msg}`,
                                type: 'warning'
                            });
                        }   
                    })
                    .catch((err) => {
                        console.log('err', err);
                        this.$message({
                            message: '修改失败',
                            type: 'warning'
                        });
                    })
            }).catch(() => {
            });
        },
        async openTask(row, expandedRows) {
            this.expandsData = {
                course_id: row.course_id,
                study_class: row.study_class
            }
            if (expandedRows.length) {
                this.expands = [];
                await this.getTask();
                if (row) {
                    this.expands.push(`${row.course_id}_${row.study_class}`)
                }
            } else {
                this.expands = [];
            }
        },
        getRowKeys(row) {
            return `${row.course_id}_${row.study_class}`;
        },
        getTask() {
            this.nowTask = [];
            this.$http.post(`${this.httpAddress}/research/getTask`, 
                {
                    course_id: this.expandsData.course_id,
                    study_class: this.expandsData.study_class
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.nowTask = data.data;
                        this.nowTask = this.nowTask.map(item => {
                            let accessory = item.accessory.split('/');
                            accessory.pop();
                            accessory.shift();
                            let accessory_address = accessory.map(ele => `/accessory/${item.study_class}/${item.name}/${ele}`);
                            item.accessory = accessory;
                            item.accessory_address = accessory_address;
                            return item;
                        })
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
        showStudentsDialog(scope) { // 展示学生名单
            this.nowViewData.course_id = scope.row.course_id;
            this.nowViewData.study_class = scope.row.study_class;
            this.getStudentList();
        },
        getStudentList() {
            this.$http.post(`${this.httpAddress}/research/getStudentList`, {
                    course_id: this.nowViewData.course_id,
                    study_class: this.nowViewData.study_class
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.nowStudentList = data.data;
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
        addStudent() { // 添加学生
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
                            this.getStudentList();
                            this.getMyCourse();
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
                        this.getMyCourse();
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
        showAllAccessory(props) { // 展示全部附件
            this.accessoryData = {
                accessory: props.accessory,
                accessory_address: props.accessory_address
            };
            this.dialogAccessoryVisible = true;
        },
        showUploadDialog(props) { // 上传附件
            this.uploadExtraData.course_id = props.course_id;
            this.uploadExtraData.study_class = props.study_class;
            this.uploadExtraData.name = props.name;
            this.dialogUploadVisible = true;
        },
        showHomeworkDialog(props, scope) { // 展示学生作业列表
            this.requestHomeworkData = {
                course_id: props.course_id,
                study_class: props.study_class,
                task_name: props.name,
                course_name: scope.row.course_name,
            }
            console.log(props);
            this.getStudentsHomework();
            this.dialogHomeworkVisible = true;
        },
        showNoHomeworkDialog(props) {
            this.$http.post(`${this.httpAddress}/research/getNoHomework`, 
                {
                    course_id: props.course_id,
                    study_class: props.study_class,
                    name: props.name
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.noHomeworkList = data.data;
                    }
                })
                .catch(err => {
                    console.log('err', err);
                })
            this.dialogNoHomeworkListVisible = true;

        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        downloadHomework() { // 打包下载某任务全部学生作业
            this.$http.post(`${this.httpAddress}/research/downloadHomework`, 
                {   
                    course_id: this.requestHomeworkData.course_id,
                    course_name: this.requestHomeworkData.course_name,
                    study_class: this.requestHomeworkData.study_class,
                    name: this.requestHomeworkData.task_name,
                    requestArr: this.multipleSelection
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        window.open(data.data.url, '_self');
                    }
                })
        },
        showEditDialog(props) { // 编辑实验详情
            this.uploadExtraData.course_id = props.course_id;
            this.uploadExtraData.study_class = props.study_class;
            this.nowDetailName = props.name;
            this.editTaskName = props.name;
            let deadline = props.deadline;
            let datetime = new Date(parseInt(deadline));
            this.editDeadlineTime = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), datetime.getHours(), datetime.getMinutes(), datetime.getSeconds());
            this.dialogEditVisible = true;
        },
        alertDelete(props) { // 删除实验任务
             this.$confirm('此操作将永久删除该实验任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post(`${this.httpAddress}/research/operateTask`, 
                        {
                            action: "delete",
                            course_id: props.course_id,
                            study_class: props.study_class,
                            task: {
                                name: props.name
                            }
                        })
                        .then(res => {
                            let data = res.data;
                            if (data.status == 0 && data.msg == 'ok') {
                                this.$message({
                                    type: 'success',
                                    message: '删除成功！'
                                });
                                this.getTask();
                            } else {
                                this.$message({
                                    type: 'warning',
                                    message: '删除失败！'
                                });
                            }
                        })
                        .catch(err => {
                            console.log('err', err);
                            this.$message({
                                type: 'warning',
                                message: '删除失败！'
                            });
                        })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                });
        },
        showAddTaskDialog(props) { // 添加实验任务
            this.uploadExtraData.course_id = props.row.course_id;
            this.uploadExtraData.study_class = props.row.study_class;
            this.uploadUrl =`${this.httpAddress}/research/operateTask`;
            this.dialogAddTaskVisible = true;
        },
        submitAddNewTask() { // 确认添加实验任务
            this.$http.post(`${this.httpAddress}/research/operateTask`, 
                {
                    action: 'add',
                    course_id: this.uploadExtraData.course_id,
                    study_class: this.uploadExtraData.study_class,
                    task: {
                        name: this.taskName,
                        deadline: this.deadlineTime.getTime(),
                    }   
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == '0' && data.msg == 'ok') {
                        this.dialogAddTaskVisible = false;
                        this.$message({
                            type: 'success',
                            message: '添加实验任务成功！'
                        })
                        this.getTask();
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '添加失败！'
                        });
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '添加失败！'
                    });
                })
        },
        submitEditTask() {
            this.$http.post(`${this.httpAddress}/research/operateTask`, 
                {
                    action: 'edit',
                    course_id: this.uploadExtraData.course_id,
                    study_class: this.uploadExtraData.study_class,
                    task: {
                        name: this.nowDetailName,
                        rename: this.editTaskName,
                        redeadline: this.editDeadlineTime.getTime(),
                    }   
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == '0' && data.msg == 'ok') {
                        this.dialogAddTaskVisible = false;
                        this.$message({
                            type: 'success',
                            message: '修改成功！'
                        })
                        this.dialogEditVisible = false;
                        this.getTask();
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '修改失败！'
                        });
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '添加失败！'
                    });
                })
        },
        beforeUploadFileHandler() {
            
        },
        onSuccessFileHandler() { // 上传成功后
            if (data.status == 0 && data.msg == 'ok') {
                this.$message({
                    type: 'success',
                    message: '上传成功！'
                })
                this.getMyCourse();
            } else {
                this.$message({
                    type: 'warning',
                    message: data.msg
                })
            }
            this.$refs.upload.clearFiles();
        },
        uploadFile(file) {
            if (file.file.size > 1024 * 1024 * 20) {
                this.$message({
                    type: 'warning',
                    message: `${file.file.name}文件超出20M，请重新选择文件`
                })
                this.canRequestUploadFile = false;
            } else {
                this.fileData.append('files', file.file);
                this.list.push(file.file);
            }
        },
        submitUpload() {
            let formData = new FormData();
            this.$refs.upload.submit();
            if (this.canRequestUploadFile) {
                formData.append('action', 'edit');
                formData.append('course_id', this.uploadExtraData.course_id);
                formData.append('study_class', this.uploadExtraData.study_class);
                formData.append('name', this.uploadExtraData.name);
                for (let i = 0; i < this.list.length; i++) {
                    formData.append('files', this.list[i]);
                }
                this.$http.post(`${this.httpAddress}/research/operateTask`, formData)
                    .then((res) => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                message: "上传成功",
                                type: 'success'
                            });
                            this.fileList = [];
                            this.list = [];
                            this.uploadFileList = [];
                            this.fileData = new FormData();
                            this.getTask();
                        } else {
                            this.$message({
                                message: '上传失败',
                                type: 'warning'
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            } else {
                this.fileList = [];
                this.list = [];
                this.uploadFileList = [];
                this.fileData = new FormData();
            }
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        deleteCourse(row) {
            this.$confirm('此操作将永久删除该实验任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.get(`${this.httpAddress}/research/operateCourse`, {
                            params: {
                                action: "delete",
                                course_id: row.course_id,
                            }
                        }).then((res) => {
                            if (res.data.status == 0 && res.data.msg == 'ok') {
                                this.$message({
                                    type: 'success',
                                    message: '删除成功！'
                                });
                                this.getMyCourse();
                            } else {
                                this.$message({
                                    message: res.data.msg,
                                    type: 'warning'
                                });
                            }
                        }).catch((err) => {
                            console.log('err', err);
                        })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                });
        },
        deleteOneAcce(data, acceIndex) {
            let result = data.split('/'); 
            this.$http.post(`${this.httpAddress}/research/operateTask`, 
                {
                    action: 'delete',
                    study_class: result[2],
                    task: {
                        name: result[3],
                        deleteAcce: 'true',
                        accessory: result[4],
                    }   
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.accessoryData.accessory.splice(acceIndex, 1);
                        this.accessoryData.accessory_address.splice(acceIndex, 1);
                        this.$message({
                            type: 'success',
                            message: '删除附件成功！'
                        })
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '删除附件失败！'
                        })
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '删除附件失败！'
                    })
                })
        },
        handleSizeChange() {
        },
        handleCurrentChange(val) {
            this.page = val - 1;
            this.getMyCourse();
        },
        handleSizeChangeHomework(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChangeHomework(val) {
            this.pageHomework = val - 1;
            this.getStudentsHomework();
        },
        getMyCourse() {
            this.$http.post(`${this.httpAddress}/research/getMyCourse`, { page: this.page })
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
        getStudentsHomework() {
            this.$http.post(`${this.httpAddress}/research/getAllHomework`, 
                {
                    course_id: this.requestHomeworkData.course_id,
                    study_class: this.requestHomeworkData.study_class,
                    task_name: this.requestHomeworkData.task_name,
                    page: this.pageHomework
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.nowHomework = data.data.data;
                        this.homeworkTotal = data.data.total;
                    }
                })
        },
        downloadThis(path, name) {
            window.open(`http://lab.credog.top/api/research/download?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`, '_blank');
        },
    }
}
</script>

<style scoped>
.downloadAcceButton {
    margin-right: 20px;
    color: #409EFF;
}
.downloadHomeworkButton {
    margin-right: 20px;
    color: #409EFF;
}
.course_detail {
    position: relative;
    line-height: 40px;
}
.primaryAcce {
    display: inline-block;
    margin-left: 20px;
    min-width: 180px;
    height: 20px;
}
.primaryAcce span {
    cursor: pointer;
    color: #409eff;
}
.el-tag span {
    cursor: pointer;
}
.editNote {
    margin-left: 5px;
}
.classButtons {
    position: absolute;
    right: 0;
    line-height: 40px;
    top: 0;
}
.allButton {
    display: inline-block;
}
.homewokButton {
    display: inline-block;
}
.uploadButton {
    display: inline-block;
}
.addNew {
    text-align: right;
    margin-top: 20px;
}
.newTaskp {
    margin: 10px 0;
}
.comfirmAdd {
    text-align: center;
}
.comfirmAddNewTask, .comfirmEditTask {
    text-align: center;
    margin-top: 20px;
}
</style>
<style>
#myTeacherCourse .el-form-item {
    margin-bottom: 10px;
    border-bottom: 1px solid #aaaaaa;
}
#myTeacherCourse .el-form-item:last-child {
    margin-bottom: 0;
}
#myTeacherCourse .el-table__expanded-cell[class*=cell] {
    padding: 20px;
}
#myTeacherCourse .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
#myTeacherCourse .dialog_homework .el-dialog__body {
    padding: 10px 20px;
}
</style>

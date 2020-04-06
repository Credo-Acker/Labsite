<template>
    <div id="myStudentCourse">
        <el-table
            :data="listData"
            stripe
            style="width: 100%"
            @expand-change="openTask"
            :row-key="getRowKeys"
            :expand-row-keys="expands">
            <el-table-column type="expand">
                <template slot-scope="props">
                    <div v-if="nowTask">
                         <div class="course_detail" v-for="(detailItem, detailIndex) in nowTask" :key="detailIndex">
                            {{ detailItem.name }}
                            <p class="primaryAcce"><a :href="detailItem.accessory_address[0]" download>{{ detailItem.accessory[0] }}</a></p>
                            <div class="classButtons">
                                <el-button type="primary" class="allButton" size="mini" @click="showAllAccessory(detailItem, props)">全部附件</el-button>
                                <el-button type="primary" class="homeworkButton" size="mini" @click="showAllHomework(detailItem, props)">我的作业</el-button>
                                <el-button type="primary" class="uploadButton" size="mini" :disabled="detailItem.deadline < nowTime" @click="showUploadDialog(detailItem, props)">上传作业</el-button>
                            </div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="course_id"
                label="课程编号"
                width="180">
            </el-table-column>
            <el-table-column
                prop="course_name"
                label="课程名称"
                width="180">
            </el-table-column>
            <el-table-column
                prop="course_teacher"
                label="任教老师">
            </el-table-column>
            <el-table-column
                prop="study_class"
                label="教学班">
            </el-table-column>
            <el-table-column
                label="备注">
                <template slot-scope="scope">
                    {{ scope.row.note || '无' }}
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
        <el-dialog title="附件" :visible.sync="dialogAccessoryVisible" label-width="100px" label-position="left">
            <span v-for="(acceItem, acceIndex) in accessoryData.accessory" :key="acceIndex">
                <a :href="accessoryData.accessory_address[acceIndex]" download class="downloadAcceButton">{{ acceItem }}</a>
            </span>
        </el-dialog>
        <el-dialog title="我的作业" :visible.sync="dialogHomeworkVisible" label-width="100px" label-position="left">
            <el-tag
                v-for="(homeworkItem, homeworkIndex) in homeworkData" 
                :key="homeworkIndex"
                closable
                @close="deleteOneHomework(homeworkItem.address, homeworkIndex)"
                style="margin-right: 20px; margin-bottom: 10px"
                class="tags">
                <a :href="homeworkItem.address" download class="downloadHomeworkButton">{{ homeworkItem.name }}</a>
                <span class="homeworkdatetime">{{ homeworkItem.create_time | toTime }}</span>
            </el-tag>
        </el-dialog>
        <el-dialog title="上传作业" :visible.sync="dialogUploadVisible">
            <el-upload
                class="upload-demo"
                ref="upload"
                multiple
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="onSuccessFileHandler"
                :http-request="uploadFile"
                :file-list="uploadFileList"
                :with-credentials="true"
                :limit="10"
                :before-upload="beforeUploadFileHandler"
                :data="uploadExtraData"
                :auto-upload="false">
                <el-button style="margin-left: 10px;" slot="trigger" size="small" type="primary">选取</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>
                <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
            </el-upload>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'MyStudentCourse',
    props: {
        msg: String
    },
    data: function() {
        return {
            httpAddress: '/api',
            dialogAccessoryVisible: false,
            dialogHomeworkVisible: false,
            dialogUploadVisible: false,
            nowTime: new Date().getTime(),
            listData: [],
            expands: [],
            nowTask: [],
            accessoryData: [],
            homeworkData: [],
            uploadFileList: [],
            uploadExtraData: {},
            fileData: new FormData(),
            list: [],
            currentPage: 0,
            page: 0,
            totalPage: 0,
            totalCourse: 0,
            detailIndex: '',
            uploadUrl: '/api/research/editHomework',
        }
    },
    filters: {
        toTime(val) {
            let date = new Date(parseInt(val));
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    },
    mounted: function() {
        this.$http.post(`${this.httpAddress}/research/getMyCourse`, {page: this.page})
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
                        console.log(this.nowTask);
                        this.nowTask = this.nowTask.map(item => {
                            let accessory = item.accessory.split('/');
                            accessory.pop();
                            accessory.shift();
                            let accessory_address = accessory.map(ele => `/static/accessory/${item.study_class}/${item.name}/${ele}`);
                            item.accessory = accessory;
                            item.accessory_address = accessory_address;
                            return item;
                        })
                        console.log(this.nowTask);
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
        showAllAccessory(props) { // 展示全部附件
            this.accessoryData = {
                accessory: props.accessory,
                accessory_address: props.accessory_address
            };
            this.dialogAccessoryVisible = true;
        },
        showAllHomework(props) {
            // this.detailIndex = detailIndex;
            console.log(props);
            this.$http.get(`${this.httpAddress}/research/getMyHomework`, {
                params: {
                    course_id: props.course_id,
                    study_class: props.study_class,
                    name: props.name
                }
            }).then(res => {
                let data = res.data;
                if (data.status == 0 && data.msg == 'ok' && data.data.length > 0) {
                    let realData = data.data;
                    this.homeworkData = realData;
                    this.dialogHomeworkVisible = true;
                } else {
                    this.$message({
                        message: '你还未上传作业',
                        type: 'warning'
                    })
                }
            }).catch(err => {
                console.log(err);
            })
        },
        deleteOneHomework(data, homeworkIndex) {
            let result = data.split('/'); 
            this.$http.post(`${this.httpAddress}/research/editHomework`, 
                {
                    course_id: result[3].split('_')[0],
                    study_class: result[3].split('_')[1],
                    action: 'delete',
                    name: result[4],
                    filename: result[6],
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.homeworkData.splice(homeworkIndex, 1);
                        this.$message({
                            type: 'success',
                            message: '删除成功！'
                        })
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '删除失败！'
                        })
                    }
                })
                .catch(err => {
                    console.log('err', err);
                    this.$message({
                        type: 'warning',
                        message: '删除失败！'
                    })
                })
        },
        showUploadDialog(props) {
            this.uploadExtraData = {
                course_id: props.course_id,
                study_class: props.study_class,
                name: props.name,
            }
            this.dialogUploadVisible = true;
        },
        beforeUploadFileHandler() {
            this.uploadExtraData.action = 'add';
        },
        onSuccessFileHandler() { // 上传成功后
            this.$message({
                type: 'success',
                message: '上传成功！'
            })
            this.$refs.upload.clearFiles();
        },
        uploadFile(file) {
            this.fileData.append('files', file.file);
            this.list.push(file.file);
        },
        submitUpload() {
            let formData = new FormData();
            this.$refs.upload.submit();
            formData.append('action', 'add');
            formData.append('course_id', this.uploadExtraData.course_id);
            formData.append('study_class', this.uploadExtraData.study_class);
            formData.append('name', this.uploadExtraData.name);
            for (let i = 0; i < this.list.length; i++) {
                formData.append('files', this.list[i]);
            }
            this.$http.post(`${this.httpAddress}/research/editHomework`, formData)
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
                    } else {
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.page = val - 1;
            this.$http.post(`${this.httpAddress}/research/getMyCourse`, {page: this.page})
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
    }
}
</script>

<style scoped>
.downloadAcceButton {
    margin-right: 20px;
    color: #409EFF;
}
.downloadHomeworkButton {
    max-width: 180px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 20px;
    color: #409EFF;
}
.homeworkdatetime {
    display: inline-block;
    position: relative;
    top: -10px;
}
.course_detail {
    position: relative;
    line-height: 40px;
}
.primaryAcce {
    display: inline-block;
    margin-left: 20px;
    width: 300px;
}
.primaryAcce a {
    color: #409eff;
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
</style>
<style>
#myStudentCourse .el-form-item {
    margin-bottom: 10px;
    border-bottom: 1px solid #aaaaaa;
}
#myStudentCourse .el-form-item:last-child {
    margin-bottom: 0;
}
#myStudentCourse .tags .el-icon-close {
    display: inline-block;
    position: relative;
    top: -10px;
}
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>

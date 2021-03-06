<template>
    <div id="manageResource">
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
        <el-button type="primary" class="uploadButton" @click="showUploadDialog()">上传资源</el-button>
        <el-table
            :data="listData"
            border
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
                    <!-- <a :href="scope.row.address" class="download" download>下载</a> -->
                    <el-button type="primary" size="mini" @click="downloadResource(scope.row.address, scope.row.name)">下载</el-button>
                    <el-button type="danger" size="small" :disabled="username !='管理员' && scope.row.teacher != username" @click="deleteResource(scope)">删除</el-button>
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
        <el-dialog title="上传附件" :visible.sync="dialogUploadVisible" label-width="100px" label-position="left">
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
    name: 'ManageResource',
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
            dialogUploadVisible: false,
            uploadFileList: [],
            uploadUrl: '/api/research/uploadResource',
            username: '',
        }
    },
    filters: {
        getTime: function(val) {
            let date = new Date(parseInt(val));
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    },
    watch: {
        dialogUploadVisible(val) {
            if (val == false) {
                this.uploadFileList = [];
            }
        }
    },
    mounted: function() {
        this.getResource();
        this.username = sessionStorage.getItem('username');
    },
    methods: {
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            // console.log(`当前页: ${val}`);
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
        showUploadDialog() { // 上传附件
            this.dialogUploadVisible = true;
        },
        beforeUploadFileHandler(file) {
            let canUpload = true;
            if (file.size > 1024 * 1024 * 20) {
                this.$message({
                    type: 'warning',
                    message: '有文件超出20M，请重新选择文件'
                })
                canUpload = false;
            }
            return canUpload;
        },
        handelExceed() {
            this.$message({
                type: 'warning',
                message: '每次只能上传一个文件'
            })
        },
        onSuccessFileHandler(data) { // 上传成功后
            if (data.status == 0 && data.msg == 'ok') {
                this.$message({
                    type: 'success',
                    message: '上传成功！'
                })
                this.getResource();
            } else {
                this.$message({
                    type: 'warning',
                    message: data.msg
                })
            }
            this.$refs.upload.clearFiles();
        },
        submitUpload() {
            this.$refs.upload.submit();
        },
        handleRemove(file, fileList) {
            console.log(file, fileList, 'handleRemove');
        },
        deleteResource(scope) {
            this.$http.post(`${this.httpAddress}/research/deleteResource`, 
                {
                    filename: scope.row.name,
                    teacher: scope.row.username
                })
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.getResource();
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
                })
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
        downloadResource(path, name) {
            window.open(`http://lab.credog.top/api/research/download?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`, '_blank');
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
.el-select {
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
    margin-right: 10px;
}
#manageResource .el-table {
    margin-top: 10px;
}
</style>
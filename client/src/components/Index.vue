<template>
    <el-container>
        <el-header height="100px">
            <span class="title">实验中心教学管理网站</span>
            <div class="headerRight">
                <span class="login" :class="{logined: isLogined}" @click="login">登录</span>
                <span class="username" :class="{canlogout: canLogout}">{{ username }}</span>
                <span class="logout canChangePwd" :class="{canlogout: canLogout}" @click="changePwd">修改密码</span>
                <span class="logout" :class="{canlogout: canLogout}" @click="logout">退出</span>
            </div>
        </el-header>
        <el-container>
            <el-aside class='menu' width="230px">
                <el-menu
                    default-active="allCourse"
                    class="real_menu"
                    background-color="#409EFF"
                    text-color="#FFFFFF"
                    active-text-color="#FFFFFF"
                    router
                >
                    <el-menu-item v-for="(item) in menuItem" :index="item.path" :key="item.path">
                        <span slot="title">{{ item.name }}</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
        <el-dialog title="登录" :visible.sync="dialogLoginVisible" width="530px">
            <el-form class="loginForm" :model="form" @keyup.enter.native="loginLab">
                <el-form-item>
                   <span class="loginLabel">账号</span><el-input v-model="form.username" autocomplete="off" class="inputUsername"></el-input>
                </el-form-item>
                <el-form-item>
                    <span class="loginLabel">密码</span><el-input v-model="form.password" autocomplete="off" class="inputPassword" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="loginLab">登录</el-button>
                <el-button @click="forgetPassword">忘记密码</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
export default {
    name: 'Index',
    data: function () {
        return {
            httpAddress: '/api',
            username: '',
            isLogined: false,
            canLogout: false,
            canChangePwd: false,
            form: {
                username: '',
                password: '',
            },
            menuItem: [
                {
                    name: '全部课程',
                    path: 'allCourse'
                },
                {
                    name: '资源中心',
                    path: 'resourceCenter'
                },
            ],
            dialogLoginVisible: false,
            loading: {},
            email: '',
        }
    },
    mounted: function () {
        this.$http.get(`${this.httpAddress}/research/checkLogin`)
            .then((res) => {
                let data = res.data;
                if (data.status == 0 && data.msg == 'ok') {
                    if (data.data.identity == '1') {
                        this.username = `${data.data.name}同学，你好`;
                        this.menuItem.push({
                            name: '我的课程',
                            path: 'myStudentCourse'
                        })
                    } else if (data.data.identity == '2') {
                        this.username = `${data.data.name}老师，您好`;
                        this.menuItem.push({
                            name: '我的课程',
                            path: 'myTeacherCourse'
                        })
                        this.menuItem.push({
                            name: '资源管理',
                            path: 'manageResource'
                        })
                        this.menuItem.push({
                            name: '人员管理',
                            path: 'manageStudent'
                        })
                    } else if (data.data.identity == '3') {
                        this.username = `${data.data.name}，您好`;
                        this.menuItem.push({
                            name: '资源管理',
                            path: 'manageResource'
                        })
                        this.menuItem.push({
                            name: '人员管理',
                            path: 'manageUser'
                        })
                        this.menuItem.push({
                            name: '课程管理',
                            path: 'manageCourse'
                        })
                        this.menuItem.push({
                            name: '新学期初期化',
                            path: 'setPeriod'
                        })
                    }
                    this.email = data.data.email;
                    this.isLogined = true;
                    this.dialogLoginVisible = false;
                    this.canLogout = true;
                    this.canChangePwd = true;
                    sessionStorage.setItem('username', data.data.name);
                } else {
                    if (this.$route.name != 'allCourse' && this.$route.name != 'resourceCenter') {
                        this.$router.push({ name: 'allCourse' });
                    }
                    sessionStorage.removeItem('username');
                }
            }).catch((err) => {
                console.log('err', err);
                if (this.$route.name != 'allCourse' && this.$route.name != 'resourceCenter') {
                    this.$router.push({ name: 'allCourse' });
                }
            })
    },
    methods: {
        login() { 
            this.form = {
                username: '',
                password: ''
            }
            this.dialogLoginVisible = true;
        },
        loginLab() {
            this.$http.post(`${this.httpAddress}/research/login`, this.form)
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        if (data.data.identity == '1') {
                            this.username = `${data.data.name}同学，你好`;
                            this.menuItem.push({
                                name: '我的课程',
                                path: 'myStudentCourse'
                            })
                        } else if (data.data.identity == '2') {
                            this.username = `${data.data.name}老师，您好`;
                            this.menuItem.push({
                                name: '我的课程',
                                path: 'myTeacherCourse'
                            })
                            this.menuItem.push({
                                name: '人员管理',
                                path: 'manageStudent'
                            })
                            this.menuItem.push({
                                name: '资源管理',
                                path: 'manageResource'
                            })
                        } else if (data.data.identity == '3') {
                            this.username = `${data.data.name}，您好`;
                            this.menuItem.push({
                                name: '资源管理',
                                path: 'manageResource'
                            })
                            this.menuItem.push({
                                name: '人员管理',
                                path: 'manageUser'
                            })
                            this.menuItem.push({
                                name: '课程管理',
                                path: 'manageCourse'
                            })
                            this.menuItem.push({
                                name: '新学期初期化',
                                path: 'setPeriod'
                            })
                        }
                        if (data.data.email == null || data.data.email == '') {
                            this.bindEmail();
                        }
                        this.email = data.data.email;
                        this.isLogined = true;
                        this.dialogLoginVisible = false;
                        this.canLogout = true;
                        this.canChangePwd = true;
                        this.$message({
                            message: '登陆成功',
                            type: 'success'
                        })
                        sessionStorage.setItem('username', data.data.name);
                        this.form = {
                            username: '',
                            password: ''
                        }
                    } else {
                        this.form.password = '';
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        })
                    }
                    
                }).catch((err) => {
                    console.log('err', err);
                    this.form = {
                        username: '',
                        password: ''
                    }
                })
        },
        changePwd() {
            if (this.email == null || this.email == '') {
                this.bindEmail();
            } else {
                this.$router.push({ name: 'forgetPassword', query: { username: 'false' } });
            }
        },
        bindEmail() {
            this.$prompt('请输入绑定邮箱', '提示', {
                confirmButtonText: '确定',
                // cancelButtonText: '取消',
                showCancelButton: false,
                inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                inputErrorMessage: '邮箱格式不正确',
                closeOnClickModal: false,
                closeOnPressEscape: false,
            }).then(({ value }) => {
                this.loading = this.$loading({
                    lock: true,
                    text: '正在发送验证码至邮箱',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.post(`${this.httpAddress}/research/setEmail`, 
                    {
                        email: value
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.inputCode();
                            this.loading.close();
                            this.email = value;
                        } else {
                            this.$message({
                                type: 'warning',
                                message: data.msg
                            });
                            this.loading.close();
                            this.bindEmail();
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.$message({
                            type: 'warning',
                            message: '绑定失败'
                        });
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消输入'
                });   
            });
        },
        inputCode() {
            this.$prompt('请查看已发送至邮箱的安全码并填写', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /[0-9]{6}/,
            }).then(({ value }) => {
                this.$http.post(`${this.httpAddress}/research/confirmEmail`, 
                    {
                        code: value
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                type: 'success',
                                message: '绑定邮箱成功'
                            });
                        } else {
                            this.$message({
                                type: 'warning',
                                message: data.msg
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.$message({
                            type: 'warning',
                            message: '绑定失败'
                        });
                    })
                
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消输入'
                });   
            });
        },
        forgetPassword() {
            this.dialogLoginVisible = false;
            this.$router.push({
                name: 'forgetPassword'
            })
        },
        logout() {
            this.$http.get(`${this.httpAddress}/research/logout`)
                .then((res) => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.$message({
                            message: '退出成功',
                            type: 'success'
                        })
                        // this.$root.$emit('logout');
                    } else {
                        this.$message({
                            message: data.msg,
                            type: 'warning'
                        })
                    }
                    this.username = ``;
                    this.isLogined = false;
                    this.canLogout = false;
                    this.canChangePwd = false;
                    this.menuItem =  [
                        {
                            name: '全部课程',
                            path: 'allCourse'
                        },
                        {
                            name: '资源中心',
                            path: 'resourceCenter'
                        },
                    ];
                    if (this.$route.name != 'allCourse' && this.$route.name != 'resourceCenter') {
                        this.$router.push({ name: 'allCourse' });
                    }
                    sessionStorage.removeItem('username');
                }).catch((err) => {
                    if (this.$route.name != 'allCourse' && this.$route.name != 'resourceCenter') {
                        this.$router.push({ name: 'allCourse' });
                    }
                    sessionStorage.removeItem('username');
                    console.log('err', err);
                })
        },
    }
}
</script>

<style scoped>
.el-header {
    position: relative;
    background: #409EFF;
    line-height: 100px;
    color: #ffffff;
}
.title {
    font-size: 24px;
}
.headerRight {
    position: absolute;
    right: 0;
    top: 0;
}
.login {
    /* position: absolute;
    right: 20px; */
    cursor: pointer;
    margin-right: 20px;
}
.logout {
    display: none;
    opacity: 0;
    cursor: pointer;
    z-index: -1;
}
.logined {
    display: none;
}
.canlogout {
    display: inline-block;
    z-index: 2;
    opacity: 1;
    margin-right: 10px;
}
.canChangePwd {
    color: #F56C6C;
    margin-right: 10px;
    z-index: 2;
    opacity: 1;
}
.username {
    margin-right: 10px;
}
.menu {
    overflow: hidden;
    text-align: center;
    background: #409EFF;
}
.real_menu {
    padding-top: 20px;
}
.el-menu-item span {
    font-size: 16px;
}
.el-main {
    background: #ffffff;
    height: calc(100vh - 100px);
}
.primaryAcce {
    margin-left: 20px;
}
.dialog-footer {
    display: flex;
    justify-content: center;
}
.loginForm {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.loginLabel {
    display: inline-block;
    margin-right: 20px;
}
.inputUsername, .inputPassword {
    width: 300px;
}
</style>

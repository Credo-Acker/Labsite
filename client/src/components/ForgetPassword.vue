<template>
    <div id="forgetPassword">
        <div class="forgetDiv">
            <p v-if="canInputUsername"><span class="label">登录名：</span><el-input v-model="username" class="username"></el-input></p>
            <p><span class="label">新密码：</span><el-input v-model="password1" type="password" class="password1"></el-input></p>
            <p><span class="label">确认密码：</span><el-input v-model="password2" type="password" class="password2"></el-input></p>
            <p><span class="label">邮箱安全码：</span><el-input v-model="code" maxlength="6" class="code"></el-input></p>
            <div class="buttons">
                <el-button type="primary" @click="getCode" :disabled="canGetCode">{{ codeText }}</el-button>
                <el-button type="success" @click="comfirmCode">确认</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForgetPassword',
    data: function () {
        return {
            httpAddress: '/api',
            username: '',
            code: '',
            password1: '',
            password2: '',
            canGetCode: false,
            codeText: '获取邮箱安全码',
            loading: {},
            time: 30, // 计算秒数
            timer: null,
            canInputUsername: true,
        }
    },
    mounted: function() {
        console.log(this.$route.query.username);
        if (this.$route.query.username == 'false') {
            this.canInputUsername = false;
        }
    },
    methods: {
        getCode() {
            this.loading = this.$loading({
                    lock: true,
                    text: '正在发送安全码至邮箱，请稍后',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            this.canGetCode = true;
            this.$http.get(`${this.httpAddress}/research/requestEditPassword`, 
                {
                    params: {
                        username: this.username
                    }
                })
                .then(res => {
                    let data = res.data;
                    if (data.status == 0 && data.msg == 'ok') {
                        this.loading.close();
                        this.$message({
                            type: 'success',
                            message: '发送成功，如未收到请查看垃圾箱'
                        })
                        this.waitResend();
                    } else {
                        this.$message({
                            type: 'warning',
                            message: data.msg
                        })
                        this.loading.close();
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        waitResend() {
            this.time = 30;
            this.timer = setInterval(() => {
                if (this.time == 0) {
                    this.codeText = `获取邮箱安全码`;
                    this.canGetCode = false;
                    clearInterval(this.timer);
                    this.timer = null;
                } else {
                    this.codeText = `${this.time}秒后可重新获取`;
                    this.time--;
                }
            }, 1000);
        },
        comfirmCode() {
            if (this.password1 !== this.password2) {
                this.$message({
                    type: 'wanrning',
                    message: '两次密码输入不一致'
                })
            } else {
                this.$http.post(`${this.httpAddress}/research/confirmEditPassword`, 
                    {
                        username: this.username,
                        password: this.password1,
                        code: this.code
                    })
                    .then(res => {
                        let data = res.data;
                        if (data.status == 0 && data.msg == 'ok') {
                            this.$message({
                                type: 'success',
                                message: '重置密码成功'
                            })
                            this.$router.push({
                                name: 'allCourse'
                            })
                        } else {
                            this.$message({
                                type: 'warning',
                                message: data.msg
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        },
    }
}
</script>

<style scoped>
.forgetDiv {
    position: relative;
}
.forgetDiv p {
    display: flex;
    justify-content: center;
    margin: 20px 0px;
    line-height: 40px;
    color: #303133;
}
.label {
    display: inline-block;
    width: 100px;
    text-align: center;
}
.username,.password1,.password2 {
    width: 200px;
}
.code {
    width: 200px;
}
.buttons {
    display: flex;
    justify-content: center;
}
</style>

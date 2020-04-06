'use strict';

const Controller = require('egg').Controller;
const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const url = require('url');

class AllController extends Controller {
  async login() {
    const { ctx, app } = this;
    const data = ctx.request.body;
    let checkData = await this.service.all.login(data);

    if (checkData[0]) {
      let token = jsonwebtoken.sign({
        username: data.username,
        identity: checkData[0].identity,
        name: checkData[0].name //需要存储的 token 数据
      }, app.config.jwt.secret, { expiresIn: '1h' });
      ctx.cookies.set("token", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
      ctx.cookies.set("username", data.username, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
      ctx.cookies.set("identity", checkData[0].identity, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
      ctx.cookies.set("name", encodeURI(checkData[0].name, "utf8"), {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });

      console.log('登陆成功');
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: checkData[0]
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        status: 1,
        msg: '登录名或密码错误',
      }
    }
  }

  async checkLogin() {
    const { ctx } = this;
    let identity = ctx.cookies.get('identity');
    let name = decodeURI(ctx.cookies.get('name'), "utf8");
    
    ctx.status = 200;
    ctx.body = {
      status: 0,
      msg: 'ok',
      data: {
        name,
        identity
      }
    }
  }

  async logout() {
    const { ctx } = this;
    ctx.cookies.set("token", 0, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });
    ctx.cookies.set("username", 0, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });
    ctx.cookies.set("name", 0, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });
    ctx.cookies.set("identity", 0, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });

    ctx.status = 200;
    ctx.body = {
      status: 0,
      msg: 'ok',
    }
  }

  async getMyCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    const username = ctx.cookies.get('username');
    const identity = ctx.cookies.get('identity');
    let courseData = await this.service.all.getMyCourse(username, identity, data.page);
    console.log('获取了我的课程');

    if (courseData.data != null) {
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: courseData
      }
    }
  }

  async getAllCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let courseData = await this.service.all.getAllCourse(data.page);
    console.log('获取了全部课程');
    
    if (courseData.data != null) {
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: courseData
      }
    }
  }

  async searchCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let courseData = await this.service.all.searchCourse(data);

    if (courseData.data != null) {
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: courseData
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: []
      }
    }
  }

  async getResource() {
    const { ctx } = this;
    const data = ctx.request.body;
    let courseData = await this.service.all.getResource(data);

    if (courseData.data != null) {
      ctx.status = 200;
      ctx.body = {
        status: 0,
        msg: 'ok',
        data: courseData
      }
    }
  }

  async requestEditPassword() {
    const { ctx } = this;
    const data = ctx.request.query;
    let resData = await this.service.all.requestEditPassword(data.username);

    if (resData.data.messageId) {
      ctx.cookies.set("messageId", resData.data.messageId, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
    }
    

    ctx.status = 200;
    ctx.body = resData;
  }

  async confirmEditPassword() {
    const { ctx } = this;
    const data = ctx.request.body;
    let messageId = ctx.cookies.get('messageId');
    let resData = await this.service.all.confirmEditPassword(data, messageId);

    ctx.status = 200;
    ctx.body = resData;
  }

  async setEmail() {
    const { ctx } = this;
    const data = ctx.request.body;
    data.username = ctx.cookies.get('username');
    let resData = await this.service.all.setEmail(data);

    if (resData.status == 0 && resData.data.messageId) {
      ctx.cookies.set('email', data.email, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      })
      ctx.cookies.set('messageId', resData.data.messageId, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      })
    }

    ctx.status = 200;
    ctx.body = resData;
  }

  async confirmEmail() {
    const { ctx } = this;
    const data = ctx.request.body;
    data.username = ctx.cookies.get('username');
    data.email = ctx.cookies.get('email');
    data.messageId = ctx.cookies.get('messageId');
    let resData = await this.service.all.confirmEmail(data);
    if (resData.status == 0 && resData.msg == 'ok') {
      ctx.cookies.set('email', 0, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      })
      ctx.cookies.set('messageId', 0, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      })
    }

    ctx.status = 200;
    ctx.body = resData;
  }

  async getTask() {
    const { ctx } = this;
    let data = ctx.request.body;
    let resData = await this.service.all.getTask(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async download() {
    const { ctx } = this;
    let fileNamePath = decodeURIComponent(ctx.request.query.path);
    let fileName = decodeURIComponent(ctx.request.query.name);
    const filePath = path.join(this.config.baseDir, 'app/upload/', fileNamePath);
    console.log(filePath);
    console.log(fileName);
    ctx.attachment(fileName, {
        fallback:true,
        type:'attachment' // [string] attachment/inline
    });
    const fileSize = fs.statSync(filePath).size;
    ctx.set('Content-Length', fileSize) 
    ctx.set('Content-Disposition',`attachment; filename=${fileName}`);
    ctx.body = fs.createReadStream(filePath);
  }
  
}

module.exports = AllController;

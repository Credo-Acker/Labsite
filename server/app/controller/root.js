'use strict';

const Controller = require('egg').Controller;
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');

class RootController extends Controller {
  async createNewPeriod() {
    const { ctx } = this;
    const data = ctx.query;
    let resData = {
      status: 1,
      msg: '输入不符合要求'
    }
    if (/[2][0-9][0-9][0-9][1-2]/.test(data.period)) {
      resData = await this.service.root.createNewPeriod(data.period);
    }

    ctx.status = 200;
    ctx.body = resData;
  }

  async createNewCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = {
      status: 1,
      msg: '服务端导入新学期课程失败'
    }
    resData = await this.service.root.createNewCourse(data.url);

    ctx.status = 200;
    ctx.body = resData;
  }

  async comfirmNewCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = {
      status: 1,
      msg: '确认新学期课程失败'
    }
    resData = await this.service.root.comfirmNewCourse(data.course);

    ctx.status = 200;
    ctx.body = resData;
  }

  async importStudentList() {
    const { ctx } = this;
    const data = ctx.request.body;
    console.log(data);
    let resData = await this.service.root.importStudentList(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async getCourseRoot() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.root.getCourseRoot(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async getPeriod() {
    const { ctx } = this;
    let resData = await this.service.root.getPeriod();

    ctx.status = 200;
    ctx.body = resData;
  }

  async getStudentList() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = {
      status: 0,
      msg: 'ok',
      data: []
    }
    if (data.study_class) {
      resData = await this.service.root.getStudentList(data);
    }

    ctx.status = 200;
    ctx.body = resData;
  }

  async operateStudentFromCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.root.operateStudentFromCourse(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async getAllUser() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.root.getAllUser(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async importNewStudent() {
    const { ctx } = this;
    let stream = await ctx.getFileStream();
    let filename = stream.filename;
    let uplaodBasePath = `\\user\\`;
    let target= path.join(this.config.baseDir, 'app/upload', `/user/`);
    let checkAddress = path.join(this.config.baseDir, `/app/upload/user/`, filename).replace(/\\/g, '/');
    let resData = {};

    // 生成一个文件写入 文件流
    let writeStream = fs.createWriteStream(target + filename);
    try { 
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      let resData = await this.service.root.importNewStudent(filename);
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      ctx.status = 200;
      ctx.body = {
        status: 1,
        msg: err,
      }
      throw err;
    }

    console.log('上传了学生名单', resData);
    ctx.status = 200;
    ctx.body = resData;
  }

  async importNewTeacher() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.root.importNewTeacher(data.userData);

    ctx.status = 200;
    ctx.body = resData;
  }

  async operateCourse() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.root.operateCourse(data);

    ctx.status = 200;
    ctx.body = resData;
  }

}

module.exports = RootController;

'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');

class StudentController extends Controller {
  async editHomework() {
    const { ctx } = this;
    let course_id, action, study_class, name, filename, file_name;
    let stream;
    let username = ctx.cookies.get('username');
    let student_name = decodeURI(ctx.cookies.get('name'), "utf8");
    let resData = {};

    if (ctx.request.header['content-type'] == 'application/json;charset=UTF-8') { // 普通情况 删除作业
      course_id = ctx.request.body.course_id;
      study_class = ctx.request.body.study_class;
      action = ctx.request.body.action;
      name = ctx.request.body.name;
      filename = ctx.request.body.filename;
      let isDeadline = await this.service.student.isDeadline(course_id, study_class, name);
      if (!isDeadline) {
        resData = await this.service.student.editHomework(action, course_id, study_class, name, student_name, username, filename);
      } else {
        resData = {
          status: 1,
          msg: '已过上传截止时间'
        }
      }
    } else { // 上传附件时 上传作业
      stream = await ctx.multipart();
      let part;
      while ((part = await stream()) != null) {
        if (part.length) {
          course_id = part[0] == 'course_id' ? part[1] : course_id;
          study_class = part[0] == 'study_class' ? part[1] : study_class;
          action = part[0] == 'action' ? part[1] : action;
          name = part[0] == 'name' ? part[1] : name;
        } else {
          let uplaodBasePathStu = `\\homework\\${course_id}_${study_class}\\${name}\\${username}`;
          let targetStu = path.join(this.config.baseDir, 'app/upload', `/homework/${course_id}_${study_class}/${name}/${username}/`);
          if (!part.filename) {
            continue;
          }
          this.mkdirPath(path.join('app\\upload', uplaodBasePathStu));
          file_name = part.filename;
          let isExist = await this.service.student.isExistFile(course_id, study_class, name, username, file_name);
          let isDeadline = await this.service.student.isDeadline(course_id, study_class, name);
          if (isExist && !isDeadline) {
            ctx.status = 200;
            resData = {
              status: 1,
              msg: `已经存在${file_name}文件`,
            }
          } else if (!isExist && isDeadline) {
            ctx.status = 200;
            resData = {
              status: 1,
              msg: `已过上传截止时间`,
            }
          } else if (!isExist && !isDeadline) {
            // 生成一个文件写入 文件流
            let writeStreamStu = fs.createWriteStream(targetStu + `${file_name}`);
            try { 
              // 异步把文件流 写入
              await awaitWriteStream(part.pipe(writeStreamStu));
              resData = await this.service.student.editHomework(action, course_id, study_class, name, student_name, username, file_name);
              if (resData.changedRows == 1) {
                resData = {
                  status: 0,
                  msg: 'ok',
                }
              }
            } catch (err) {
              // 如果出现错误，关闭管道
              await sendToWormhole(part);
              ctx.status = 200;
              ctx.body = {
                status: 1,
                msg: err,
              }
              throw err;
            }
          } else {
            ctx.status = 200;
            resData = {
              status: 1,
              msg: `已过上传截止时间且已存在${file_name}文件`,
            }
          }
          await sendToWormhole(part);
        }
      }
    }

    console.log('添加/删除了作业', resData);
    ctx.status = 200;
    ctx.body = resData;
  }

  async getMyHomework() {
    const { ctx } = this;
    const data = ctx.query;
    let username = ctx.cookies.get('username');
    let resData = await this.service.student.getMyHomework(data.course_id, data.study_class, data.name, username);

    console.log('获取了我的作业列表', resData);
    ctx.status = 200;
    ctx.body = resData;
  }

  mkdirPath(pathStr) {
    let projectPath = path.join(process.cwd());
    projectPath = projectPath.replace(/\\/g, '/');
    let tempDirArray = pathStr.split('\\');
    // console.log("temp: ", tempDirArray);
    for (let i = 0; i < tempDirArray.length; i++) {
      projectPath = `${projectPath}/${tempDirArray[i]}`;
      // console.log("projectPathNow: ", projectPath);
      if (fs.existsSync(projectPath)) {
        // console.log("existsSync: ", projectPath);
        let tempstats = fs.statSync(projectPath);
        if (!(tempstats.isDirectory())) {
          // console.log("isDirectory: ", projectPath);
          fs.unlinkSync(projectPath);
          fs.mkdirSync(projectPath);
        }
      }
      else {
        console.log("mkdirSync: ", projectPath);
        fs.mkdirSync(projectPath);
      }
    }
    return projectPath;
  }
}
module.exports = StudentController;

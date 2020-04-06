'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');
const archiver = require('archiver');

class TeacherController extends Controller {
  async editCourse() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async operateTask() {
    const { ctx } = this;
    let course_id, study_class, action, task, name, index, stream;
    let identity = ctx.cookies.get('identity');
    let file_name, uplaodBasePath, target;
    let resData = {};

    if (ctx.request.header['content-type'] == 'application/json;charset=UTF-8') { // 普通情况(修改任务信息、删除任务、添加任务时)
      course_id = ctx.request.body.course_id;
      study_class = ctx.request.body.study_class;
      action = ctx.request.body.action;
      task = ctx.request.body.task;
      resData = await this.service.teacher.operateTask(action, course_id, study_class, task);
    } else { // 上传附件时
      stream = await ctx.multipart();
      let part;
      while ((part = await stream()) != null) {
        if (part.length) {
          course_id = part[0] == 'course_id' ? part[1] : course_id;
          study_class = part[0] == 'study_class' ? part[1] : study_class;
          action = part[0] == 'action' ? part[1] : action;
          name = part[0] == 'name' ? part[1] : name;
          index = part[0] == 'index' ? part[1] : index;
        } else {
          console.log(part.filename);
          if (!part.filename) {
            continue;
          }
          file_name = part.filename;
          let uplaodBasePath = `\\accessory\\${study_class}\\${name}`;
          let target= path.join(this.config.baseDir, 'app/upload', `/accessory/${study_class}/${name}/`);
          this.mkdirPath(path.join('app\\upload', uplaodBasePath));
          task = {
            name,
            file_name
          }
          let isExist = await this.service.teacher.isExistFile(course_id, study_class, name, file_name);
          if (isExist) {
            ctx.status = 200;
            resData = {
              status: 1,
              msg: `已经存在${file_name}文件`,
            }
          } else {
            // 生成一个文件写入 文件流
            let writeStream = fs.createWriteStream(target + file_name);
            try { 
              // 异步把文件流 写入
              await awaitWriteStream(part.pipe(writeStream));
              resData = await this.service.teacher.operateTask(action, course_id, study_class, task);
              if (resData.changedRows == 1) {
                resData = {
                  status: 0,
                  msg: 'ok',
                  data: {
                    course_id: course_id,
                    study_class: study_class,
                  }
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
          }
          await sendToWormhole(part);
        }
      }
    }

    console.log('添加/编辑/删除了任务', resData);
    ctx.status = 200;
    ctx.body = resData;
  }

  async uploadResource() {
    const { ctx } = this;
    let stream = await ctx.getFileStream();
    let username = ctx.cookies.get('username');
    let name = decodeURI(ctx.cookies.get('name'), "utf8");
    let filename = stream.filename;
    let uplaodBasePath = `\\resource\\${username}`;
    let target= path.join(this.config.baseDir, 'app/upload', `/resource/${username}/`);
    this.mkdirPath(path.join('app\\upload', uplaodBasePath));
    let checkAddress = path.join(this.config.baseDir, `/app/upload/resource/${username}/`, filename).replace(/\\/g, '/');
    let resData = {};

    let isExist = await this.service.teacher.isExistResource(username, filename);
    if (isExist) {
      ctx.status = 200;
      resData = {
        status: 1,
        msg: `已经存在${filename}文件`,
      }
    } else {
      // 生成一个文件写入 文件流
      let writeStream = fs.createWriteStream(target + filename);
      try { 
        // 异步把文件流 写入
        await awaitWriteStream(stream.pipe(writeStream));
        resData = await this.service.teacher.uploadResource(username, name, filename);
        if (resData.affectedRows == 1) {
          resData = {
            status: 0,
            msg: 'ok',
          }
        }
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
    }

    console.log('上传了资源', resData);
    ctx.status = 200;
    ctx.body = resData;
  }

  async deleteResource() {
    const { ctx } = this;
    let data = ctx.request.body;
    let identity = ctx.cookies.get('identity');
    let username = ctx.cookies.get('username');
    let resData = await this.service.teacher.deleteResource(data, identity, username);

    ctx.status = 200;
    ctx.body = resData;
  }

  async downloadHomework() {
    const { ctx } = this;
    let data = ctx.request.body;
    let { course_id, study_class, course_name, name, requestArr } = data;
    let files = requestArr.map(item => {
      return {
        name: `${item.username}+${item.name}`,
        path: __dirname + `/../upload/homework/${study_class}/${name}/${item.username}/${item.name}`
      }
    })

    let zipPath = __dirname + `/../upload/download/${course_name}.zip`;
    //创建一最终打包文件的输出流
    let output = fs.createWriteStream(zipPath);
    //生成archiver对象，打包类型为zip
    let zipArchiver = archiver('zip');
    //将打包对象与输出流关联
    zipArchiver.pipe(output);
    for (let i = 0; i < files.length; i++) {
        console.log(files[i]);
        //将被打包文件的流添加进archiver对象中
        await zipArchiver.append(fs.createReadStream(files[i].path), {'name': files[i].name});
    }
    //打包
    await zipArchiver.finalize();

    ctx.status = 200;
    ctx.body = {
      status: 0,
      msg: 'ok',
      data: {
        url: `http://localhost:7001/static/download/${course_name}.zip`
      }
    }
  }

  async getAllHomework() {
    const { ctx } = this;
    let data = ctx.request.body;
    let resData = await this.service.teacher.getAllHomework(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async getStudents() {
    const { ctx } = this;
    const data = ctx.request.body;
    let resData = await this.service.teacher.getStudents(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async operateUser() {
    const { ctx } = this;
    let data = ctx.request.body;
    let resData = await this.service.teacher.operateUser(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async editNote() {
    const { ctx } = this;
    let data = ctx.request.body;
    let resData = await this.service.teacher.editNote(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  async getNoHomework() {
    const { ctx } = this;
    let data = ctx.request.body;
    let resData = await this.service.teacher.getNoHomework(data);

    ctx.status = 200;
    ctx.body = resData;
  }

  mkdirPath(pathStr) {
    let projectPath = path.join(process.cwd());
    projectPath = projectPath.replace(/\\/g, '/');
    let tempDirArray = pathStr.split('\\');
    for (let i = 0; i < tempDirArray.length; i++) {
      projectPath = `${projectPath}/${tempDirArray[i]}`;
      if (fs.existsSync(projectPath)) {
        let tempstats = fs.statSync(projectPath);
        if (!(tempstats.isDirectory())) {
          fs.unlinkSync(projectPath);
          fs.mkdirSync(projectPath);
        }
      }
      else {
        fs.mkdirSync(projectPath);
      }
    }

    return projectPath;
  }
}

module.exports = TeacherController;

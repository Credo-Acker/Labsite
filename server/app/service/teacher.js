const Service = require('egg').Service;
const crypto = require('crypto');

class TeacherService extends Service {
  async operateTask(action, course_id, study_class, task) {
    let resData = {
      status: 1,
      msg: '操作出错'
    }
    if (action == 'add') { // 添加实验任务
      resData = await this.app.mysql.query(`insert into task (study_class, name, create_time, deadline, accessory) 
        values ('${study_class}', '${task.name}', '${new Date().getTime()}', '${task.deadline}', '/')`)
      if (resData.affectedRows == 1) {
        resData = {
          status: 0,
          msg: 'ok'
        }
      }
    } else if (action == 'edit') { // 'edit' 编辑任务的名字、截止上传时间、添加附件
      if (task.file_name) { // 添加附件
        resData = await this.app.mysql.query(`update task set accessory=concat(accessory, '${task.file_name}/') 
          where study_class='${study_class}' and name='${task.name}'`);
      } else {
        resData = await this.app.mysql.query(`update task set name='${task.rename}', deadline='${task.redeadline}' 
          where study_class='${study_class}' and name='${task.name}'`);
      }
      if (resData.affectedRows == 1) {
        resData = {
          status: 0,
          msg: 'ok'
        }
      }
    } else if (action == 'delete') {
      if (task.deleteAcce == 'true') { // 删除附件
         let accessory = await this.app.mysql.query(`select accessory from task where study_class='${study_class}' and name='${task.name}'`)
        accessory = accessory[0].accessory.split('/');
        accessory.splice(accessory.indexOf(task.accessory), 1);
        resData = await this.app.mysql.query(`update task set accessory='${accessory.join('/')}' where study_class='${study_class}' and name='${task.name}'`);
        if (resData.affectedRows == 1) {
          resData = {
            status: 0,
            msg: 'ok'
          }
        }
      } else { // 删除实验任务
        resData = await this.app.mysql.query(`delete from task where study_class='${study_class}' and name='${task.name}'`)
        if (resData.affectedRows == 1) {
          resData = {
            status: 0,
            msg: 'ok'
          }
        }
      }
    }

    return resData;
  }

  async isExistFile(course_id, study_class, name, filename) {
    let accessory = await this.app.mysql.query(`select accessory from task where study_class='${study_class}' and name='${name}'`);
    accessory = accessory[0].accessory.split('/');
    let whichIndex = accessory.indexOf(filename);

    return whichIndex == -1 ? false : true;
  }
  
  async isExistResource(username, filename) {
    let data = await this.app.mysql.query(`select id from resource where username='${username}' and name='${filename}'`);

    return data.length > 0 ? true : false;
  }

  async uploadResource(username, name, filename) {
    let resData = await this.app.mysql.query(`insert into resource (name, teacher, username, address, create_time) values ('${filename}', '${name}', '${username}', '/resource/${username}/${filename}', '${new Date().getTime()}')`);

    return resData;
  }

  async deleteResource(data, identity, username) {
    let { filename, teacher } = data;
    let resData = {};
    if (identity == 2) {
      resData = await this.app.mysql.query(`delete from resource where name='${filename}' and username='${teacher}' and username='${username}'`);
    } else if (identity == 3) {
      resData = await this.app.mysql.query(`delete from resource where name='${filename}' and username='${teacher}'`);
    }

    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    } else {
      resData = {
        status: 1,
        msg: '删除失败'
      }
    }

    return resData;
  }

  async getAllHomework(data) {
    let { course_id, study_class, task_name, page } = data;
    let total = await this.app.mysql.query(`select count(*) as total from homework 
      where study_class='${study_class}' and task_name='${task_name}'`);
    total = total[0].total;
    let resData = await this.app.mysql.query(`select name, username, student_name, create_time from homework 
      where study_class='${study_class}' and task_name='${task_name}' 
      limit ${page * 10},10`)
    
    if (resData.length != 0 && total != 0) {
      resData = {
        status: 0,
        msg: 'ok',
        data: {
          total: total,
          data: resData,
          page: page
        }
      }
    } else {
      resData = {
        status: 0,
        msg: 'ok',
        data: {
          total: 0,
          data: [],
          page: page
        }
      }
    }

    return resData;
  }

  async getStudents(data) {
    let { keyword, type, page } = data;
    let want = ['username', 'name', 'sex', 'class', 'major', 'academy', 'grade', 'email'];

    let total = await this.app.mysql.query(`select count(*) as total from user where ${type} like '%${keyword}%' and identity=1`);
    total = total.length != 0 ? total[0].total : 0;
    let resUser = await this.app.mysql.query(`select ${want.join(',')} from user where ${type} like '%${keyword}%' and identity=1 limit ${page * 10},10`);
    
    let resData = {
      status: 0,
      msg: 'ok',
      data: {
        total,
        page,
        data: resUser
      }
    }

    return resData;
  }

  async operateUser(data) {
    let { action, username, userData } = data;
    let md5 = crypto.createHash('md5');
    let resData = {};
    if (action == 'edit') { // 修改
      let reUsername = userData.username == '' ? 'username' : `'${userData.username}'`;
      let rePassword = userData.password == '' ? 'password' : `'${md5.update(userData.password).digest('hex')}'`;
      let reName = userData.name == '' ? 'name' : `'${userData.name}'`;
      let reEmail = userData.email == '' ? 'email' : `'${userData.email}'`;
      resData = await this.app.mysql.query(`update user set username=${reUsername}, password=${rePassword}, name=${reName}, email=${reEmail} where username='${username}'`);
    } else if (action == 'delete') { // 删除
      resData = await this.app.mysql.query(`delete from user where username='${username}'`);
    }
    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    } else {
      resData = {
        status: 1,
        msg: '操作出错'
      }
    }
    
    return resData;
  }

  async editNote(data) {
    let { course_id, study_class, note } = data;
    let resData = await this.app.mysql.query(`update class set note='${note}' where study_class='${study_class}'`);

    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    } else {
      resData = {
        status: 1,
        msg: '操作出错'
      }
    }

    return resData;
  }

  async getNoHomework(data) {
    let { course_id, study_class, name } = data;
    let want = ['a.username', 'b.name'];
    let students = await this.app.mysql.query(`select ${want.join(',')} from student_course a 
      left join user b on a.username=b.username 
      where a.study_class='${study_class}' and a.username not in 
      (select distinct username from homework where study_class='${study_class}' and task_name='${name}')`);
    let resData = {
      status: 0,
      msg: 'ok',
      data: students
    };

    return resData;
  }

}

module.exports = TeacherService;
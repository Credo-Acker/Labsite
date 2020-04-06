const Service = require('egg').Service;
const crypto = require('crypto');

class StudentService extends Service {

  async getMyHomework(course_id, study_class, name, username) {
    let arr = ['name', 'create_time', 'address'];
    let data = await this.app.mysql.query(`select ${arr.join(',')} from homework where study_class='${study_class}' and task_name='${name}' and username='${username}' order by create_time asc`);
    let resData = {};
    resData = {
      status: 0,
      msg: 'ok',
      data
    }

    return resData;
  }

  async editHomework(action, course_id, study_class, name, student_name, username, filename) {
    let resData = {};
    if (action == 'add') { // 上传作业
      resData = await this.app.mysql.query(`insert into homework (name, username, student_name, create_time, study_class, task_name, address) 
        values ('${filename}', '${username}', '${student_name}', '${new Date().getTime()}', '${study_class}', '${name}', '/static/homework/${course_id}_${study_class}/${name}/${username}/${filename}')`)
    } else if (action == 'delete') { // 删除某作业
      resData = await this.app.mysql.query(`delete from homework where name='${filename}' and username='${username}' and study_class='${study_class}' and task_name='${name}'`)
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

  async isExistFile(course_id, study_class, name, username, filename) {
    let homework = await this.app.mysql.query(`select name from homework where study_class='${study_class}' and name='${filename}' and task_name='${name}' and username='${username}'`);

    return homework.length < 1 ? false : true;
  }

  async isDeadline(course_id, study_class, name) {
    console.log(course_id, study_class, name);
    let time = await this.app.mysql.query(`select deadline from task where study_class='${study_class}' and name='${name}'`);
    console.log(time);
    time = time[0].deadline;

    return time >= new Date().getTime() ? false : true;
  }

}

module.exports = StudentService;
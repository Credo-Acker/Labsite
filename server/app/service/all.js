const Service = require('egg').Service;
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class AllService extends Service {
  async login(data) {
    // md5加密密码验证
    let md5 = crypto.createHash('md5');
    let md5Update = md5.update(data.password).digest('hex');
    let userData = await this.app.mysql.query(`select name, identity, email from user where username="${data.username}" and password="${md5Update}"`);
    
    return userData;
  }

  async getMyCourse(username, identity, page) {
    let resData = {};
    if (identity == 1) { // 学生获取我的课程
      // let want = ['a.course_id', 'b.course_name', 'c.name as course_teacher', 'b.study_class', 'b.create_time', 'b.note'];
      let want = ['a.study_class', 'a.course_id', 'b.course_name', 'a.create_time', 'a.note', 'c.name as course_teacher'];
      let total = await this.app.mysql.query(`select count(*) as total from student_course where username='${username}'`);
      total = total.length > 0 ? total[0].total : 0;
      let courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
        left join course b on a.course_id=b.course_id
        left join user c on a.course_teacher_id=c.username
        where a.study_class in (select study_class from student_course where username='${username}') 
        limit ${page * 10},10`);
      resData = {
        total,
        page,
        data: courseData
      }
    } else if (identity == 2) { // 教师获取我的课程
      // let want = ['course_id', 'course_name', 'course_teacher', 'study_class', 'create_time', 'note'];
      let want = ['a.study_class', 'a.course_id', 'b.course_name', 'a.create_time', 'a.note', 'c.name as course_teacher'];
      let total = await this.app.mysql.query(`select count(*) as total from class where course_teacher_id='${username}'`);
      total = total.length > 0 ? total[0].total : 0;
      let courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
        left join course b on a.course_id=b.course_id
        left join user c on a.course_teacher_id=c.username
        where a.course_teacher_id='${username}'
        limit ${page * 10},10`);
      // let courseData = await this.app.mysql.query(`select ${want.join(',')} from course where course_teacher_id='${username}' limit ${page * 10},10`);
      resData = {
        total,
        page,
        data: courseData
      }
    }

    return resData;
  }

  async getAllCourse(page) {
    let period = await this.app.mysql.query(`select period from period order by period desc limit 1`);
    period = period[0].period;
    let want = ['a.course_id', 'b.course_name', 'c.name as course_teacher', 'a.study_class', 'a.create_time', 'a.note'];
    let total = await this.app.mysql.query(`select count(*) as total from class where period=${period}`);
    let courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
      left join course b on a.course_id=b.course_id 
      left join user c on a.course_teacher_id=c.username 
      where period=${period} 
      limit ${page * 10},10`);
    let resData = {
      total: total[0].total,
      page: page,
      data: courseData
    }
    
    return resData;
  }

  async searchCourse(data) {
    let { keyword, type, page } = data;
    let want = ['a.course_id', 'b.course_name', 'c.name as course_teacher', 'a.study_class', 'a.create_time', 'a.note'];
    let total = 0;
    let courseData = [];
    let period = await this.app.mysql.query(`select period from period order by period desc limit 1`);
    period = period[0].period;
    if (type == 'teacher') {
      total = await this.app.mysql.query(`select count(*) as total from class a where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2) and a.period=${period}`);
      courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
        left join course b on a.course_id=b.course_id
        left join user c on a.course_teacher_id=c.username
        where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2) 
        and period=${period}
        order by a.course_id asc
        limit ${page * 10},10 `);
    } else if (type == 'name') {
      total = await this.app.mysql.query(`select count(*) as total from class a where a.course_id in (select course_id from course where course_name like '%${keyword}%') and a.period=${period}`);
      courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
        left join course b on a.course_id=b.course_id
        left join user c on a.course_teacher_id=c.username
        where a.course_id in (select course_id from course where course_name like '%${keyword}%')
        and a.period=${period}
        order by a.course_id asc
        limit ${page * 10},10`);
    }
    let resData = {
      total: total[0].total,
      page: page,
      data: courseData
    }

    return resData;
  }

  async getResource(data) {
    let { keyword, type, page } = data;
    let want = ['name', 'teacher', 'address', 'username', 'create_time'];

    let total = await this.app.mysql.query(`select count(*) as total from resource where ${type} like '%${keyword}%'`);
    let resourceData = await this.app.mysql.query(`select ${want.join(',')} from resource where ${type} like '%${keyword}%' limit ${page * 10},10 `);
    let resData = {
      total: total[0].total,
      page: page,
      data: resourceData
    }

    return resData;
  }

  async requestEditPassword(username) {
    let resData = {};
    let emailAddress = await this.app.mysql.query(`select email from user where username='${username}'`);
    if (emailAddress.length == 1) {
      let code = `${parseInt(Math.random()* 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}`;
      emailAddress = emailAddress[0].email;
      let mailOptions = {
        // from: '"【重要】重置密码" <cqupt_em@126.com>', // sender address
        from: '"【重要】重置密码" <942794848@qq.com>', // sender address
        to: emailAddress, // list of receivers
        subject: '修改密码',
        html: `<p>以下是你的重置密码安全码：<b><span style="color: red">${code}</span></b></p>`
      };
      console.log(mailOptions);
      let messageId = await this.sendEmail(mailOptions);
      resData = await this.app.mysql.query(`insert into code (code, messageId, create_time, username) values ('${code}', '${messageId}', '${new Date().getTime()}', '${username}')`);
      if (resData.affectedRows == 1) {
        resData = {
          status: 0,
          msg: 'ok',
          data: {
            messageId: messageId
          }
        }
      } else {
        resData = { 
          status: 1,
          msg: '系统出错',
          data: {}
        }
      }
    } else {
      resData = { 
        status: 1,
        msg: '没有设置重置密码邮箱',
        data: {}
      }
    }

    return resData;
  }

  async confirmEditPassword(data, messageId) {
    let { username, password, code } = data;
    let resData = {};
    let datetime = new Date().getTime();
    let checkData = await this.app.mysql.query(`select * from code where code='${code}' and messageId='${messageId}'`);
    if (checkData.length == 1) {
      checkData = checkData[0];
      if (code == checkData.code && username == checkData.username && checkData.valide == 0 && ((datetime - checkData.create_time) / 1000) <= 1800) {
        let md5 = crypto.createHash('md5');
        let md5Update = md5.update(password).digest('hex');
        let changeData = await this.app.mysql.query(`update user set password='${md5Update}' where username='${username}'`);
        await this.app.mysql.query(`update code set valide=1 where code='${code}' and messageId='${messageId}'`);
        if (changeData.affectedRows == 1) {
          resData = {
            status: 0,
            msg: 'ok'
          }
        } else {
          resData = {
            status: 1,
            msg: '修改失败'
          }
        }
      } else {
        resData = {
          status: 1,
          msg: '安全码错误或安全码已过期'
        }
      }
    } else {
      resData = {
        status: 1,
        msg: '服务器出错！'
      }
    }

    return resData;
  }

  async setEmail(data) {
    let { username, email } = data;
    let code = `${parseInt(Math.random()* 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}${parseInt(Math.random() * 10)}`;
    let mailOptions = {
      // from: '"【重要】重置密码" <cqupt_em@126.com>', // sender address
      from: '"【重要】绑定邮箱" <942794848@qq.com>', // sender address
      to: email, // list of receivers
      subject: '绑定邮箱',
      html: `<p>以下是你的绑定邮箱安全码：<b><span style="color: red">${code}</span></b></p>`
    };
    console.log(mailOptions)
    let messageId = await this.sendEmail(mailOptions);
    console.log(messageId)
    let resData = await this.app.mysql.query(`insert into code (code, messageId, create_time, username) values ('${code}', '${messageId}', '${new Date().getTime()}', '${username}')`);
    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok',
        data: {
          messageId: messageId
        }
      }
    } else {
      resData = { 
        status: 1,
        msg: '系统出错',
      }
    }

    return resData;
  }

  async confirmEmail(data) {
    let { username, email, messageId, code } = data;
    let resData = {};
    let datetime = new Date().getTime();
    let checkData = await this.app.mysql.query(`select * from code where code='${code}' and messageId='${messageId}'`);
    if (checkData.length == 1) {
      checkData = checkData[0];
      if (code == checkData.code && username == checkData.username && checkData.valide == 0 && ((datetime - checkData.create_time) / 1000) <= 1800) {
        let changeData = await this.app.mysql.query(`update user set email='${email}' where username='${username}'`);
        await this.app.mysql.query(`update code set valide=1 where code='${code}' and messageId='${messageId}'`);
        if (changeData.affectedRows == 1) {
          resData = {
            status: 0,
            msg: 'ok'
          }
        } else {
          resData = {
            status: 1,
            msg: '绑定失败'
          }
        }
      } else {
        resData = {
          status: 1,
          msg: '安全码错误或安全码已过期，绑定失败'
        }
      }
    } else {
      resData = {
        status: 1,
        msg: '服务器出错！'
      }
    }

    return resData;
  }

  sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport({
        service: 'qq', 
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          // user: 'cqupt_em@126.com',
          // pass: 'GMBFGPVVWEMWAULM',
          user: '942794848@qq.com',
          pass: 'xsijscpksbaybahi'
        }
      });

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        } else {
          resolve(info.messageId);
        }
        // console.log('Message sent: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
      });
    })
  }
  
  async getTask(data) {
    let { study_class } = data;
    let resData = await this.app.mysql.query(`select * from task where study_class='${study_class}' order by create_time asc`);
    resData = {
      status: 0,
      msg: 'ok',
      data: resData
    }

    return resData;
  }
}

module.exports = AllService;
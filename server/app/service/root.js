const Service = require('egg').Service;
const cheerio = require('cheerio');
const request = require('request');
const xlsx2json = require('node-xlsx');
const crypto = require('crypto');

class RootService extends Service {
  async createNewPeriod(period) {
    let resData = await this.app.mysql.query(`insert into period (period) values (${period})`);
    if (resData.affectedRows == 1 && resData.message == '') {
      resData = {
        status: 0,
        msg: 'ok'
      }
    } else {
      resData = {
        status: 1,
        msg: message
      }
    }

    return resData;
  }

  async createNewCourse(url) {
    let resData = {};
    let data = await getData();
    if (data.length > 0) {
      let arr = [];
      let sql = `insert ignore into course (course_id, course_name, create_time) values `; // 导入新课程到课程表中的sql（course）
      for (let i = 0; i < data.length; i++) {
        if (i != data.length - 1) {
          sql += `('${data[i].course_id}', '${data[i].course_name}', '${new Date().getTime()}'), `;
        } else {
          sql += `('${data[i].course_id}', '${data[i].course_name}', '${new Date().getTime()}')`;
        }
        let result = await this.app.mysql.query(`select username from user where name="${data[i].teacher_name}"`);
        if (result.length != 0) {
          data[i]['teacher_id'] = result[0].username;
        }
        data[i].isImport = false;
        arr.push(data[i]);
      }
      await this.app.mysql.query(sql);
      resData = {
        status: 0,
        msg: 'ok',
        data: arr
      }
    }
    return resData;


    function getData() {
      return new Promise(resolve => {
        request(url, (err, res) => {
          if (err) {
              console.log(err);
          }
          
          let $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
          let tr = $('.printTable table tbody').children(); // 行
          let arr = []; // 存放教学班表
          tr.each((key, item) => {
            if (item.children[0].children[0].data == '实验实践') {
              arr.push({
                'course_id': item.children[2].children[0].data.split('-')[0],
                'course_name': item.children[2].children[0].data.split('-')[1],
                'study_class': item.children[4].children[0].data,
                'note': item.children[7].children[0].data + item.children[7].children[2].data,
                'teacher_name': item.children[8].children[0].data.replace(/（经管）|（经）|（外聘）|\(经管\)|\(经\)|\(外聘\)/g, ''),
              })
            }
          })
          // console.log(arr);
          resolve(arr);
        });
      })
    }
    
  }

  async comfirmNewCourse(course) {
    let resData = {};
    let period = await this.app.mysql.query(`select period from period order by period DESC limit 1`);
    if (period != []) {
      period = period[0].period;
    } else {
      return {
        status: 1,
        msg: '确认失败'
      };
    }
    let sql = `insert into class (study_class, course_id, course_teacher_id, period, create_time, note) values `;
    for (let i = 0; i < course.length; i++) {
      if (i !== course.length - 1) {
        sql += `("${course[i].study_class}", "${course[i].course_id}", "${course[i].teacher_id}", ${period}, "${new Date().getTime()}", "${course[i].note}"), `;
      } else {
        sql += `("${course[i].study_class}", "${course[i].course_id}", "${course[i].teacher_id}", ${period}, "${new Date().getTime()}", "${course[i].note}")`;
      }
      
    }
    resData = await this.app.mysql.query(sql);
    if (resData.affectedRows == course.length) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    }
    return resData;
  }

  async importStudentList(data) {
    let { course_id, study_class, teacher_id } = data;
    let resData = {};
    let { list } = await getData(study_class);
    if (list.length > 0) {
      // 先删除选课表中信息
      await this.app.mysql.query(`delete from student_course where study_class='${study_class}'`);

      // 再添加到选课表
      let sql = `insert ignore into student_course (study_class, username) value `;
      for (let i = 0; i < list.length; i++) {
        // 添加该课程到每个学生信息中
        if (i < list.length - 1) {
          sql += `('${study_class}', '${list[i].username}'),`;
        } else {
          sql += `('${study_class}', '${list[i].username}')`;
        }
      }
      let result = await this.app.mysql.query(sql);
      
      resData = {
        status: 0,
        msg: 'ok',
        data: list
      }
    } else {
      resData = {
        status: 1,
        msg: '未找到学生名单',
      }
    }
    return resData;

    function getData(study_class) {
      return new Promise(resolve => {
        request(`http://jwc.cqupt.edu.cn/kebiao/kb_stuList.php?jxb=${study_class}`, (err, res) => {
          if (err) {
            console.log(err);
          }
          let $$ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
          let trr = $$('#stuListTabs-current table tbody').children(); // 行
      
          let list = [];
          let arr = [];
          trr.each((index, value) => {
            // console.log('id', value.children[0].children[0].data);
            // console.log('学号', value.children[1].children[0].data);
            // console.log('姓名', value.children[2].children[0].data)
            // console.log('性别', value.children[3].children[0].data)
            // console.log('班级', value.children[4].children[0].data)
            // console.log('专业名', value.children[6].children[0].data)
            // console.log('学院', value.children[7].children[0].data)
            // console.log('年级', value.children[8].children[0].data)
            list.push({
              username: value.children[1].children[0].data, // 学号
              name: value.children[2].children[0].data, // 姓名
              sex: value.children[3].children[0].data, // 性别
              class: value.children[4].children[0].data, // 班级
              major: value.children[6].children[0].data, // 专业名
              academy: value.children[7].children[0].data, // 学院
              grade: value.children[8].children[0].data, // 年级
            })
            // arr.push({
            //   username: value.children[1].children[0].data, // 学号
            //   name: value.children[2].children[0].data, // 姓名
            // })
          })
          resolve({ list });
        });
      })
    }
  }

  async getCourseRoot(data) {
    let { keyword, type, page, period } = data;
    let want = ['a.study_class', 'a.course_id', 'b.course_name', 'a.course_teacher_id', 'a.create_time', 'a.note', 'c.name as course_teacher'];
    let resData = {
      status: 1,
      msg: '查询失败',
    };
    let total = 0;
    let courseData = {};

    if (period != '') {
      if (type == 'teacher') {
        total = await this.app.mysql.query(`select count(*) as total from class a where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2) and a.period=${period}`);
        courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
          left join course b on a.course_id=b.course_id
          left join user c on a.course_teacher_id=c.username
          where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2) 
          and a.period=${period}
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
      resData = {
        status: 0,
        msg: 'ok',
        data: {
          total: total[0].total,
          page: page,
          data: courseData
        }
      }
    } else {
      if (type == 'teacher') {
        total = await this.app.mysql.query(`select count(*) as total from class a where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2)`);
        courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
          left join course b on a.course_id=b.course_id
          left join user c on a.course_teacher_id=c.username
          where a.course_teacher_id in (select username from user where name like '%${keyword}%' and identity=2) 
          order by a.course_id asc
          limit ${page * 10},10 `);
      } else if (type == 'name') {
        total = await this.app.mysql.query(`select count(*) as total from class a where a.course_id in (select course_id from course where course_name like '%${keyword}%')`);
        courseData = await this.app.mysql.query(`select ${want.join(',')} from class a 
          left join course b on a.course_id=b.course_id
          left join user c on a.course_teacher_id=c.username
          where a.course_id in (select course_id from course where course_name like '%${keyword}%') 
          order by a.course_id asc
          limit ${page * 10},10 `);
      }
      resData = {
        status: 0,
        msg: 'ok',
        data: {
          total: total[0].total,
          page: page,
          data: courseData
        }
      }
    }

    return resData;
  }

  async getPeriod() {
    let data = await this.app.mysql.query(`select period from period`);
    if (data.length != 0) {
      return {
        status: 0,
        msg: 'ok',
        data: data
      }
    } else {
      return {
        status: 1,
        msg: '查询学期失败',
      }
    }
  }

  async getStudentList(data) {
    let { study_class } = data;
    let want = [
      'a.username',
      'b.name',
      'b.sex',
      'b.class',
      'b.major',
      'b.academy',
      'b.grade'
    ];
    let sql = `select ${want.join(',')} from student_course a left join user b on b.username=a.username where a.study_class='${study_class}'`;
    let resData = {
      status: 1,
      msg: '查询失败'
    };
    let student = await this.app.mysql.query(sql);
    if (student.length > 0) {
      resData = {
        status: 0,
        msg: 'ok',
        data: student
      }
    }

    return resData;
  }

  async operateStudentFromCourse(data) {
    let { action, study_class, username } = data;
    let resData = {
      status: 1,
      msg: '操作失败'
    };
    if (action == 'delete') {
      let result = await this.app.mysql.query(`delete from student_course where username='${username}' and study_class='${study_class}'`);
      if (result.affectedRows == 1) {
        resData = {
          status: 0,
          msg: 'ok',
        }
      } else {
        resData = {
          status: 1,
          msg: '删除失败',
        }
      }
    } else if (action == 'add') {
      let result = await this.app.mysql.query(`insert ignore into student_course (username, study_class) values ('${username}', '${study_class}')`);
      if (result.affectedRows == 1) {
        resData = {
          status: 0,
          msg: 'ok',
        }
      } else {
        resData = {
          status: 1,
          msg: '添加失败',
        }
      }
    }

    return resData;
  }

  async getAllUser(data) {
    let { keyword, identity, type, page } = data;
    let want = identity == 1 ? ['username', 'name', 'sex', 'class', 'major', 'academy', 'grade', 'email'] : ['username', 'name', 'email'];

    let total = await this.app.mysql.query(`select count(*) as total from user where ${type} like '%${keyword}%' and identity=${identity}`);
    total = total.length != 0 ? total[0].total : 0;
    let resUser = await this.app.mysql.query(`select ${want.join(',')} from user where ${type} like '%${keyword}%' and identity=${identity} limit ${page * 10},10`);
    
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

  async importNewStudent(filename) {
    let list = await xlsx2json.parse(this.config.baseDir + `/app/upload/user/${filename}`);
    let md5 = crypto.createHash('md5');
    let password = md5.update('123').digest('hex');
    let users = list[0].data;
    let resData = {};
    let sql = `insert ignore into user (${users[0].join(',')}, password, identity) values`;
    for (let i = 1; i < users.length; i++) {
      users[i] = users[i].map(item => `'${item}'`);
      if (i < users.length - 1) {
        sql += `(${users[i].join(',')}, '${password}', 1), `;
      } else {
        sql += `(${users[i].join(',')}, '${password}',1)`;
      }
    }
    resData = await this.app.mysql.query(sql);
    resData = {
      status: 0,
      msg: 'ok'
    }

    return resData;
  }

  async importNewTeacher(data) {
    let { username, name } = data;
    let md5 = crypto.createHash('md5');
    let password = md5.update('123').digest('hex');
    let resData = await this.app.mysql.query(`insert into user (username, name, password, identity) values ('${username}', '${name}', '${password}', 2)`);

    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    } else {
      resData = {
        status: 1,
        msg: '插入失败'
      }
    }

    return resData;
  }

  async operateCourse(data) {
    let { action, course_id, study_class, course_name, course_teacher, course_teacher_id, note } = data;
    let resData = {};
    if (action == 'add') { // 添加课程
      let period = await this.app.mysql.query(`select period from period order by period DESC limit 1`);
      if (period != []) {
        period = period[0].period;
      }
      resData = await this.app.mysql.query(`insert into course (course_id, study_class, course_name, course_teacher, course_teacher_id, note, create_time, period) values ('${course_id}', '${study_class}', '${course_name}', '${course_teacher}', '${course_teacher_id}', '${note}', '${new Date().getTime()}', ${period})`);
    } else if (action == 'edit') { // 编辑课程
      console.log(`update course set course_name='${course_name}', note='${note}', course_teacher='${course_teacher}', course_teacher_id='${course_teacher_id}' where course_id='${course_id}' and study_class='${study_class}'`)
      resData = await this.app.mysql.query(`update course set course_name='${course_name}', note='${note}', course_teacher='${course_teacher}', course_teacher_id='${course_teacher_id}' where course_id='${course_id}' and study_class='${study_class}'`);
    } else if (action == 'delete') { // 删除课程
      resData = await this.app.mysql.query(`delete from course where course_id='${course_id}' and study_class='${study_class}'`);
    }

    if (resData.affectedRows == 1) {
      resData = {
        status: 0,
        msg: 'ok'
      }
    }
     
    return resData;
  }

}

module.exports = RootService;
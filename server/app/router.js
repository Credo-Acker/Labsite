'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  let jwt = app.middleware.jwt('', app);
  let student = app.middleware.student('', app);
  let teacher = app.middleware.teacher('', app);
  let root = app.middleware.root('', app);

  // 登录接口 【学生/教师/管理员】
  router.post('/api/research/login', controller.all.login);

  // 退出接口 【学生/教师/管理员】
  router.get('/api/research/logout', jwt, controller.all.logout);

  // 检查登录接口 【学生/教师/管理员】
  router.get('/api/research/checkLogin', jwt, controller.all.checkLogin);

  // 获取全部课程列表 【学生/教师/管理员】
  router.post('/api/research/getAllCourse', controller.all.getAllCourse);

  // 搜索课程 【学生/教师/管理员】
  router.post('/api/research/searchCourse', controller.all.searchCourse);

  // 获取我的课程 【学生/教师】
  router.post('/api/research/getMyCourse', jwt, student, controller.all.getMyCourse);

  // 发布任务（修改任务）【教师】
  router.post('/api/research/operateTask', jwt, teacher,controller.teacher.operateTask);

  // 上传作业（删除作业）【学生】
  router.post('/api/research/editHomework', jwt, student, controller.student.editHomework);

  // 获取我的作业列表 【学生】
  router.get('/api/research/getMyHomework', jwt, student, controller.student.getMyHomework);

  // 新建学期 /api/research/createNewPeriod 【管理员】 
  router.get('/api/research/createNewPeriod', jwt, root, controller.root.createNewPeriod);

  // 导入新学期课程 【管理员】
  router.post('/api/research/createNewCourse', jwt, root, controller.root.createNewCourse);

  // 确认新学期课程 【管理员】
  router.post('/api/research/comfirmNewCourse', jwt, root, controller.root.comfirmNewCourse);

  // 导入学生名单 【管理员】
  router.post('/api/research/importStudentList', jwt, root, controller.root.importStudentList);

  // 获取管理课程列表 【管理员】
  router.post('/api/research/getCourseRoot', jwt, root, controller.root.getCourseRoot);

  // 获取学期 【管理员】 
  router.get('/api/research/getPeriod', jwt, root, root, controller.root.getPeriod);

  // 获取学生名单 【管理员/教师】 
  router.post('/api/research/getStudentList', jwt, teacher, controller.root.getStudentList);

  // 从课程中删除/新增某学生 【管理员/教师】
  router.post('/api/research/operateStudentFromCourse', jwt, teacher, controller.root.operateStudentFromCourse);

  // 上传资源 【教师】
  router.post('/api/research/uploadResource', jwt, teacher, controller.teacher.uploadResource);

  // 删除资源 【教师/管理员】
  router.post('/api/research/deleteResource', jwt, teacher, controller.teacher.deleteResource);

  // 获取资源 【学生/教师/管理员/无状态】
  router.post('/api/research/getResource', controller.all.getResource);

  // 下载学生作业 【教师】
  router.post('/api/research/downloadHomework', jwt, teacher, controller.teacher.downloadHomework);

  // 申请修改密码 【无状态/学生/教师】
  router.get('/api/research/requestEditPassword', controller.all.requestEditPassword);

  // 确认修改密码 【无状态/学生/教师】
  router.post('/api/research/confirmEditPassword', controller.all.confirmEditPassword);

  // 设置邮箱 【学生/教师/管理员】
  router.post('/api/research/setEmail', jwt, controller.all.setEmail);

  // 确认邮箱 【学生/教师】
  router.post('/api/research/confirmEmail', jwt, controller.all.confirmEmail);

  // 获取所有作业列表 【教师】
  router.post('/api/research/getAllHomework', jwt, teacher, controller.teacher.getAllHomework);

  // 获取人员列表 【管理员】
  router.post('/api/research/getAllUser', jwt, root, controller.root.getAllUser);

  // 获取人员列表 【教师】
  router.post('/api/research/getStudents', jwt, teacher, controller.teacher.getStudents);

  // 修改/删除人员 【教师】
  router.post('/api/research/operateUser', jwt, teacher, controller.teacher.operateUser);

  // 修改课程备注 【教师】
  router.post('/api/research/editNote', jwt, teacher, controller.teacher.editNote);

  // 导入学生 【管理员】
  router.post('/api/research/importNewStudent', jwt, root, controller.root.importNewStudent);

  // 添加教师 【管理员】
  router.post('/api/research/importNewTeacher', jwt, root, controller.root.importNewTeacher);

  // 获取某实验的任务 【学生/教师】 
  router.post('/api/research/getTask', jwt, student, controller.all.getTask);

  // 获取未上传作业列表【教师】  
  router.post('/api/research/getNoHomework', jwt, teacher, controller.teacher.getNoHomework);

  // 删除/编辑/新增课程 【管理员】
  router.post('/api/research/operateCourse', jwt, root, controller.root.operateCourse);

  // 下载文件
  router.get('/api/research/download', controller.all.download);


};

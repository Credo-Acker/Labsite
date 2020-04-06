/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
const Token = require('./token.js');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1582442335485_4345';

  // add your middleware config here
  // config.middleware = [ 'jwt' ];

  config.security = {
　　csrf: {
　　  enable: false
　　},
    domainWhiteList: [ 'http://localhost:8080' ]
　};

  // config.cors = {
  //   origin: 'http://localhost:8080',
  //   credentials: true,
  //   allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
  // };

  config.jwt = {
    secret: Token //token 的加密条件字符串
  };

  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '1234',
      database: 'labsite',
    },
  }

  config.static = {
    prefix:'/static/',
    dir: [path.join(appInfo.baseDir, 'app/public'), path.join(appInfo.baseDir, 'app/upload')]
  }

  config.multipart = {
    mode: 'stream',
    fileExtensions: [ '.pptx', '.docx', '.doc', '.cpp', '.pdf', '.xlsx' ]
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};

'use strict'
const jwt = require('jsonwebtoken') //引入jsonwebtoken

module.exports = (options, app) => {
  return async function userInterceptor(ctx, next) {
    let authToken = ctx.cookies.get('token'); // 获取cookie中的token
    let identity = ctx.cookies.get('identity'); // 获取cookie中的identity
    if (authToken) {
      try {
        let res = jwt.verify(authToken, app.config.jwt.secret);
        if (res.identity >= 1 && identity >= 1) {
          await next();
        } 
      } catch (error) {
        console.log(error);
        ctx.body = {
          status: 1,
          msg: error
        }
        ctx.status = 200;
      }
      // await next();
    } else {
      ctx.body = {
        status: 1,
        msg: '权限不足'
      }
      ctx.status = 200;
    }
  }
}

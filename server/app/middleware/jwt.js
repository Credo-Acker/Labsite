'use strict'
const jwt = require('jsonwebtoken') //引入jsonwebtoken

module.exports = (options, app) => {
  return async function userInterceptor(ctx, next) {
    let authToken = ctx.cookies.get('token'); // 获取cookie中的token
    if (authToken) {
      try {
        let res = jwt.verify(authToken, app.config.jwt.secret);
        let token = jwt.sign({
          username: res.username,
          name: res.name,
          identity: res.identity //需要存储的 token 数据
        }, app.config.jwt.secret, { expiresIn: '1h' });
        ctx.cookies.set("token", token, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
        });
        ctx.cookies.set("username", res.username, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
        });
        ctx.cookies.set("name", encodeURI(res.name, "utf8"), {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
        });
        ctx.cookies.set("identity", res.identity, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
        });
      } catch (error) {
        console.log(error);
        ctx.body = {
          status: 1,
          msg: '登录已过期或未登录'
        }
        ctx.status = 200;
      }
      await next();
    } else {
      ctx.body = {
        status: 1,
        msg: '登录已过期或未登录'
      }
      ctx.status = 200;
    }
  }
}

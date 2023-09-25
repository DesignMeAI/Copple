const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
    createProxyMiddleware("/api",{
      target:"http://3.39.153.9:3000",
      changeOrigin:true,
    })
  )
}
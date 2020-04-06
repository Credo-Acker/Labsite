module.exports = {
    devServer: {
        port: 8080,
        proxy: {
            '/3000': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                pathRewrite: {
                    '^/3000': ''
                }
            },
            
            '/api': {
                target: 'http://localhost:7001',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/api'
                }
            }
        }
    },
    publicPath: './'
};
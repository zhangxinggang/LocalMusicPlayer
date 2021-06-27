const path = require('path')
const musicDirs=[{
	rootDir:'G:/KuGou',
	rootPath:'public'
}]
module.exports = {
	services: {
		viewServer:{
			entry:{
				index: path.resolve(__dirname, 'client/src/music/index.js')
			},
			devServer: {
				port: 8082,
				proxy: {
					'/api-music/**': {
						target: 'http://127.0.0.1:8081',
						changeOrigin: true,
						secure: false
					},
					'/public':{
						target: 'http://127.0.0.1:8081',
						changeOrigin: true,
						secure: false
					}
				}
			}
		},
		httpServer: {
			security: {
				noAuthorityRoutes: [
					'/mount/**',
					'/public/**'
				]
			},
			routes: {
				dynamicRouteDirs: [{
					rootDir: path.join(__dirname, './service/api'),
					rootPath: 'api-music',
					auth:false
				}],
				staticDirs:[...musicDirs,{
					rootDir:path.join(__dirname,'dist'),
					rootPath:'/',
					auth:false
				}]
			}
		}
	},
	autoRunTask: {
		rootDirs: [
			path.join(__dirname, './service/autoTask')
		]
	},
	storage: {
		orm: {
			start:false
		}
	},
	project: {
		musicDirs:musicDirs
	}
}
const fs = require('fs')
const path = require("path")
const supportFormat=['ogg','m4a','mp3']
let filesList = []
let id=1
function readFileList(route,dir) {
    var files = fs.readdirSync(dir);
    files.forEach(function (itm, index) {
        var stat = fs.statSync(path.join(dir,itm))
        if (stat.isDirectory()) {
            //递归读取文件
            readFileList(route,path.join(dir,itm))
        } else {
            let extname=path.extname(itm).split('.')[1]
            if(extname && supportFormat.includes(extname)){
                var obj = {}
                obj.id=id
                obj.title=path.basename(itm,'.'+extname)
                obj.url = path.join(route.rootPath,path.relative(route.rootDir,dir),itm).split(path.sep).join('/')
                filesList.push(obj);
                id++
            }
        }
    })
}
function searchMusic(){
    let musicDirs=NKGlobal.config.project.musicDirs
    if(filesList.length==0){
        musicDirs.map(item=>{
            readFileList(item,item.rootDir)
        })
    }
}
searchMusic()
module.exports=function(sender){
    searchMusic()
    sender.success(filesList)
}
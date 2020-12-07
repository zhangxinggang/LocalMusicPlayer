const config = require("../config")
const mu = require('../../MU')
module.exports = (env, arg) =>{
	return mu({...config},arg)
}
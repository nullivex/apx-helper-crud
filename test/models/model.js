var mongoose = require('mongoose')
mongoose.plugin(require('mongoose-list'))
mongoose.plugin(require('mongoose-merge-plugin'))

exports.name = 'model'
exports.description = 'Testing model'
exports.model = mongoose.model('Test',new mongoose.Schema({
  name: {
    type: String,
    require: true
  }
}))
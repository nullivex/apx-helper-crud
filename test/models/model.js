'use strict';
var mongoose = require('mongoose')
mongoose.plugin(require('mongoose-list'))
mongoose.plugin(require('mongoose-merge-plugin'))

var Schema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  }
})

exports.name = 'model'
exports.description = 'Testing model'
exports.model = mongoose.model('Test',Schema)
exports.schema = Schema
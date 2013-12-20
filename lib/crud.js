var util = require('util')
  , async = require('async')

/**
 * Find rows based on criteria
 * @param Model
 * @param data
 * @param fn
 */
exports.find = function(Model,data,fn){
  Model.find(data,function(err,results){
    if(err) fn(err)
    else {
      results.forEach(function(v,i,o){
        o[i] = v.toJSON({virtuals: true})
      })
      fn(null,results)
    }
  })
}

/**
 * Find single row by criteria
 * @param Model
 * @param data
 * @param fn
 */
exports.findOne = function(Model,data,fn){
  Model.findOne(data,function(err,result){
    if(err) fn(err)
    else {
      fn(null,result.toJSON({virtuals: true}))
    }
  })
}

/**
 * List rows and control filtering
 * @param Model
 * @param data
 * @param fn
 */
exports.list = function(Model,data,fn){
  var search = {}
  search.start = data.start || 0
  search.limit = data.limit || 10
  search.find = data.search || null
  search.sort = data.sort || ''
  Model.list(search,function(err,count,results){
    if(err) fn(err)
    else {
      results.forEach(function(v,i,o){
        o[i] = v.toJSON({virtuals: true})
      })
      fn(null,count,results)
    }
  })
}

/**
 * Save one or many rows and return the updated model
 * @param Model
 * @param data
 * @param fn
 */
exports.save = function(Model,data,fn){
  var response = []
  if(!util.isArray(data) && 'object' === typeof data)
    data = [data]
  async.each(
    data,
    function(v,next){
      Model.findById(v._id,function(err,row){
        if(err)
          next(err)
        else {
          if(null === row){
            row = new Model(v)
          } else {
            row.merge(v)
          }
          row.save(function(err,result){
            if(err)
              next(err)
            else {
              response.push(result.toJSON({virtuals: true}))
              next()
            }
          })
        }
      })
    },
    function(err){
      if(err) fn(err)
      else {
        if(1 === response.length) response = response[0]
        fn(null,response)
      }
    }
  )
}

/**
 * Remove one or many rows
 * @param Model
 * @param data
 * @param fn
 */
exports.remove = function(Model,data,fn){
  if('string' === typeof data || !util.isArray(data) && 'object' === typeof data)
    data = [data]
  async.each(
    data,
    function(v,next){
      Model.remove(v,function(err){
        next(err)
      })
    },
    fn
  )
}
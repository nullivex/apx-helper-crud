var util = require('util')
  , async = require('async')

/**
 * Crud helper lib
 * @param Model
 * @constructor
 */
var Helper = function(Model){
  this.Model = Model
}

/**
 * Model instance
 * @type {null}
 */
Helper.prototype.Model = null

/**
 * Find rows based on criteria
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.find = function(apx,req,res,next){
  this.Model.find(req.get(),function(err,results){
    if(err) next(err)
    else {
      results.forEach(function(v,i,o){
        o[i] = v.toJSON({virtuals: true})
      })
      res.success()
      res.load(results)
      next()
    }
  })
}

/**
 * Find single row by criteria
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.findOne = function(apx,req,res,next){
  this.Model.findOne(req.get(),function(err,result){
    if(err) next(err)
    else {
      res.success()
      res.load(result.toJSON({virtuals: true}))
      next()
    }
  })
}

/**
 * List rows and control filtering
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.list = function(apx,req,res,next){
  var data = req.get() || {}
    , search = {}
  search.start = data.start || 0
  search.limit = data.limit || 10
  search.find = data.search || null
  search.sort = data.sort || ''
  this.Model.list(search,function(err,count,results){
    if(err) next(err)
    else {
      results.forEach(function(v,i,o){
        o[i] = v.toJSON({virtuals: true})
      })
      res.success()
      res.load(results)
      next()
    }
  })
}

/**
 * Save one or many rows and return the updated model
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param done  Continue callback
 */
Helper.prototype.save = function(apx,req,res,done){
  var self = this
  var data = req.get()
  if(0 === Object.keys(data).length) done('No parameters passed for save')
  else {
    var response = []
    if(!util.isArray(data) && 'object' === typeof data)
      data = [data]
    async.each(
      data,
      function(v,next){
        self.Model.findById(v._id,function(err,row){
          if(err)
            next(err)
          else {
            if(null === row){
              row = new self.Model(v)
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
        if(err) res.error(err)
        else {
          if(1 === response.length) response = response[0]
          res.success()
          res.load(response)
        }
        done()
      }
    )
  }
}

/**
 * Remove one or many rows
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param done  Continue callback
 */
Helper.prototype.remove = function(apx,req,res,done){
  var self = this
  var data = req.get()
  if(0 === Object.keys(data).length) done('No parameters passed for remove')
  else {
    if('string' === typeof data || !util.isArray(data) && 'object' === typeof data)
      data = [data]
    async.each(
      data,
      function(v,next){
        self.Model.remove(v,function(err){
          next(err)
        })
      },
      function(err){
        if(err) done(err)
        else {
          res.success()
          done()
        }
      }
    )
  }
}

module.exports = exports = Helper
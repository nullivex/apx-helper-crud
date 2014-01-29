var util = require('util')
  , async = require('async')

/**
 * Crud helper lib
 * @param Model  Model to operate on
 * @param name  Name of the module
 * @param description  Description of the module
 * @constructor
 */
var Helper = function(Model,name,description){
  this.Model = Model
  this.name = name || 'crud'
  this.description = description || 'Basic Crud Module'
}

/**
 * Model instance
 * @type {null}
 */
Helper.prototype.Model = null

/**
 * Default run method
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.run = function(apx,req,res,next){
  res.error('No default method defined')
  next()
}

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
      res.set('results',results)
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
      if(null === result){
        res.error('No record was found')
      } else {
        res.success()
        res.set('result',result.toJSON({virtuals: true}))
      }
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
      res.set('count',count)
      res.set('results',results)
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
  if(0 === Object.keys(data).length){
    res.error('No parameters passed for save')
    done()
  } else {
    var response = []
    if(!util.isArray(data) && 'object' === typeof data)
      data = [data]
    async.each(
      data,
      function(v,next){
        self.Model.findById(v._id ? v._id : v.id,function(err,row){
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
          res.success()
          res.set('results',response)
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
  if(0 === Object.keys(data).length){
    res.error('No parameters passed for remove')
    done()
  } else {
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

/**
 * Static function to help populate routes
 * @param userMethods
 * @returns {string[]}
 */
Helper.methods = function(userMethods){
  var methods = ['find','findOne','list','save','remove']
  if('function' === typeof userMethods) userMethods = userMethods()
  if('string' === typeof userMethods) userMethods = [userMethods]
  if(userMethods instanceof Array){
    methods = methods.concat(userMethods)
  }
  return methods
}

module.exports = exports = Helper
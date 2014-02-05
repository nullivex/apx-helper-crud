'use strict';
var util = require('util')
  , async = require('async')
  , ObjectManage = require('object-manage')

/**
 * Crud helper lib
 * @param Model  Model to operate on
 * @param name  Name of the module
 * @param description  Description of the module
 * @param options  Options to be passed to the class
 * @constructor
 */
var Helper = function(Model,name,description,options){
  this.Model = Model
  this.name = name || 'crud'
  this.description = description || 'Basic Crud Module'
  this.options = new ObjectManage()
  this.options.load(this.defaultOptions,options || {})
}

/**
 * Name of the APX plugin
 * @type {null}
 */
Helper.prototype.name = null

/**
 * Description of the APX plugin
 * @type {null}
 */
Helper.prototype.description = null

/**
 *
 * @type {{useRoles: boolean}}
 */
Helper.prototype.defaultOptions = {
  useRoles: true
}

/**
 * Options object which is an instance of object manage
 * @type {null}
 */
Helper.prototype.options = null

/**
 * Model instance
 * @type {null}
 */
Helper.prototype.Model = null

/**
 * Check if a particular permission is available
 * @param apx
 * @param req
 * @param permission
 * @returns {*}
 */
Helper.prototype.hasPermission = function(apx,req,permission){
  //validate and return null if permission support is disabled
  if(!req.session || !apx.roles || !this.options.get('useRoles')) return null
  var profile, profileName
  if(!req.session || !req.session.exists('profile') || !req.session.get('profile')){
    profileName = 'guest'
  } else {
    profileName = req.session.get('profile')
  }
  profile = apx.roles.getProfile(profileName)
  if(!profile){
    //no profile = no permission
    return false
  } else {
    return profile.hasRoles(this.name + '.' + permission)
  }
}

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
  if(false === this.hasPermission(apx,req,'find')){
    res.error('Permission denied')
    next()
  } else {
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
}

/**
 * Find single row by criteria
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.findOne = function(apx,req,res,next){
  if(false === this.hasPermission(apx,req,'find')){
    res.error('Permission denied')
    next()
  } else {
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
}

/**
 * List rows and control filtering
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param next  Continue callback
 */
Helper.prototype.list = function(apx,req,res,next){
  if(false === this.hasPermission(apx,req,'find')){
    res.error('Permission denied')
    next()
  } else {
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
}

/**
 * Save one or many rows and return the updated model
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param done  Continue callback
 */
Helper.prototype.save = function(apx,req,res,done){
  if(false === this.hasPermission(apx,req,'save')){
    res.error('Permission denied')
    done()
  } else {
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
}

/**
 * Remove one or many rows
 * @param apx  APX Instance
 * @param req  APX Request Object
 * @param res  APX Response Object
 * @param done  Continue callback
 */
Helper.prototype.remove = function(apx,req,res,done){
  if(false === this.hasPermission(apx,req,'remove')){
    res.error('Permission denied')
    done()
  } else {
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
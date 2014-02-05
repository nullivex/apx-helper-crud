'use strict';
var expect = require('chai').expect
  , apx = require('apx')
  , async = require('async')
  , Crud = require('../lib/crud')
  , crud
describe('HelperCrud',function(){
  describe('Functionality',function(){
    var items = []
      , docs = []
    for(var i=0; i<100; i++){
      items.push({name: 'test doc'})
    }
    before(function(done){
      apx.once('ready',function(apx){
        crud = new Crud(apx.models.model.model,'test','Test Module')
        async.each(
          items,
          function(item,next){
            var doc = new apx.models.model.model(item)
            docs.push(doc)
            doc.save(next)
          },
          done
        )
      })
      apx.start({
        testing: true,
        sysLogLevel: 2,
        cwd: __dirname,
        initializers: ['apx-mongoose'],
        models: ['models/*.js'],
        mongoose: {
          name: 'apx-helper-crud-test'
        }
      })
    })
    after(function(done){
      apx.once('dead',function(){
        done()
      })
      async.each(
        docs,
        function(doc,next){
          doc.remove(next)
        },
        function(err){
          if(err) throw err
          apx.stop()
        }
      )
    })
    it('should have a name',function(){
      expect(crud.name).to.equal('test')
    })
    it('should have a description',function(){
      expect(crud.description).to.equal('Test Module')
    })
    it('should gracefully fail when no record is found',function(done){
      apx.instance.runAction(crud,{id: 'foo'},'findOne',function(err,res){
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('No record was found')
        done()
      })
    })
    it('should gracefully fail with an invalid data set passed to create',function(done){
      apx.instance.runAction(crud,{},'save',function(err,res){
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('No parameters passed for save')
        done()
      })
    })
    it('should implement a run method that returns error',function(done){
      apx.instance.runAction(crud,{},'run',function(err,res){
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('No default method defined')
        done()
      })
    })
    it('should default to the run method',function(done){
      apx.instance.runAction(crud,{},function(err,res){
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('No default method defined')
        done()
      })
    })
    it('should find records',function(done){
      apx.instance.runAction(crud,{name: 'test doc'},'find',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('results.0.name')).to.equal('test doc')
        done()
      })
    })
    it('should find one record',function(done){
      apx.instance.runAction(crud,{name: 'test doc'},'findOne',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('result.name')).to.equal('test doc')
        done()
      })
    })
    it('should list records',function(done){
      apx.instance.runAction(crud,{},'list',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('count')).to.equal(100)
        expect(res.get('results').length).to.equal(10)
        expect(res.get('results.0.name')).to.equal('test doc')
        done()
      })
    })
    it('should save a record',function(done){
      docs[0].name = 'test doc updated'
      var doc = JSON.parse(JSON.stringify(docs[0].toJSON({virtuals: true})))
      apx.instance.runAction(crud,doc,'save',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('results.0.name')).to.equal('test doc updated')
        done()
      })
    })
    it('should save multiple records',function(done){
      docs.forEach(function(doc){
        doc.name = 'test doc updated'
      })
      var doc = JSON.parse(JSON.stringify(docs))
      apx.instance.runAction(crud,doc,'save',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('results').length).to.equal(100)
        expect(res.get('results.1.name')).to.equal('test doc updated')
        done()
      })
    })
    it('should remove a record',function(done){
      var doc = JSON.parse(JSON.stringify(docs[0]))
      apx.instance.runAction(crud,doc,'remove',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        done()
      })
    })
    it('should remove multiple records',function(done){
      var doc = JSON.parse(JSON.stringify(docs))
      apx.instance.runAction(crud,doc,'remove',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        done()
      })
    })
    it('should gracefully fail with an invalid data set passed to remove',function(done){
      apx.instance.runAction(crud,{},'remove',function(err,res){
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('No parameters passed for remove')
        done()
      })
    })
    it('should return default methods',function(){
      var methods = Crud.methods()
      expect(methods).to.include.members(['find','findOne','list','save','remove'])
    })
    it('should return default methods plus user methods',function(){
      var methods = Crud.methods(['login','logout'])
      expect(methods).to.include.members(['find','findOne','list','save','remove','login','logout'])
    })
    it('should add a single user method supplied as a string',function(){
      var methods = Crud.methods('login')
      expect(methods).to.include.members(['find','findOne','list','save','remove','login'])
    })
    it('should allow a function to be supplied to methods',function(){
      var methods = Crud.methods(function(){
        return ['login','logout']
      })
      expect(methods).to.include.members(['find','findOne','list','save','remove','login','logout'])
    })
  })
  describe('Permissions',function(){
    var doc
    var sessionMiddleware = {
      name: 'sessionMiddleware',
      description: 'middleware used to inject the profile for testing',
      pre: function(apx,req,res,next){
        if(req.exists('setProfile')){
          req.session.set('profile',req.get('setProfile'))
          req.remove('setProfile')
        }
        next()
      },
      post: function(apx,req,res,next){
        next()
      }
    }
    before(function(done){
      apx.once('ready',function(apx){
        crud = new Crud(apx.models.model.model,'test','Test Module')
        doc = new apx.models.model.model()
        doc.name = 'foo'
        doc.save(done)
      })
      apx.start({
        testing: true,
        sysLogLevel: 2,
        cwd: __dirname,
        config: ['config.js'],
        initializers: ['apx-mongoose','apx-roles'],
        middleware: ['apx-session',sessionMiddleware],
        models: ['models/*.js'],
        mongoose: {
          name: 'apx-helper-crud-test'
        }
      })
    })
    after(function(done){
      apx.once('dead',function(){
        done()
      })
      doc.remove(function(err){
        if(err) throw err
        apx.stop()
      })
    })
    it('should not use roles even if loaded and disabled',function(done){
      crud = new Crud(apx.instance.models.model.model,'test','test crud module',{useRoles: false})
      apx.instance.runAction(crud,{name: 'foo'},'find',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('results.0.name')).to.equal('foo')
        done()
      })
    })
    it('should fail when using the guest permission',function(done){
      crud = new Crud(apx.instance.models.model.model,'test','test crud module')
      apx.instance.runAction(crud,{name: 'foo'},'find',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('error')
        expect(res.get('message')).to.equal('Permission denied')
        done()
      })
    })
    it('should pass when using the proper profile',function(done){
      crud = new Crud(apx.instance.models.model.model,'test','test crud module')
      apx.instance.runAction(crud,{name: 'foo', setProfile: 'admin'},'find',function(err,res){
        if(err) throw err
        expect(res.get('status')).to.equal('ok')
        expect(res.get('message')).to.equal('success')
        expect(res.get('results.0.name')).to.equal('foo')
        done()
      })
    })
  })
})
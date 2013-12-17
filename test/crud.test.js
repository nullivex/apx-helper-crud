describe('HelperCrud',function(){
  var Apx = require('apx')
    , async = require('async')
    , crud = require('../lib/crud')
    , apx
  before(function(done){
    apx = new Apx({
      testing: true,
      cwd: __dirname,
      initializers: [require('apx-mongoose')],
      mongoose: {
        name: 'apx-helper-crud-test',
        models: 'models/*.js'
      },
      onReady: function(apx){
        var items = []
        for(var i=0; i<100; i++){
          items.push({name: 'test doc'})
        }
        async.each(
          items,
          function(item,next){
            var doc = new apx.models.model(item)
            doc.save(next)
          },
          done
        )
      }
    })
  })
  after(function(done){
    apx.models.model.remove(done)
  })
  it('should find records',function(done){
    crud.find(apx.models.model,{name: 'test doc'},function(err,results){
      if(err) throw err
      expect(results.length).to.equal(100)
      expect(results[0].name).to.equal('test doc')
      done()
    })
  })
  it('should find one record',function(done){
    crud.findOne(apx.models.model,{name: 'test doc'},function(err,result){
      if(err) throw err
      expect(result).to.be.an('object')
      expect(result.name).to.equal('test doc')
      done()
    })
  })
  it('should list records',function(done){
    crud.list(apx.models.model,{},function(err,count,results){
      if(err) throw err
      expect(count).to.equal(100)
      expect(results.length).to.equal(10)
      expect(results[0].name).to.equal('test doc')
      done()
    })
  })
  it('should save a record',function(done){
    crud.findOne(apx.models.model,{name: 'test doc'},function(err,result){
      if(err) throw err
      result.name = 'test doc updated'
      crud.save(apx.models.model,result,function(err,result){
        if(err) throw err
        expect(result.name).to.equal('test doc updated')
        done()
      })
    })
  })
  it('should save multiple records',function(done){
    crud.find(apx.models.model,{name: 'test doc'},function(err,results){
      if(err) throw err
      results.forEach(function(v){
        v.name = 'test doc updated'
      })
      crud.save(apx.models.model,results,function(err,results){
        if(err) throw err
        expect(results).to.be.an('array')
        expect(results.length).to.equal(99)
        expect(results[0].name).to.equal('test doc updated')
        done()
      })
    })
  })
  it('should remove a record',function(done){
    crud.findOne(apx.models.model,{name: 'test doc updated'},function(err,result){
      if(err) throw err
      crud.remove(apx.models.model,result,function(err){
        if(err) throw err
        done()
      })
    })
  })
  it('should remove multiple records',function(done){
    crud.find(apx.models.model,{name: 'test doc updated'},function(err,results){
      if(err) throw err
      crud.remove(apx.models.model,results,function(err){
        if(err) throw err
        done()
      })
    })
  })
})
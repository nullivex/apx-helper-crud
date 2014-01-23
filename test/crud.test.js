var apx = require('apx')
  , async = require('async')
  , Crud = require('../lib/crud')
  , crud
describe('HelperCrud',function(){
  var items = []
    , docs = []
  for(var i=0; i<100; i++){
    items.push({name: 'test doc'})
  }
  before(function(done){
    apx.once('ready',function(apx){
      crud = new Crud(apx.models.model.model)
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
})
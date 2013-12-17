apx-helper-crud
============

CRUD (Create Read Update Delete) helper for APX API server actions

Requires Mongoose Models and the [mongoose-list](https://github.com/snailjs/mongoose-list) plugin.

## Usage

Simply require the helper within your actions

```
$ npm install apx-helper-crud --save
```

```js
var crud = require('apx-helper-crud')

exports.name = 'page'
exports.description = 'Manage pages'
exports.run = function(apx,req,res){
  res.error('no default method supported')
}
exports.find = function(apx,req,res){
  crud.find(apx.models.page,req.data,function(err,results){
    if(err) res.error(err)
    else res.send({results: results})
  })
}
exports.findOne = function(apx,req,res){
  crud.findOne(apx.models.page,req.data,function(err,results){
    if(err) res.error(err)
    else res.send({results: results})
  })
}
exports.list = function(apx,req,res){
  crud.list(apx.models.page,req.data,function(err,count,results){
    if(err) res.error(err)
    else res.send({count: count, results: results})
  })
}
exports.save = function(apx,req,res){
  crud.save(apx.models.page,req.data,function(err,results){
    if(err) res.error(err)
    else res.send({results: results})
  })
}
exports.remove = function(apx,req,res){
  crud.remove(apx.models.page,req.data,function(err){
    if(err) res.error(err)
    else res.success()
  })
}
```

## Methods

### Find

Find records by the criteria in the data object.

```js
crud.find(Model,data,cb)
```

Callback format `cb(err,results)`

### Find One

Find a single record by the criteriea in the data object.
Useful for finding items by ObjectID

```js
crud.findOne(Model,data,cb)
```

Callback format `cb(err,result)`

### List

Utilizes the [mongoose-list](https://github.com/snailjs/mongoose-list) plugin
to iterate records in a collection.

```js
crud.list(Model,search,cb)
```

* Model -- The model to execute calls on (must have loaded mongoose-list)
* Search -- Object containing search parameters that is passed to mongoose-list

Callback format `cb(err,resultCount,results)`

* resultCount -- total number of objects matching `search`
* results -- Array of results in order

### Save

Save one or many documents.

```js
crud.save(Model,doc,cb)
```

Callback format `cb(err,result)`

**Note** will accept an array of documents and will return an array of results.
**IMPORTANT** requires the
[mongoose-merge plugin](https://github.com/eherve/mongoose-merge-plugin)
to be loaded in the model.

### Remove

Remove one or many documents.

```js
crud.remove(Model,data,cb)
```

Callback format `cb(err)`

**Note** will accept an array of data objects and will iterate them.
apx-helper-crud [![Build Status](https://travis-ci.org/snailjs/apx-helper-crud.png?branch=master)](https://travis-ci.org/snailjs/apx-helper-crud)
============

CRUD (Create Read Update Delete) helper for APX API server actions

Requires Mongoose Models and the [mongoose-list](https://github.com/snailjs/mongoose-list) and [mongoose-merge plugin](https://github.com/eherve/mongoose-merge-plugin) plugins.

## Usage

Simply require the helper within your actions

```
$ npm install apx-helper-crud --save
```

```js
var Crud = require('apx-helper-crud')
  , model = require('./models/test')

//will populate all the following crud functions
// * find
// * findOne
// * list (which required the model to use the mongoose-list plugin)
// * save
// * remove
module.exports = exports = new Crud(model.model)

exports.name = 'page'
exports.description = 'Manage pages'
exports.run = function(apx,req,res,next){
  res.error('no default method supported')
  next()
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

## Changelog

### 0.2.0
* Completely re-imagined interface that can just extend methods of an action.

### 0.1.3
* Better error handling on un-sanitized input

### 0.1.2
* Fixed responses needing to be passed to `doc.toJSON({virtuals: true})`
* Updated to apx 0.3.0

### 0.1.1
* Added missing dependencies

### 0.1.0
* Initial release

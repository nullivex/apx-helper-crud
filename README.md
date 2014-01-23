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

## Constructor

The constructor only takes a single argument which is the mongoose model to work with.

```js
var Crud = require('apx-helper-crud')
  , Model = require('./models/test').model
  , crud = new Crud(Model)
```

## Methods

All of the Crud methods are APX actions so they accept request data directly and return APX responses.

### Find

Find records by the criteria in the data object.

Takes a Mongoose query object as the only argument.

```js
{name: 'test doc'}
```

Returns an object of results.

```js
{results: [{name: 'test doc'}]}
```

### Find One

Find a single record by the criteriea in the data object.
Useful for finding items by ObjectID

Takes a mongoose query object as the only argument.

```js
{name: 'test doc'}
```

Returns an object of results.

```js
{result: {name: 'test doc'}}
```

### List

Utilizes the [mongoose-list](https://github.com/snailjs/mongoose-list) plugin
to iterate records in a collection.

Takes a mongoose-list arugment object.

```js
{start: 0, limit: 10, find: 'foo', sort: 'bar'}
```

Returns a results object

```js
{count: 10, results: [{name: 'test doc'}]}
```

### Save

Save one or many documents.

**IMPORTANT** requires the
[mongoose-merge plugin](https://github.com/eherve/mongoose-merge-plugin)
to be loaded in the model.

Accepts a document or an array of documents.

```js
[{name: 'test doc'}]
```

Returns a result object

```js
{results: [{name: 'test doc'}]}
```

### Remove

Remove one or many documents.

Accepts a query object or an array of query objects.

```js
[{name: 'test doc'}]
```

Returns success or error only.

## Changelog

### 0.2.0
* Completely re-imagined interface that can just extend methods of an action.
* Simplified return formats to be more predictable
* All methods are now APX actions

### 0.1.3
* Better error handling on un-sanitized input

### 0.1.2
* Fixed responses needing to be passed to `doc.toJSON({virtuals: true})`
* Updated to apx 0.3.0

### 0.1.1
* Added missing dependencies

### 0.1.0
* Initial release

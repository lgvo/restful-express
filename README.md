# RESTful Express

This project is declarative way to define Express routers using decorators.

## Installation

```sh
$ npm install --save restful-express
```

## Usage

### Babel Config
Yout need a ES.next transpiler to use decorators, in that case Babel.
```sh
$ npm install --global babel 
```

Right now to use decorators with Babel you need to configure it with stage 1.
Simple add a ".babelrc" file on the root of your project:
```javascript
{"stage": 1}
```

For more details on how to use babel: [https://babeljs.io](https://babeljs.io)


### Defining EndPoints

```javascript
import express from 'express';
import {get, post, put, del, endPoint, process} from 'restful-express';

@endPoint('/user')
class MyClass {

    @post()
    create(req, res, next) {
        // ...
    }

    @get('/:id')
    find(req, res, next) {
        // ...
    }

    @del('/:id')
    delete(req, res, next) {
        // ...
    }

    @put('/:id')
    update(req, res, next) {
        // ...
    }
}

var app = express();

process(app.router(), MyClass);

// it will do the same as:
var router = app.router();

var obj = new MyClass();

router.get('/user/:id', function(req, res, next) {
   return obj.find(req, res, next); 
});


router.get('/user/:id', function(req, res, next) {
   return obj.find(req, res, next); 
});

```

### Getting more with Denpendency Injection

You can use [di-decorators](https://github.com/lgvo/di-decorators) to provide dependency injection to your endpoints.

```javascript
// set up
import {get, post, put, del, endPoint, process, useInstanceProvider} from 'restful-express';
import {provider, inject} from 'di-decorators';

useInstanceProvider(provider);

// implementation

class Dependency {
    sayHello(res) {
        res.send('Hello world!');
    }
}

@endPoint()
@inject(Dependency)
class SayHello {
    constructor(dep) {
        this.dep = dep;
    }

    @get('/hello')
    hello(req, res, next) {
        this.dep.sayHello(res);
    }
}

```



### Using Promises to avoid Callback Hell

You can use [express-promise-wrapper](https://github.com/lgvo/express-promise-wrapper) and all methods of your methods of your endpoints can return a promise.

```javascript
import {get, post, put, del, endPoint, process, useWrapper} from 'restful-express';
import {wrap, text} from 'express-promise-wrapper';

useWrapper(wrap);

var model = // some model that use promise

@endPoint()
class SayHello {
    @get('/:id')
    hello(id) {
        return model.findById(id)
            .then((entity) => text(entity.message));
    }
}

```

## Contributing

* Please take the time to star the project if you like it "npm star restful-express" and also on github [restful-express](https://github.com/lgvo/restful-express).
* Feel free to fork, and if you are planning to add more features please open a issue so que can discuss about.

## License
[MIT](LICENSE)

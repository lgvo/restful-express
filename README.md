# RESTful Express

[![Join the chat at https://gitter.im/lgvo/restful-express](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lgvo/restful-express?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
var obj1 = new MyClass();
router.post('/user', function(req, res, next) {
   return obj1.create(req, res, next); 
});

var obj2 = new MyClass();
router.get('/user/:id', function(req, res, next) {
   return obj2.find(req, res, next); 
});

var obj3 = new MyClass();
router.get('/user/:id', function(req, res, next) {
   return obj3.find(req, res, next); 
});

var obj4 = new MyClass();
router.put('/user/:id', function(req, res, next) {
   return obj4.update(req, res, next); 
});

```

### Taking advantage of Middleware

There is no point in using Express without leveraging the middleware capabilities.
You can do that in a declarative way to. I will show a example using [passport]() to provide authentication.

```javascript

// using passport 
import express from 'express';
import passport from 'passport';
import {get, post, put, del, endPoint, runFunctionBefore} from 'restful-express';

// will autheticate the user based on the passport local strategy
function authenticate(config) {
    runFunctionBefore(config, passport.autheticate('local'));
}

// will verify if the user is logged and if not will send the status 401
function requireLogin(config) {
    runFunctionBefore(config, function(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.status(401).end();
        }
    });
}

@endPoint()
class Login {
    
    // will create a post endpoint into '/login' to authenticate the user
    @post('/login', authenticate)
    login(req, res, next) {
        res.send('Logged');
    }

    // will create a post endpoint into '/logout' to logout the user, 
    // if the user is not logged will return 401
    @post('/logout', requireLogin)
    logout(req, res, next) {
        req.logout();
        res.send('LoggedOut');
    }
}

// you can use the closure scope to provide more information
// in the follow example, I will show how to create a authorization mechanism
// assuming that when logged you put some roles at the req.user.roles 

function requireRole(role) {
    return function(config) {
        runFunctionBefore(config, function(req, res, next) {
            if (req.user.roles[role]) {
                next();
            } else {
                res.status(403).end();
            }
        });
    };
}

// defining the requireLogin at the endPoint level will call that 
// before any endpoint of the class.
endPoint('/user', requireLogin)
class User {

    @post(requireRole('USER'))
    create(req, res, next) {
        // ...
    }

    @put(requireRole('USER'))
    update(req, res, next) {
        // ...
    }

    @del(require('ADMIN'))
    delete(req, res, next) {
        // ...
    }
}

// That way all endpoints will require login, 
// only users with the USER role can 'create' and 'update' 
// and only users with ADMIN role can 'delete'.

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

You can use [express-promise-wrapper](https://github.com/lgvo/express-promise-wrapper) that way all methods of endpoints can return a promise.
It will call the "next" callback passing any any error catch by the promise.

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

* Please take the time to star the project if you like it! "npm star restful-express" and also on github [restful-express](https://github.com/lgvo/restful-express).
* Feel free to fork, and if you are planning to add more features please open a issue so we can discuss about.

## License
[MIT](LICENSE)

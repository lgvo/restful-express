import chai from 'chai';

import {get, post, put, endPoint, process, runFunctionBefore} from './restful-express';

const expect = chai.expect;

class Router {
    constructor() {
        this.routes = {};
    }

    get(url, ...methods) {
        this.routes[`GET:${url}`] = methods;
    }
    
    post(url, ...methods) {
        this.routes[`POST:${url}`] = methods;
    }
    
   put(url, ...methods) {
        this.routes[`PUT:${url}`] = methods;
    }
}

describe('HttpMethods', function() {

    var router;
    beforeEach(() => {
        router = new Router();
    });

    it('should define a GET endpoint', function() {
        class Test {
            @get('/test') 
            method() {
                return true;
            }
        }

        process(router, Test);

        expect(router.routes['GET:/test']).to.exist;
        expect(router.routes['GET:/test'][0]()).to.be.true;
    });

    it('should define a POST endpoint', function() {
        class Test {
            @post('/test') 
            method() {
                return true;
            }
        }

        process(router, Test);

        expect(router.routes['POST:/test']).to.exist;
        expect(router.routes['POST:/test'][0]()).to.be.true;
    });

    it('should define a PUT endpoint', function() {
        class Test {
            @put('/test') 
            method() {
                return true;
            }
        }

        process(router, Test);

        expect(router.routes['PUT:/test']).to.exist;
        expect(router.routes['PUT:/test'][0]()).to.be.true;
    });

});

describe('Middleware', function() {
    var router;
    beforeEach(() => {
        router = new Router();
    });

    it('should define functions to run before the method endpoint', function() {

        function first(config) {
            runFunctionBefore(config, (req, res) => 'first');
        }
        
        function second(config) {
            runFunctionBefore(config, (req, res) => 'second');
        }

        class Test {
            @get('/test', first, second)
            method() {
                return 'original';
            }
        }

        process(router, Test);
        
        expect(router.routes['GET:/test'][0]()).to.equal('first');
        expect(router.routes['GET:/test'][1]()).to.equal('second');
        expect(router.routes['GET:/test'][2]()).to.equal('original');
        
    });
    

    it('should support both functions on class and methods', function() {

        function first(config) {
            runFunctionBefore(config, (req, res) => 'first');
        }
        
        function second(config) {
            runFunctionBefore(config, (req, res) => 'second');
        }

        function third(config) {
            runFunctionBefore(config, (req, res) => 'third');
        } 

        @endPoint(first, second)
        class Test {
            @get('/test', third)
            method() {
                return 'original';
            }
        }

        process(router, Test);
        
        expect(router.routes['GET:/test'][0]()).to.equal('first');
        expect(router.routes['GET:/test'][1]()).to.equal('second');
        expect(router.routes['GET:/test'][2]()).to.equal('third');
        expect(router.routes['GET:/test'][3]()).to.equal('original');
    });
});

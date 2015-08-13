// one line to give the program's name and a brief description
// Copyright © 2015 Luis Gustavo Vilela de Oliveira
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import {processEndPoints} from 'restful-decorators';

var wrappers = {
    promise: (class_, method) => {
        return function(req, res, next) {
            method.call(config.instanceProvider(class_), req)
            .then()
            .catch(next);
        };
    },

    callback: (class_, method) => {
        return function(req, res, next) {
            return method.call(config.instanceProvider(class_), req, res, next);
        };
    }
};


var config = {
    instanceProvider: function(class_) {
       return function() {
            new class_();
        };
    },
    wrapper: wrappers.callback
};

export function runFunctionBefore(config, func) {
    config.runBefore = config.runBefore || []; 
    config.runBefore.push(func);
}

export function process(router, ...classes) {

    classes.forEach((class_) => {
         processEndPoints(class_, (httpMethod, method, url, methodConfig, classURL, classConfig) => {

             var endPointURL = '';
             if (classURL) {
                 endPointURL += classURL;
             }
             if (url) {
                 endPointURL += url;
             }

             var params = [endPointURL];

             if (classConfig && classConfig.runBefore) {
                params = params.concat(classConfig.runBefore);
             }

             if (methodConfig.runBefore) {
                params = params.concat(methodConfig.runBefore); 
             }

            params.push(config.wrapper(class_, method));

             router[httpMethod.toLowerCase()].apply(router, params);
             
         });
    });
}

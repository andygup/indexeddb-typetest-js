/**
 * Library for validating if IndexedDB supports specific data types.
 * Currently checks for: String, Object, Array, Blob, Uint8Array and ArrayBuffer support.
 *
 * Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=108012
 *
 * Author: Andy Gup (@agup)
 */

"use strict";
/**
 * Validates ability to store certain types of data in IndexedDB
 * @param dbStore
 * @constructor
 */
var DBValidate = function(dbStore){
    var store = dbStore;
    var uint8arr = new Uint8Array([100,1000,10001,208]);

    /**
     * Runs the checks
     * @param callback (resultObject,errors). Example resultObject:
     * {uint8array:false,blob:false,arraybuffer:false}. Errors is boolean.
     */
    this.run = function(callback){

        var resultObj = {uint8array:false,blob:false,arraybuffer:false};
        var errArray = [];

        this.testUint8array(function(result,err){
            if(result) {
                resultObj.uint8array = true;
            }
            else{
                errArray.push(1);
                resultObj.uint8array = false;
            }

            this.testBlob(function(result,err){
                if(result){
                    resultObj.blob = true;
                }
                else{
                    errArray.push(1);
                    resultObj.blob = false;
                }

                this.testArrayBuffer(function(result,err){
                    if(result) {
                        resultObj.arraybuffer = true;
                    }
                    else{
                        errArray.push(1);
                        resultObj.arraybuffer = false;
                    }

                    this.deleteTests(function(result){
                        if(result){

                            var errors = false;

                            if(errArray.length > 0) errors = true;

                            callback({results:resultObj,errors:errors});
                        }
                        else{
                            console.log("UNABLE to delete browser tests")
                        }
                    })
                }.bind(this))
            }.bind(this))
        }.bind(this))
    }

    // Add a Uint8Array
    this.testUint8array = function(callback){
        store.add(uint8arr,"test0",function(result,err){
            callback(result,err);
        })
    }

    this.testBlob = function(callback){
        var blob = new Blob([uint8arr],{type:"image/jpeg"});
        store.add(blob,"test1",function(result,err){
            callback(result,err);
        })
    }

    this.testArrayBuffer = function(callback){
        var buffer = new ArrayBuffer(12);
        store.add(buffer,"test2",function(result,err){
            callback(result,err);
        })
    }

    this.deleteTests = function(callback){
        console.log("All DB support tests are complete.")
        store.deleteAll(callback);
    }
}

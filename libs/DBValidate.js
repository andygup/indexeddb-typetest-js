/**
 * Library for validating if IndexedDB supports specific data types.
 * Currently checks for: String, Object, Array, Blob, Uint8Array and ArrayBuffer support.
 *
 * Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=108012
 *
 * Author: Andy Gup (@agup)
 */

"use strict";
var DBValidate = function(){
    this.store = new DBStore();

    /**
     * Runs the checks
     * @param callback (resultObject,errorsArray). Example resultObject:
     * {uint8array:false,blob:false,arraybuffer:false}
     */
    this.run = function(callback){
        var uint8arr = new Uint8Array([100,1000,10001,208]);

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
                })
            })
        })
    }

    // Add a Uint8Array
    this.testUint8array = function(callback){
        this.store.add(uint8arr,"test0",function(result,err){
            callback(result,err);
        })
    }

    this.testBlob = function(callback){
        var blob = new Blob([uint8arr],{type:"image/jpeg"});
        this.store.add(blob,"test1",function(result,err){
            callback(result,err);
        })
    }

    this.testArrayBuffer = function(callback){
        var buffer = new ArrayBuffer(12);
        this.store.add(buffer,"test2",function(result,err){
            callback(result,err);
        })
    }

    this.deleteTests = function(callback){
        console.log("All DB support tests are complete.")
        this.store.deleteAll(callback);
    }
}

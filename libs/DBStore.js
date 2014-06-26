
/*global indexedDB */
/**
 * Library for working with IndexDB.
 *
 * Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=108012
 *
 * Author: Andy Gup (@agup)
 * Contributor: Javier Abadia (@javierabadia)
 */

    "use strict";
    var DBStore = function()
    {
        /**
         * Internal reference to the local database
         * @type {null}
         * @private
         */
        this._db = null;

        var DB_NAME = "offline_store";

        /**
         * Determines if indexedDB is supported
         * @returns {boolean}
         */
        this.isSupported = function(){

            if(!window.indexedDB){
                return false;
            }

            return true;
        };

        /**
         * Adds an item to the database
         * @param item can be String, Object, Array
         * @param key String
         * @param callback callback(boolean, err)
         */
        this.add = function(item,key,callback)
        {
            try
            {
                var request = {};
                var transaction = this._db.transaction(["table1"],"readwrite");

//                transaction.oncomplete = function(event)
//                {
//                    callback(true);
//                };

                var objectStore = transaction.objectStore("table1");
                request = objectStore.put(item,key);

                request.onsuccess = function(evt)
                {
                    console.log("Key: " + key + ", item added to db " + evt.target.result);
                    callback(true);
                };

                request.onerror = function(event)
                {
                    if(event != undefined){
                        callback(false,event.target.error.message);
                    }
                    else{
                        callback(false,"add() unknown error")
                    }
                };
            }
            catch(err)
            {
                console.log("DBStore key: " + key + ", " + err.message + ", " + err.stack);
                callback(false, err.stack);
            }
        };

        /**
         * Retrieve a record.
         * @param key
         * @param callback
         */
        this.retrieve = function(/* String */ key,callback)
        {
            if(this._db !== null)
            {
                var objectStore = this._db.transaction(["table1"]).objectStore("table1");
                var request = objectStore.get(key);
                request.onsuccess = function(event)
                {
                    var result = event.target.result;
                    if(result == undefined)
                    {
                        callback(false,"not found");
                    }
                    else
                    {
                        callback(true,result);
                    }
                };
                request.onerror = function(err)
                {
                    console.log(err);
                    callback(false, err);
                };
            }
        };

        /**
         * Deletes entire database
         * @param callback callback(boolean, err)
         */
        this.deleteAll = function(callback)
        {
            if(this._db !== null)
            {
                var request = this._db.transaction(["table1"],"readwrite")
                    .objectStore("table1")
                    .clear();
                request.onsuccess = function()
                {
                    callback(true);
                };
                request.onerror = function(err)
                {
                    callback(false, err);
                };
            }
            else
            {
                callback(false,null);
            }
        };

        /**
         * Delete an individual entry
         * @param key
         * @param callback callback(boolean, err)
         */
        this.delete = function(/* String */ key,callback)
        {
            if(this._db !== null)
            {
                var request = this._db.transaction(["table1"],"readwrite")
                    .objectStore("table1")
                    .delete(key);
                request.onsuccess = function()
                {
                    callback(true);
                };
                request.onerror = function(err)
                {
                    callback(false, err);
                };
            }
            else
            {
                callback(false,null);
            }
        };

        /**
         * Retrieve all tiles from indexeddb
         * @param callback callbakck(item, err)
         */
        this.getAll = function(callback)
        {
            if(this._db !== null){
                var transaction = this._db.transaction(["table1"])
                    .objectStore("table1")
                    .openCursor();

                transaction.onsuccess = function(event)
                {
                    var cursor = event.target.result;

                    if(cursor){
                        console.log("DB Retreiving: " + cursor.key);
                        cursor.continue();
                        callback({key:cursor.key,item:cursor.value},null);
                    }
                };
                transaction.onerror = function(err)
                {
                    callback(null, err);
                };
            }
            else
            {
                callback(null, "no db");
            }     
        };

        /**
         * Provides the size of database in bytes
         * @param callback callback(size, null) or callback(null, error)
         */
        this.usedSpace = function(callback){
            if(this._db !== null){
                var usage = { sizeBytes: 0, tileCount: 0 };

                var transaction = this._db.transaction(["table1"])
                    .objectStore("table1")
                    .openCursor();

                transaction.onsuccess = function(event){
                    var cursor = event.target.result;
                    if(cursor){
                        var storedObject = cursor.value;
                        var json = JSON.stringify(storedObject);
                        usage.sizeBytes += this._stringBytes(json);
                        usage.tileCount += 1;
                        cursor.continue();
                    }
                    else
                    {                        
                        callback(usage,null);
                    }
                }.bind(this);
                transaction.onerror = function(err)
                {
                    callback(null, err);
                };
            }
            else
            {
                callback(null,null);
            }
        };

        this._stringBytes = function(str) {            
            return str.length /**2*/ ;
        };

        this.init = function(callback)
        {
            var request = indexedDB.open(DB_NAME, 4);
            callback = callback || function(success) { console.log("DBStore::init() success:", success); }.bind(this);

            request.onerror = function(event) 
            {
                console.log("indexedDB error: " + event.target.errorCode);
                callback(false,event.target.errorCode);
            }

            request.onupgradeneeded = function(event) 
            {
                var db = event.target.result;

                if( db.objectStoreNames.contains("table1"))
                {
                    db.deleteObjectStore("table1");
                }            

                db.createObjectStore("table1");
            }

            request.onsuccess = function(event)
            {
                this._db = event.target.result;
                console.log("database opened successfully");
                callback(true);
            }.bind(this);
        };
    };

export const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

export const DatabaseVersion = 1;

export const request = async () => {
    return new Promise(async (resolve, reject) => {
        const req = indexedDB.open("welcometopaulidana", DatabaseVersion);
        req.onsuccess = function () {
            // console.log("req:", req);
            resolve(req);
        }
        req.onerror = function () {
            console.warn("Can't open database");
        }
    });
}

export const deleteDatabase = async () => {
    var req = indexedDB.deleteDatabase("welcometopaulidana");
    req.onsuccess = function () {
        console.log(`Deleted database successfully`);
    };
    req.onerror = function () {
        console.log(`Couldn't delete database`);
    };
    req.onblocked = function () {
        console.log(`Couldn't delete database due to the operation being blocked`);
    };
}

export const getStore = async (storeName, database) => {
    // console.log("getStore:", storeName);
    return new Promise(async (resolve, reject) => {
        let db;
        if (!database) {
            const r = await request();
            db = r.result;
        } else {
            db = database;
        }
        const store = db.transaction(storeName, "readwrite").objectStore(storeName);
        // console.log(storeName + " store:", store);
        resolve(store);
    });
}

export const createStore = async (db, storeName, entity) => {
    // console.log("createStore:", storeName);
    return new Promise(async (resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
            for (const prop in entity) { 
                if (typeof prop !== "function" && prop !== "id") store.createIndex(prop, prop, { unique: false });
            }
        };
        resolve();
    });
}

export default request;
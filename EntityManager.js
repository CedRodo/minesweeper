import { getStore } from "../indexedDBConnect.js";

export const save = async (storeName, data, db) => {
    return new Promise(async function (resolve, reject) {
        const store = await getStore(storeName, db);
        // console.log("storeName:", storeName);    
        // console.log("data:", data);    
        const id = data.id;
        // console.log("id:", id);    
        delete(data.id);
        // store.add(data);
        if (!id) {
            // console.log("no record");
            store.add(data);
        } else {
            store.openCursor().onsuccess = async (event) => {
                const cursor = event.target.result;
                // console.log("cursor:", cursor);
                if (cursor) {
                    if (cursor.key === id) {
                        // console.log("cursor.key:", cursor.key);
                        cursor.update(Object.assign(cursor.value, data));
                        resolve();
                    } else {
                        cursor.continue();
                    }
                } else {
                    // console.log("Record missing.");
                    resolve();
                }
            };
        }
    });
}

export const findById = async (storeName, id) => {
    // console.log("id:", id);     
    if (typeof id == "undefined" || id === null) {
        console.log("No id submitted");
        return null;
    }
    return new Promise(async function (resolve, reject) {
        // console.log("storeName:", storeName);        
        const store = await getStore(storeName);
        // console.log("store:", store);        
        const record = store.get(id);
        let query = null;
        record.onsuccess = function () {
            query = record.result;
            // console.log("query:", query);
            resolve(query);
        }
    });
}

export const findOneBy = async (storeName, prop, value) => {
    // console.log("storeName:", storeName);    
    // console.log("prop:", prop);    
    // console.log("value:", value);    
    return new Promise(async function (resolve, reject) {
        const store = await getStore(storeName);
        store.openCursor().onsuccess = async (event) => {
            const cursor = event.target.result;
            let query = null;
            if (cursor) {
                if (cursor.value[prop] === value) {
                    query = cursor.value;
                    resolve(query);
                } else {
                    cursor.continue();
                }
            } else {
                console.log("End of the list.");
                resolve(query);
            }
        }
    });
}

export const findBy = async (storeName, prop, value) => {
    return new Promise(async function (resolve, reject) {
        const store = await getStore(storeName);
        store.openCursor().onsuccess = async (event) => {
            const cursor = event.target.result;
            let query = [];
            if (cursor) {
                if (cursor.value[prop] === value) {
                    query.push(cursor.value);
                } else {
                    cursor.continue();
                }
            } else {
                console.log("End of the list.");
                resolve(query);
            }
        }
    });
}

export const findAll = async (storeName) => {
    return new Promise(async function (resolve, reject) {
        const store = await getStore(storeName);
        const achievement = store.getAll();
        let query = null;
        achievement.onsuccess = function () {
            query = achievement.result;
            resolve(query);
        }
    });
}

export const remove = async (storeName, id) => {
    console.log("id:", id);
    if (typeof id == "undefined" || id === null) {
        console.log("No id submitted");
        return null;
    }
    return new Promise(async function (resolve, reject) {
        console.log("storeName:", storeName);
        const store = await getStore(storeName);
        console.log("store:", store);
        const record = store.delete(id);
        record.onsuccess = function () {
            console.log("The record has been deleted.");
            resolve();
        }
    });
}
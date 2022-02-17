let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    console.log(e.target.result)
    if (navigator.online) {

    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    transactionObjectStore.add(record)
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction', 'readwrite']);
    const transactionObjectStore = transaction.objectStore('new_transaction');
    // get all records -- store to var
    const getAll = transactionObjectStore.getAll();
    // if getAll successful and data exists then fetch
    getAll.onsuccess = function() {
        if(getAll.result.length) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(serverRes => {
                if (serverRes.message) {
                    throw new Error(serverRes);
                };
                // open new transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                // access object store
                const transactionObjectStore = transaction.objectStore('new_transaction');
                // clear store
                transactionObjectStore.clear();

                console.log('all saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};
// run upload when internet connects
window.addEventListener('online', uploadTransaction);
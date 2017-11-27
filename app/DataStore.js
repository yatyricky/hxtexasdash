let instance = null;

export default class DataStore {

    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    static storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return false;
        }
    }

    getJWT() {
        if (DataStore.storageAvailable('localStorage')) {
            if (!localStorage.getItem('jwt')) {
                localStorage.setItem('jwt', "");
            }
            return localStorage.getItem('jwt');
        } else {
            return "";
        }
    }

    setJWT(jwt) {
        localStorage.setItem('jwt', jwt);
    }

}

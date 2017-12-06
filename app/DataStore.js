import axios from 'axios';

let instance = null;

export default class DataStore {

    constructor() {
        if (!instance) {
            instance = this;
        }
        this.access = [];
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

    setAccess(allowedPages) {
        localStorage.setItem('access', JSON.stringify(allowedPages));
        
    }

    getAccess() {
        if (localStorage.getItem("access") === null) {
            return [];
        }
        return JSON.parse(localStorage.getItem('access'));
    }

    isAuthenticated() {
        const axiosOptions = {
            method: 'POST',
            url: 'api/checkAuth.php',
            data: '',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + this.getJWT()
            },
            json: true
        };
        axios(axiosOptions).then(response => {
            return true;
        }).catch(error => {
            return false;
        });
        return false;
    }

}

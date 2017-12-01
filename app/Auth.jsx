import React from 'react';
import DataStore from './DataStore.js';
import { Link, hashHistory } from 'react-router';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from './Flag.js';

class Auth extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.lastRequest = null;
        this.state = {
            "flag": Flag.nothing
        }
    }

    redirect() {
        const redirect = Object.prototype.hasOwnProperty.call(this.props.location.query, 'back') ? this.props.location.query['back'] : "/newUser";
        hashHistory.push(redirect);
    }

    postData(password) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/login.php',
            method: 'post',
            data: encodeURI('do=login&code=' + password),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            cancelToken: source.token
        }

        const axiosRequest = axios(axiosConfig).then((response) => {
            this.dataStore.setJWT(response.data.jwt);
            this.setState({
                flag: Flag.success,
                result: response.data
            });
            this.redirect();
        }).catch((error) => {
            this.setState({
                flag: Flag.failed,
                result: error.response
            });
        });;
        
        this.setState({flag: Flag.waiting});
    }

    authenticate() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }        
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/login.php',
            method: 'post',
            data: encodeURI('do=auth'),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + this.dataStore.getJWT()
            },
            cancelToken: source.token
        }

        const axiosRequest = axios(axiosConfig).then((response) => {
            this.setState({
                flag: Flag.success,
                result: response.data
            });
            this.redirect();
        }).catch((error) => {
            this.setState({
                flag: Flag.nothing,
                result: error.response
            });
        });;
        
        this.setState({flag: Flag.waiting});
    }

    renderResult(flag) {
        const inputPassword = (
            <input
                type="password"
                ref="password"
                className="input-sm"
                onChange={this.validateInput}
            />
        );
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (<Link to="/newUser">已验证</Link>);
                break;
            case Flag.failed:
                ret = (
                    <div>
                        <div>{inputPassword}</div>
                        <div>{`解锁失败 (╯‵□′)╯︵┻━┻ (${this.state.result.status}: ${this.state.result.statusText})`}</div>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (<div className="loader" />);
                break;
            case Flag.nothing:
                ret = (
                    <div>
                        {inputPassword}
                        <div>未验证</div>
                    </div>
                );
                break;
            default:
                ret = (<div/>);
        }
        return ret;
    }

    componentDidMount() {
        if (Object.prototype.hasOwnProperty.call(this.props.location.query, 'back') == false) {
            this.authenticate();
        }
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    validateInput() {
        let password = this.refs.password.value;
        if (password.length == 8) {
            this.postData(password);
        } else {
            this.setState({
                flag: Flag.nothing
            });
        }
    }

    render() {
        return (
            <div>
                <h1 className="page-header auth-block">输入神秘代码以解锁内容</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default Auth;
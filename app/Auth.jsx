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
        this.handleSubmit = this.handleSubmit.bind(this);
        this.lastRequest = null;
        
        this.state = {
            "flag": Flag.nothing,
            "usernameValue": "",
            "passwordValue": ""
        }
    }

    redirect() {
        const redirect = Object.prototype.hasOwnProperty.call(this.props.location.query, 'back') ? this.props.location.query['back'] : "/overview";
        hashHistory.push(redirect);
    }

    postData(username, password) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/login.php',
            method: 'post',
            data: encodeURI(`do=login&name=${username}&code=${password}`),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            cancelToken: source.token
        }

        const axiosRequest = axios(axiosConfig).then((response) => {
            this.setState({
                flag: Flag.success,
                resultSuccess: response.data
            });
            this.redirect();
        }).catch((error) => {
            this.setState({
                flag: Flag.failed,
                resultFail: error.response
            });
        });
        
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
            data: encodeURI(`view=${this.props.location.pathname}&do=auth`),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + this.dataStore.getJWT()
            },
            cancelToken: source.token
        }

        const axiosRequest = axios(axiosConfig).then((response) => {
            this.setState({
                flag: Flag.success,
                resultSuccess: response.data
            });
            this.redirect();
        }).catch((error) => {
            this.setState({
                flag: Flag.nothing,
                resultFail: error.response
            });
        });
        
        this.setState({flag: Flag.waiting});
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
        this.setState({
            usernameValue: this.refs.username.value,
            passwordValue: this.refs.password.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        this.postData(this.state.usernameValue, this.state.passwordValue);
    }

    render() {
        const formDom = (
            <form className="auth-block col-md-2 offset-md-3" onSubmit={this.handleSubmit}>
                <h2 className="page-header">登陆</h2>
                <div className="form-group">
                    <input
                        type="text"
                        ref="username"
                        className="input-sm form-control"
                        placeholder="账号"
                        onChange={this.validateInput}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        ref="password"
                        className="input-sm form-control"
                        placeholder="密码"
                        onChange={this.validateInput}
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="form-control btn btn-primary">提交</button>
                </div>
            </form>
        );
        let ret;
        switch (this.state.flag) {
            case Flag.success:
                this.dataStore.setAccess(this.state.resultSuccess.access);
                this.dataStore.setJWT(this.state.resultSuccess.jwt);
                ret = (<Link to="/overview">已验证</Link>);
                break;
            case Flag.failed:
                ret = (
                    <div>
                        <div>{formDom}</div>
                        <div>{`验证失败 (╯‵□′)╯︵┻━┻ (${this.state.resultFail.status}: ${this.state.resultFail.statusText})`}</div>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (<div className="loader" />);
                break;
            case Flag.nothing:
                ret = (
                    <div>
                        {formDom}
                    </div>
                );
                break;
            default:
                ret = (<div/>);
        }
        return ret;
    }

}

export default Auth;
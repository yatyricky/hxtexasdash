import React from 'react';
import { Link, hashHistory } from 'react-router';
import axios from 'axios';
import { CancelToken } from 'axios';

import DataStore from './DataStore.js';
import {Flag} from './Flag.js';

class Account extends React.Component {

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
            "passwordValue": "",
            "usergroupValue": "user"
        }
    }

    redirect() {
        hashHistory.push("/");
    }

    postData() {
        const {usernameValue, passwordValue, usergroupValue} = this.state;
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/createAccount.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&name=${usernameValue}&code=${passwordValue}&ugroup=${usergroupValue}`),
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
        }).catch((error) => {
            this.setState({
                flag: Flag.failed,
                resultFail: error.response
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
            data: encodeURI('do=auth&view=' + this.props.location.pathname),
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
        }).catch((error) => {
            this.setState({
                flag: Flag.denied,
                resultFail: error.response
            });
            this.redirect();
        });;
        this.setState({flag: Flag.waiting});
    }

    componentDidMount() {
        this.authenticate();
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    validateInput() {
        this.setState({
            usernameValue: this.refs.username.value,
            passwordValue: this.refs.password.value,
            usergroupValue: this.refs.usergroup.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        this.postData();
    }

    render() {
        const formDom = (
            <form className="col-md-2" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        ref="username"
                        placeholder="User name"
                        value={this.state.usernameValue}
                        onChange={this.validateInput}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        className="form-control"
                        ref="password"
                        placeholder="Password"
                        value={this.state.passwordValue}
                        onChange={this.validateInput}
                    />
                </div>
                <div className="form-group">
                    <select
                        className="form-control"
                        value={this.state.usergroupValue}
                        ref="usergroup"
                        onChange={this.validateInput}
                    >
                        <option value="user">user</option>
                        <option value="superuser">superuser</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Create</button>
            </form>
        );
        let ret;
        switch (this.state.flag) {
            case Flag.success:
                let resDom = <div />;
                if (this.state.resultSuccess.hasOwnProperty('message')) {
                    resDom = (
                        <div className="alert alert-success col-md-2 request-result">
                            {this.state.resultSuccess.message}
                        </div>
                    );
                }
                ret = (
                    <div>
                        {formDom}
                        {resDom}
                    </div>
                );
                break;
            case Flag.failed:
                ret = (
                    <div>
                        {formDom}
                        <div className="alert alert-danger col-md-2 request-result">
                            {this.state.resultFail.data.message}
                        </div>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (
                    <div>
                        {formDom}
                        <div className="loader" />
                    </div>
                );
                break;
            case Flag.denied:
                ret = (<div className="loader" />);
            default:
                ret = (<div className="loader" />);
        }
        return ret;
    }

}

export default Account;
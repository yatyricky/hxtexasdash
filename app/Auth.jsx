import React from 'react';
import DataStore from './DataStore.js';
import { Link } from 'react-router';
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

    postData(password) {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;
        xhr.open('POST', 'api/login.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                const resp = JSON.parse(xhr.responseText);
                if (resp.result == 'success') {
                    this.dataStore.setJWT(resp.jwt);
                    this.setState({
                        flag: Flag.success
                    });
                } else {
                    this.setState({
                        flag: Flag.failed,
                        result: "错误代码"
                    });
                }
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send(encodeURI('do=login&code=' + password));
        this.setState({flag: Flag.waiting});
    }

    authenticate() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;

        xhr.open('POST', 'api/login.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.dataStore.getJWT());
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                const resp = JSON.parse(xhr.responseText);
                if (resp.result == 'success') {
                    this.setState({
                        flag: Flag.success,
                        result: JSON.parse(xhr.responseText)
                    });
                } else {
                    this.setState({
                        flag: Flag.nothing
                    });
                }
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send(encodeURI("do=auth"));
        this.setState({flag: Flag.waiting});
    }

    renderResult(flag) {
        const inputPassword = (<input type="password" ref="password" className="input-sm" onChange={this.validateInput} />);
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (<Link to="/">已验证</Link>);
                break;
            case Flag.failed:
                ret = (<div>{inputPassword}{`解锁失败: ${this.state.result}`}</div>);
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
        this.authenticate();
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
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
                <h1 className="page-header">输入神秘代码以解锁内容</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default Auth;
import React from 'react';
import { Link } from "react-router";
import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

class NewUser extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.postData = this.postData.bind(this);
        this.lastRequest = null;
        this.state = {
            "flag": Flag.nothing
        }
    }

    postData() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;

        xhr.open('POST', 'api/ops/newUser.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.dataStore.getJWT());
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                this.setState({
                    flag: Flag.success,
                    result: JSON.parse(xhr.responseText)
                });
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send(encodeURI(""));
        this.setState({flag: Flag.waiting});
    }

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                let {result} = this.state;
                if (result.result == "auth") {
                    ret = (<div>{this.state.result.message}</div>);
                } else {
                    ret = (<Link to="/auth">输入神秘代码</Link>);

                }
                break;
            case Flag.failed:
                ret = (<div>{`Request Failed: ${this.state.result}`}</div>);
                break;
            case Flag.waiting:
                ret = (<div className="loader" />);
                break;
            default:
                ret = (<div />);
        }
        return ret;
    }

    componentDidMount() {
        this.postData();
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }
    }

    render() {
        return (
            <div>
                <h1 className="page-header">新增用户</h1>
                <button className="btn" onClick={this.postData}>刷新</button>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default NewUser;
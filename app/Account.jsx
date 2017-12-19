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
        this.createUser = this.createUser.bind(this);
        this.handleSubmitCreate = this.handleSubmitCreate.bind(this);
        this.handleSubmitUpdate = this.handleSubmitUpdate.bind(this);
        this.handleResetCode = this.handleResetCode.bind(this);
        this.cancelCreate = this.cancelCreate.bind(this);
        this.renderCreatePage = this.renderCreatePage.bind(this);
        this.renderUsersPage = this.renderUsersPage.bind(this);
        this.renderEditPage = this.renderEditPage.bind(this);
        this.toggleRenderFrozenAction = this.toggleRenderFrozenAction.bind(this);

        this.lastRequest = null;

        this.ugconf = {};
        this.chnconf = {};
        this.editingUser = {};

        this.state = {
            renderFrozen: false,
            flag: Flag.nothing
        }
    }

    redirect() {
        hashHistory.push("/");
    }

    createUser(fromData) {
        const {usernameValue, passwordValue, usergroupValue, channelValue} = fromData;
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/createAccount.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&name=${usernameValue}&code=${passwordValue}&ugroup=${usergroupValue}&uchannel=${channelValue}`),
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
        });
        this.setState({flag: Flag.waiting});
    }

    fetchUsers() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }        
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/fetchUsers.php',
            method: 'post',
            data: encodeURI('view=' + this.props.location.pathname),
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
            hashHistory.push("/account");
        }).catch((error) => {
            this.setState({
                flag: Flag.denied,
                resultFail: error.response
            });
            this.redirect();
        });
        this.setState({flag: Flag.waiting});
    }

    componentDidMount() {
        this.fetchUsers();
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    editUser(user) {
        this.editingUser = user;
        hashHistory.push("/account?act=edit");
    }

    cancelCreate() {
        this.fetchUsers();
    }

    joinChecked(domArr) {
        const checkedItems = [];
        for (let i = 0; i < domArr.length; i++) {
            if (domArr[i].checked == true) {
                checkedItems.push(domArr[i].value);
            }
        }
        return checkedItems.join(",");
    }

    handleSubmitCreate(e) {
        e.preventDefault();
        const form = e.target.elements;
        const checkedItems = [];
        for (let i = 0; i < form.channels.length; i++) {
            const element = form.channels[i];
            if (element.checked == true) {
                checkedItems.push(element.value);
            }
        }
        this.createUser({
            usernameValue: form.username.value,
            passwordValue: form.password.value,
            usergroupValue: form.usergroup.value,
            channelValue: checkedItems.join(",")
        });
    }
    
    handleSubmitUpdate(e) {
        e.preventDefault();
        const form = e.target.elements;
        this.postUpdateUser({
            id: this.editingUser.id,
            passVal: form.password.value,
            ugroup: form.usergroup.value,
            channels: this.joinChecked(form.channels)
        });
    }

    postResetCode(id) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/resetCode.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&id=${id}`),
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
        });
        this.setState({flag: Flag.waiting});
    }
    
    handleResetCode() {
        this.postResetCode(this.editingUser.id);
    }

    postUpdateUser(data) {
        const {id, passVal, ugroup, channels} = data;
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/updateAccount.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&id=${id}&code=${passVal}&ugroup=${ugroup}&uchannels=${channels}`),
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
        });
        this.setState({flag: Flag.waiting});
    }
    
    renderCreatePage() {
        let ret;
        const optionsDom = [];
        let keys = Object.keys(this.ugconf);
        for (let i = 0; i < keys.length; i++) {
            optionsDom.push(
                <option key={i} value={keys[i]}>{this.ugconf[keys[i]]}</option>
            );
        }
        const channelsDom = [];
        keys = Object.keys(this.chnconf);
        for (let i = 0; i < keys.length; i++) {
            channelsDom.push(
                <div className="form-check form-check-inline" key={i}>
                    <label>
                        <input
                            type="checkbox"
                            name="channels"
                            className="channel-checkbox"
                            value={keys[i]}
                        />
                        <span className="badge badge-primary channel-label">
                            {this.chnconf[keys[i]]}
                        </span>
                    </label>
                </div>
            );
        }
        const formDom = (
            <div>
                <h1>创建用户</h1>
                <form onSubmit={this.handleSubmitCreate}>
                    <div className="form-group row">
                        <label htmlFor="username" className="col-sm-2 col-form-label">用户名：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                placeholder="User name"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="password" className="col-sm-2 col-form-label">密码：</label>
                        <div className="col-sm-4">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="usergroup" className="col-sm-2 col-form-label">用户组：</label>
                        <div className="col-sm-4">
                            <select
                                className="form-control"
                                id="usergroup"
                                name="usergroup"
                            >
                                {optionsDom}
                            </select>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">渠道权限：</label>
                        <div className="col-sm-4">
                            <div className="form-control">
                                {channelsDom}
                            </div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-2">
                            <button type="submit" className="btn btn-primary">创建</button>
                            <span className="col-sm-1"></span>
                            <button type="button" onClick={this.cancelCreate} className="btn btn-secondary">取消</button>
                        </div>
                    </div>
                </form>
            </div>
        );
        switch (this.state.flag) {
            // insert user success
            case Flag.success:
                
                // Result flash message
                let resDom = <div />;
                if (this.state.resultSuccess.hasOwnProperty('message')) {
                    resDom = (
                        <div className="alert alert-success col-md-6 request-result">
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
                        <div className="alert alert-danger col-md-6 request-result">
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
    
    renderEditPage() {
        let ret;
        const optionsDom = [];
        let keys = Object.keys(this.ugconf);
        let selectDom = (
            <select
                className="form-control"
                id="usergroup"
                name="usergroup"
            >
                {optionsDom}
            </select>
        );
        for (let i = 0; i < keys.length; i++) {
            if (this.editingUser.usergroup == keys[i]) {
                selectDom = (
                    <select
                        className="form-control"
                        id="usergroup"
                        name="usergroup"
                        defaultValue={keys[i]}
                    >
                        {optionsDom}
                    </select>
                );
            }
            optionsDom.push(
                <option key={i} value={keys[i]}>{this.ugconf[keys[i]]}</option>
            );
        }

        const channelsDom = [];
        keys = Object.keys(this.chnconf);
        for (let i = 0; i < keys.length; i++) {
            if (this.editingUser.channels.includes(keys[i])) {
                channelsDom.push(
                    <div className="form-check form-check-inline" key={i}>
                        <label>
                            <input
                                type="checkbox"
                                name="channels"
                                className="channel-checkbox"
                                value={keys[i]}
                                defaultChecked
                                />
                            <span className="badge badge-primary channel-label">
                                {this.chnconf[keys[i]]}
                            </span>
                        </label>
                    </div>
                );
            } else {
                channelsDom.push(
                    <div className="form-check form-check-inline" key={i}>
                        <label>
                            <input
                                type="checkbox"
                                name="channels"
                                className="channel-checkbox"
                                value={keys[i]}
                                />
                            <span className="badge badge-primary channel-label">
                                {this.chnconf[keys[i]]}
                            </span>
                        </label>
                    </div>
                );
            }
        }
        const formDom = (
            <div>
                <h1>编辑用户：{this.editingUser.username}</h1>
                <form onSubmit={this.handleSubmitUpdate}>
                    <div className="form-group row">
                        <label htmlFor="username" className="col-sm-2 col-form-label">用户名：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control disabled"
                                id="username"
                                name="username"
                                placeholder="User name"
                                defaultValue={this.editingUser.username}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="password" className="col-sm-2 col-form-label">密码：</label>
                        <div className="col-sm-4">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="usergroup" className="col-sm-2 col-form-label">用户组：</label>
                        <div className="col-sm-4">
                            {selectDom}
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">渠道权限：</label>
                        <div className="col-sm-4">
                            <div className="form-control">
                                {channelsDom}
                            </div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-4">
                            <button type="submit" className="btn btn-primary">保存</button>
                            <span className="col-sm-1"></span>
                            <button type="button" className="btn btn-danger" onClick={this.handleResetCode}>重置密码</button>
                            <span className="col-sm-1"></span>
                            <button type="button" onClick={this.cancelCreate} className="btn btn-secondary">取消</button>
                        </div>
                    </div>
                </form>
            </div>
        );
        switch (this.state.flag) {
            // insert user success
            case Flag.success:
                
                // Result flash message
                let resDom = <div />;
                if (this.state.resultSuccess.hasOwnProperty('message')) {
                    resDom = (
                        <div className="alert alert-success col-md-6 request-result">
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
                        <div className="alert alert-danger col-md-6 request-result">
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

    toggleRenderFrozenAction() {
        this.setState({renderFrozen: !this.state.renderFrozen});
    }

    renderUsersPage() {
        let ret;
        switch (this.state.flag) {
            // fetch user success
            case Flag.success:
                const toggleRenderFrozenText = this.state.renderFrozen == false ? "显示所有用户" : "隐藏停用用户";
                const toggleRenderFrozen = (<button type="button" className="btn btn-primary" onClick={this.toggleRenderFrozenAction}>{toggleRenderFrozenText}</button>)

                // User Mod Table
                const {users, chnconf, ugconf} = this.state.resultSuccess.data;
                this.chnconf = chnconf;
                this.ugconf = ugconf;
                const userTableEntries = [];
                for (let i = 0, n = users.length; i < n; i++) {
                    if (this.state.renderFrozen == true || users[i].usergroup != "frozen") {
                        const channels = [];
                        for (let j = 0, m = users[i].channels.length; j < m; j++) {
                            channels.push(
                                <span key={j} className="badge badge-primary channel-item">{chnconf[users[i].channels[j]]}</span>
                            );
                        }
                        userTableEntries.push(
                            <tr key={i}>
                                <td className="font-small">{users[i].id}</td>
                                <td className="font-small">{users[i].username}</td>
                                <td className="font-small">{ugconf[users[i].usergroup]}</td>
                                <td className="font-small">{channels}</td>
                                <td className="font-small">
                                    <button
                                        type="button"
                                        onClick={() => this.editUser(users[i])}
                                        className="btn btn-primary"
                                    >编辑</button>
                                </td>
                            </tr>
                        );
                    }
                }
                const userTableDom = (
                    <div>
                        <h1 className="page-header">用户管理</h1>
                        {toggleRenderFrozen}
                        <div className="table-responsive request-result">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className="font-small">ID</th>
                                        <th className="font-small">用户名</th>
                                        <th className="font-small">用户组</th>
                                        <th className="font-small">渠道权限</th>
                                        <th className="font-small">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userTableEntries}
                                </tbody>
                            </table>
                        </div>
                        <Link className="btn btn-primary" to="/account?act=create">创建用户</Link>
                    </div>
                );
                ret = userTableDom;
                break;
            case Flag.failed:
                ret = (<div className="loader" />);
                break;
            default:
                ret = (<div className="loader" />);
        }
        return ret;
    }

    render() {
        let page = "users";
        if (Object.prototype.hasOwnProperty.call(this.props.location.query, 'act')) {
            if (this.props.location.query.act == "create") {
                page = "create";
            } else if (this.props.location.query.act == "edit") {
                page = "edit";
            }
        }
        switch (page) {
            case 'create':
                return this.renderCreatePage();
                break;
            case 'edit':
                return this.renderEditPage();
                break;
            default: // users
                return this.renderUsersPage();
                break;
        }
    }

}

export default Account;
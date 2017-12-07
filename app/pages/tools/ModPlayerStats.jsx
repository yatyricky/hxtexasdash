import React from 'react';
import { Link, hashHistory } from "react-router";
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

class ModPlayerStats extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.postData = this.postData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.lastRequest = null;

        this.state = {
            "flag": Flag.nothing
        }
    }

    postData(params) {
        const {inputPlayerIdValue, inputPlayerNameValue} = params;

        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/modPlayer.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&id=${params.accountId}&dmd=${params.diamonds}&chips=${params.chips}`),
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
        }).catch((error) => {
            this.setState({
                flag: Flag.failed,
                resultFailed: error.response
            });
            hashHistory.push(`/auth${error.response.status == 403 ? '' : '?back=' + this.props.location.pathname}`);
        });

        this.setState({flag: Flag.waiting});
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target.elements;
        this.postData({
            accountId: form.accountId.value,
            diamonds: form.diamonds.value,
            chips: form.chips.value
        });
    }

    componentDidMount() {
        this.postData({
            accountId: "",
            diamonds: "",
            chips: ""
        });
    }

    renderTable() {
        const {message} = this.state.result;
        const entries = [];
        for (let i = 0; i < message.length; i++) {
            entries.push(
                <div key={i} className="alert alert-primary col-sm-6">
                    {message[i]}
                </div>
            );
        }
        return (
            <div>
                {entries}
            </div>
        );
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    render() {
        const headerDom = (
            <div>
                <h1 className="page-header">修改玩家属性</h1>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="accountId" className="col-sm-2 col-form-label">玩家ID：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="accountId"
                                name="accountId"
                                autoComplete="on"
                                placeholder="玩家ID"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="diamonds" className="col-sm-2 col-form-label">钻石数量：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="diamonds"
                                name="diamonds"
                                autoComplete="on"
                                placeholder="钻石数量"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="chips" className="col-sm-2 col-form-label">筹码数量：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="chips"
                                name="chips"
                                autoComplete="on"
                                placeholder="筹码数量"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-4">
                            <input type="submit" className="btn btn-primary" value="提交" />
                        </div>
                    </div>
                </form>
            </div>
        );
        let ret;
        switch (this.state.flag) {
            case Flag.success:
                ret = (
                    <div>
                        {headerDom}
                        {this.renderTable()}
                    </div>
                );
                break;
            case Flag.failed:
                ret = (
                    <div>
                        <h3>载入失败 (╯‵□′)╯︵┻━┻</h3>
                        <div>{`${this.state.resultFailed.status}: ${this.state.resultFailed.statusText}`}</div>
                        <Link to="/auth">输入神秘代码</Link>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (<div className="loader" />);
                break;
            case Flag.nothing:
                ret = headerDom;
                break;
            default:
                ret = (<div />);
        }
        return ret;
    }

}

export default ModPlayerStats;
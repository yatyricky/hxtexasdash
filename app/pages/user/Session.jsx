import React from 'react';
import { Link, hashHistory } from "react-router";
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class Session extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.lastRequest = null;

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(7, 'days');

        this.state = {
            "flag": Flag.nothing,
            "inputDateValueStart": this.targetDateStart.format('YYYY-MM-DD'),
            "inputDateValueEnd": this.targetDateEnd.format('YYYY-MM-DD')
        }
    }

    postData(dateStart, dateEnd) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/session.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&start=${dateStart}&end=${dateEnd}`),
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
                result: error.response
            });
            hashHistory.push(`/auth?back=${this.props.location.pathname}`);
        });;

        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const result = this.state.result.data.reverse();
        const entries = [];

        for (let i = 0, n = result.length; i < n; i++) {
            entries.push(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].session}</td>
                    <td className="font-small">{result[i].avgLength}</td>
                    <td className="font-small">{result[i].sum}</td>
                </tr>
            );
        }

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="font-small">日期</th>
                        <th className="font-small">启动次数</th>
                        <th className="font-small">平均时长</th>
                        <th className="font-small">总时长</th>
                    </tr>
                </thead>
                <tbody>
                    {entries}
                </tbody>
            </table>
        );
    }

    renderResult(flag) {
        let ret;
        const inputFields = (
            <div>
                <span>选择起始日期：</span>
                <input type="date" ref="inputDateStart" value={this.state.inputDateValueStart} className="input-sm" onChange={this.validateInput} />
                <span>选择结束日期：</span>
                <input type="date" ref="inputDateEnd" value={this.state.inputDateValueEnd} className="input-sm" onChange={this.validateInput} />
            </div>
        );
        switch (flag) {
            case Flag.success:
                ret = (
                    <div>
                        {inputFields}
                        <div className="table-responsive">{this.renderTable()}</div>
                    </div>
                );
                break;
            case Flag.failed:
                ret = (
                    <div>
                        <h3>载入失败 (╯‵□′)╯︵┻━┻</h3>
                        <div>{`${this.state.result.status}: ${this.state.result.statusText}`}</div>
                        <Link to="/auth">输入神秘代码</Link>
                    </div>
                );
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
        this.postData(this.targetDateStart.format('YYYYMMDD'), this.targetDateEnd.format('YYYYMMDD'));
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    validateInput() {
        let inputDateStart = moment(this.refs.inputDateStart.value);
        let inputDateEnd = moment(this.refs.inputDateEnd.value);
        if (inputDateStart > this.targetDateEnd) {
            inputDateStart = this.targetDateEnd;
        }
        if (inputDateEnd > this.targetDateEnd) {
            inputDateEnd = this.targetDateEnd;
        }

        this.setState({
            inputDateValueStart: inputDateStart.format('YYYY-MM-DD'),
            inputDateValueEnd: inputDateEnd.format('YYYY-MM-DD')

        });
        this.postData(inputDateStart.format('YYYYMMDD'), inputDateEnd.format('YYYYMMDD'));
    }

    render() {
        return (
            <div>
                <h1 className="page-header">启动次数</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default Session;
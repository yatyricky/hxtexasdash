import React from 'react';
import { Link, hashHistory } from "react-router";
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class PlayerChipsChange extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.postData = this.postData.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.setPlayerId = this.setPlayerId.bind(this);

        this.lastRequest = null;

        this.config = {categories: [], data: []}; // highcharts config

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(7, 'days');
        this.state = {
            "flag": Flag.nothing,
            "inputDateValueStart": this.targetDateStart.format('YYYY-MM-DD'),
            "inputDateValueEnd": this.targetDateEnd.format('YYYY-MM-DD'),
            "inputPlayerIdValue": ""
        }
    }

    postData(dateStart, dateEnd, playerId) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/playerChipsChange.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&start=${dateStart}&end=${dateEnd}&pid=${playerId}`),
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
            hashHistory.push(`/auth${error.response.status == 403 ? '' : '?back=' + this.props.location.pathname}`);
        });

        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const entries = this.state.result.data.map((item, i) => {
            return (
                <tr key={i}>
                    <td>{item[0]}</td>
                    <td className="text-right">{item[2]}</td>
                    <td className="text-right">{item[3]}</td>
                    <td className="text-right">{item[4]}</td>
                    <td className="text-right">{item[5]}</td>
                </tr>
            );
        });

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th className="text-right">道具类型</th>
                        <th className="text-right">变化值</th>
                        <th className="text-right">结果值</th>
                        <th className="text-right">变化原因</th>
                    </tr>
                </thead>
                <tbody>
                    {entries}
                </tbody>
            </table>
        );
    }

    renderResult(flag) {
        const inputFields = (
            <div>
                <span>选择起始日期：</span>
                <input
                    type="date"
                    ref="inputDateStart"
                    value={this.state.inputDateValueStart}
                    className="input-sm"
                    onChange={this.validateInput}
                />
                <span>选择结束日期：</span>
                <input
                    type="date"
                    ref="inputDateEnd"
                    value={this.state.inputDateValueEnd}
                    className="input-sm"
                    onChange={this.validateInput}
                />
                <input
                    type="text"
                    ref="inputPlayerId"
                    value={this.state.inputPlayerIdValue}
                    className="input-sm"
                    onChange={this.validateInput}
                />
                <button type="button" onClick={this.setPlayerId}>查询</button>
            </div>
        );
        let ret;
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
        this.postData('', '', '');
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    setPlayerId() {
        this.postData(this.state.inputDateValueStart, this.state.inputDateValueEnd, this.state.inputPlayerIdValue);
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
            inputDateValueEnd: inputDateEnd.format('YYYY-MM-DD'),
            inputPlayerIdValue: this.refs.inputPlayerId.value
        });
    }

    render() {
        return (
            <div>
                <h1 className="page-header">玩家筹码变动</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default PlayerChipsChange;
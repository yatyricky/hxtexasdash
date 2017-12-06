import React from 'react';
import { Link, hashHistory } from "react-router";
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class QueryTable extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.initQuery = this.initQuery.bind(this);
        this.lastRequest = null;

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(7, 'days');

        this.state = {
            "flag": Flag.nothing,
            "inputDateValueStart": this.targetDateStart.format('YYYY-MM-DD'),
            "inputDateValueEnd": this.targetDateEnd.format('YYYY-MM-DD'),
            "inputRoomIdValue": "",
            "inputPlayerIdValue": ""
        }

        this.shouldUpdate = false;
    }

    postData(dateStart, dateEnd, roomId, playerId) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/queryTable.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&start=${dateStart}&end=${dateEnd}&rid=${roomId}&pid=${playerId}`),
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
        const result = this.state.result.data;
        const entries = [];
        const convertPoker = (ps) => {
            let tokens = ps.match(/.{1,2}/g);
            let doms = [];
            for (let i = 0; i < tokens.length; i++) {
                const spade = {"color": "#000000"};
                const heart = {"color": "#FF6666"};
                const club = {"color": "#009900"};
                const diamond = {"color": "#3333FF"};
                let dom = null;
                switch (tokens[i].charAt(0)) {
                    case 'S':
                        dom = (<span key={i} style={spade}>♠{tokens[i].charAt(1) == "T" ? "10" : tokens[i].charAt(1)}</span>)
                        break;
                    case 'H':
                        dom = (<span key={i} style={heart}>♥{tokens[i].charAt(1) == "T" ? "10" : tokens[i].charAt(1)}</span>)
                        break;
                    case 'C':
                        dom = (<span key={i} style={club}>♣{tokens[i].charAt(1) == "T" ? "10" : tokens[i].charAt(1)}</span>)
                        break;
                    case 'D':
                        dom = (<span key={i} style={diamond}>♦{tokens[i].charAt(1) == "T" ? "10" : tokens[i].charAt(1)}</span>)
                        break;
                    default:
                        break;
                }
                doms.push(dom);
            }
            return doms;
        };

        const prettyPlayer = (players) => {
            let doms = [];
            for (let i = 0; i < players.length; i++) {
                doms.push(
                    <div key={i}>
                        <span>ID: </span><span>{players[i].id}</span>&nbsp;
                        <span>手牌: </span><span>{convertPoker(players[i].hand)}</span>&nbsp;
                        <span>下注: </span><span>{players[i].bet}</span>&nbsp;
                        <span>赢取: </span><span>{players[i].win}</span>&nbsp;
                    </div>
                );
            }
            return doms;
        }

        for (let i = 0, n = result.length; i < n; i++) {
            entries.push(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].roomId}</td>
                    <td className="font-small">{convertPoker(result[i].commc)}</td>
                    <td className="font-small">{result[i].button}</td>
                    <td className="font-small">{result[i].sb}</td>
                    <td className="font-small">{result[i].end}</td>
                    <td className="font-small">{prettyPlayer(result[i].players)}</td>
                </tr>
            );
        }

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="font-small">日期</th>
                        <th className="font-small">房间ID</th>
                        <th className="font-small">公共牌</th>
                        <th className="font-small">庄位</th>
                        <th className="font-small">小盲注额</th>
                        <th className="font-small">结束轮次</th>
                        <th className="font-small">玩家信息</th>
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
                <span>房间ID：</span>
                <input
                    type="text"
                    ref="inputRoomId"
                    value={this.state.inputRoomIdValue}
                    className="input-sm"
                    onChange={this.validateInput}
                />
                <span>玩家ID：</span>
                <input
                    type="text"
                    ref="inputPlayerId"
                    value={this.state.inputPlayerIdValue}
                    className="input-sm"
                    onChange={this.validateInput}
                />
                <button type="button" onClick={this.initQuery}>查询</button>
            </div>
        );
        switch (flag) {
            case Flag.success:
                ret = (
                    <div>
                        {inputFields}
                        <div>总共：{this.state.result.data.length}</div>
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
        this.postData('', '', '', '');
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    initQuery() {
        this.postData(this.state.inputDateValueStart, this.state.inputDateValueEnd, this.state.inputRoomIdValue, this.state.inputPlayerIdValue);
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
            inputRoomIdValue: this.refs.inputRoomId.value,
            inputPlayerIdValue: this.refs.inputPlayerId.value
        });
    }

    render() {
        return (
            <div>
                <h1 className="page-header">查询牌桌</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default QueryTable;
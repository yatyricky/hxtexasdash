import React from 'react';
import { Link } from "react-router";
import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class PaidUser extends React.Component {

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
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;

        xhr.open('POST', 'api/ops/paidUser.php');
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
        xhr.send(encodeURI(`start=${dateStart}&end=${dateEnd}`));
        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const result = this.state.result.data.reverse();
        const entries = [];

        console.log(result);

        for (let i = 0, n = result.length; i < n; i++) {
            entries.push(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].revenue}</td>
                    <td className="font-small">{result[i].pu}</td>
                    <td className="font-small">{(result[i].pr * 100).toFixed(2) + '%'}</td>
                    <td className="font-small">{result[i].newPaid}</td>
                    <td className="font-small">{(result[i].npr * 100).toFixed(2) + '%'}</td>
                    <td className="font-small">{result[i].arpu}</td>
                    <td className="font-small">{result[i].arppu}</td>
                </tr>
            );
        }

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="font-small">日期</th>
                        <th className="font-small">付费金额</th>
                        <th className="font-small">付费用户</th>
                        <th className="font-small">付费率</th>
                        <th className="font-small">新付费用户</th>
                        <th className="font-small">新付费率</th>
                        <th className="font-small">ARPU</th>
                        <th className="font-small">ARPPU</th>
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
                let {result} = this.state;
                if (result.result == "auth") {
                    ret = (
                        <div>
                            {inputFields}
                            <div className="table-responsive">{this.renderTable()}</div>
                        </div>
                    );
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
        this.postData(this.targetDateStart.format('YYYYMMDD'), this.targetDateEnd.format('YYYYMMDD'));
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
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
                <h1 className="page-header">付费用户</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default PaidUser;
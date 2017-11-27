import React from 'react';
import {Flag} from '../Flag.js';
import ReactHighcharts from 'react-highcharts';

const moment = require('moment');

class RobotCoinsSum extends React.Component {

    constructor() {
        super();
        this.postData = this.postData.bind(this);
        this.validateInput = this.validateInput.bind(this);

        this.lastRequest = null;

        this.config = {categories: [], data: []}; // highcharts config

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

        let request = `api/robotCoinsSum.php?start=${dateStart}&end=${dateEnd}`;

        xhr.open('GET', request);
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                const obj = JSON.parse(xhr.responseText);
                this.setState({
                    flag: Flag.success,
                    result: obj
                });
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send();
        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const entries = [];
        const {result} = this.state;

        let prev = 0;
        let balance = 0;
        let validate = 0;
        for (let i = 0, n = result.length; i < n; i++) {
            balance = result[i].grossWin + result[i].sysAdd + result[i].lost + result[i].sysDeduct - result[i].rake;
            if (i > 0) {
                validate = (prev + balance - result[i].sum) / result[i].sum * 100.0;
            }
            prev = result[i].sum;
            entries.push(
                <tr key={i}>
                    <td>{result[i].date}</td>
                    <td className="text-right">{Number(result[i].sum).toLocaleString()}</td>
                    <td className="text-right">{Number(result[i].grossWin).toLocaleString()}</td>
                    <td className="text-right">{Number(result[i].sysAdd).toLocaleString()}</td>
                    <td className="text-right">{Number(result[i].lost).toLocaleString()}</td>
                    <td className="text-right">{Number(result[i].sysDeduct).toLocaleString()}</td>
                    <td className="text-right">{Number(result[i].rake).toLocaleString()}</td>
                    <td className="text-right">{Number(balance).toLocaleString()}</td>
                    <td className="text-right">{`${Number(validate).toFixed(2)}%`}</td>
                </tr>
            );
        }

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>时间</th>
                        <th className="text-right">筹码总量</th>
                        <th className="text-right">毛盈利</th>
                        <th className="text-right">系统增加</th>
                        <th className="text-right">输给玩家</th>
                        <th className="text-right">系统减少</th>
                        <th className="text-right">抽水</th>
                        <th className="text-right">平衡</th>
                        <th className="text-right">误差</th>
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
        switch (flag) {
            case Flag.success:
                for (let i = 0, n = this.state.result.length; i < n; i++) {
                    this.config.categories.push(this.state.result[i].date);
                    this.config.data.push(parseInt(this.state.result[i].sum));
                }
                const highConfig = {
                    title: {
                        text: '每日筹码存量'
                    },
                    xAxis: {
                        categories: this.config.categories
                    },
                    yAxis: {
                        title: {
                            text: '总量'
                        }
                    },
                    series: [{
                        name: '总筹码',
                        data: this.config.data
                    }]

                };
                ret = (
                    <div>
                        <ReactHighcharts config = {highConfig} />
                        <div className="table-responsive">{this.renderTable()}</div>
                    </div>
                );
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
                <h1 className="page-header">机器人最近筹码存量</h1>
                <span>选择起始日期：</span>
                <input type="date" ref="inputDateStart" value={this.state.inputDateValueStart} className="input-sm" onChange={this.validateInput} />
                <span>选择结束日期：</span>
                <input type="date" ref="inputDateEnd" value={this.state.inputDateValueEnd} className="input-sm" onChange={this.validateInput} />
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default RobotCoinsSum;
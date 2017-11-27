import React from 'react';
import {Flag} from '../Flag.js';

class PlayerWonRobots extends React.Component {

    constructor() {
        super();
        this.postData = this.postData.bind(this);
        this.validateInput = this.validateInput.bind(this);
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

        xhr.open('POST', 'api/playerWonRobots.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                this.setState({
                    flag: Flag.success,
                    result: xhr.responseText
                });
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send(encodeURI(`start=${this.refs.inputDateStart.value}&end=${this.refs.inputDateEnd.value}`));
        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const tempObj = JSON.parse(this.state.result);
        let obj = [];
        for (let key in tempObj) {
            obj.push([key, tempObj[key]]);
        }

        obj.sort(function(a, b) {
            if (a[1] === b[1]) {
                return 0;
            } else {
                return (a[1] < b[1]) ? -1 : 1;
            }
        });
        let sum = 0;
        const entries = obj.map((item, index) => {
            sum += item[1];
            return (
                <tr key={index}>
                    <td>{item[0]}</td>
                    <td className="text-right">{item[1].toLocaleString()}</td>
                </tr>
            );
        });
        return (
            <div className="table-responsive">
                <div>合计：{sum.toLocaleString()}</div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th className="text-right">盈利</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries}
                    </tbody>
                </table>
            </div>
        );
    }

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                ret = this.renderTable();
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

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }
    }

    validateInput() {
        if (this.refs.inputDateStart.value != "" && this.refs.inputDateEnd.value != "") {
            this.postData();
        }
    }

    render() {
        return (
            <div>
                <h1 className="page-header">玩家赢取机器人筹码统计</h1>
                <span>选择起始日期：</span>
                <input type="date" ref="inputDateStart" className="input-sm" onChange={this.validateInput} />
                <span>选择结束日期：</span>
                <input type="date" ref="inputDateEnd" className="input-sm" onChange={this.validateInput} />
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default PlayerWonRobots;

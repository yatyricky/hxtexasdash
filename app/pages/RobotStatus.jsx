import React from 'react';
import {Flag} from '../Flag.js';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const moment = require('moment');

class RobotTable extends React.Component {

    numberFormatter(cell, row) {
        return cell.toLocaleString();
    }

    render() {
        const now = moment().valueOf();
        let sumCoins = 0;
        let sumGMCoins = 0;
        let online = 0;
        let uniqueTables = [];
        let tableData = [];
        for (let i = this.props.list.length - 1; i >= 0; i--) {
            const item = this.props.list[i];
            sumCoins += parseInt(item.coins);
            sumGMCoins += parseInt(item.gm_add_coins);
            online += parseInt(item.table_id) == 0 ? 0 : 1;
            if (uniqueTables.indexOf(item.table_id) == -1) {
                uniqueTables.push(item.table_id);
            }

            tableData.push({
                "account_id": item.account_id,
                "table_id": item.table_id,
                "nick_name": item.nick_name,
                "coins": item.coins,
                "gm_add_coins": item.gm_add_coins,
                "won": Number(item.coins) - Number(item.gm_add_coins) - 18888,
                "weight": item.weight,
                "robot_type": item.robot_type == 1 ? "Mimics" : "Follower",
                "wake_time": (function (roboTime, curTime) {
                    let botTimeStr = "";
                    if (roboTime <= curTime) {
                        return botTimeStr + "Awake";
                    } else {
                        let dur = moment.duration(roboTime - curTime);
                        return botTimeStr + dur.hours() + ":" + dur.minutes() + ":" + dur.seconds();
                    }
                })(Number(item.wake_time) * 1000, now),
                "config_id": item.config_id,
                "exp_level": item.exp_level,
                "vip": item.vip,
                "add_coin_times": item.add_coin_times,
                "change_time": item.change_time
            });
        }

        return (
            <div>
                <div className="row">
                    <span className="col-xs-3"><label>机器人总数：</label>{`${online} / ${this.props.list.length}`}</span>
                    <span className="col-xs-3"><label>总筹码：</label>{sumCoins.toLocaleString()}</span>
                    <span className="col-xs-3"><label>总赢取：</label>{(sumCoins - sumGMCoins - 18888 * this.props.list.length).toLocaleString()}</span>
                    <span className="col-xs-3"><label>牌桌数：</label>{uniqueTables.length - 1}</span>
                </div>
                <BootstrapTable data={tableData} striped={true}>
                    <TableHeaderColumn dataField="account_id" isKey={true} dataSort={true}>account_id</TableHeaderColumn>
                    <TableHeaderColumn dataField="table_id" dataSort={true}>table_id</TableHeaderColumn>
                    <TableHeaderColumn dataField="nick_name">nick_name</TableHeaderColumn>
                    <TableHeaderColumn dataField="coins" dataSort={true} dataFormat={this.numberFormatter} dataAlign="right">coins</TableHeaderColumn>
                    <TableHeaderColumn dataField="gm_add_coins" dataSort={true} dataFormat={this.numberFormatter} dataAlign="right">gm_add_coins</TableHeaderColumn>
                    <TableHeaderColumn dataField="won" dataSort={true} dataFormat={this.numberFormatter} dataAlign="right">won</TableHeaderColumn>
                    <TableHeaderColumn dataField="weight" dataSort={true}>weight</TableHeaderColumn>
                    <TableHeaderColumn dataField="robot_type" dataSort={true}>robot_type</TableHeaderColumn>
                    <TableHeaderColumn dataField="wake_time" dataSort={true}>wake_time</TableHeaderColumn>
                    <TableHeaderColumn dataField="config_id" dataSort={true}>config_id</TableHeaderColumn>
                    <TableHeaderColumn dataField="exp_level" dataSort={true}>exp_level</TableHeaderColumn>
                    <TableHeaderColumn dataField="vip" dataSort={true}>vip</TableHeaderColumn>
                    <TableHeaderColumn dataField="add_coin_times" dataSort={true}>add_coin_times</TableHeaderColumn>
                    <TableHeaderColumn dataField="change_time" dataSort={true}>change_time</TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }

}

class RobotStatus extends React.Component {

    constructor() {
        super();
        this.postData = this.postData.bind(this);
        this.lastRequest = null;
        this.state = {
            "flag": Flag.nothing
        }
    }

    postData(params) {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;

        xhr.open('POST', 'api/robotStatus.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
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
        xhr.send(encodeURI(`server=${params}`));
        this.setState({flag: Flag.waiting});
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }
    }

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (
                    <RobotTable list={this.state.result.robot_info} />
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

    render() {
        return (
            <div>
                <h1 className="page-header">选择一个服务器以查看</h1>
                <button className="btn" onClick={() => this.postData("beta")}>外网测试服</button>
                <button className="btn" onClick={() => this.postData("prod")}>中文正式服</button>
                <button className="btn" onClick={() => this.postData("proden")}>英文正式服</button>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default RobotStatus;
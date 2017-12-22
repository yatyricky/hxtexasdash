import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';
import RadioGroup from '../../components/RadioGroup.jsx';

const moment = require('moment');

class Session extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.applyChannelSelector = this.applyChannelSelector.bind(this);
        this.applyversionSelector = this.applyversionSelector.bind(this);
        this.updateTimeScale = this.updateTimeScale.bind(this);
        this.renderChartTable = this.renderChartTable.bind(this);
        this.lastRequest = null;

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(7, 'days');

        this.channelSelectorOptionsDom = [];
        this.channelSelectorOptionsDom.push(
            <option key={0} value={"all"}>全部渠道</option>
        );
        this.versionSelectorOptionsDom = [];
        this.versionSelectorOptionsDom.push(
            <option key={0} value={"all"}>全部版本</option>
        );

        this.state = {
            flag: Flag.nothing,
            inputDateValueStart: this.targetDateStart.format('YYYY-MM-DD'),
            inputDateValueEnd: this.targetDateEnd.format('YYYY-MM-DD'),
            channelSelector: "all",
            versionSelector: "all",
            timeScaleSelector: "day"
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
            hashHistory.push(`/auth${error.response.status == 403 ? '' : '?back=' + this.props.location.pathname}`);
        });

        this.setState({flag: Flag.waiting});
    }

    secondsToHMS(secs) {
        const h = Math.floor(secs / 3600.0);
        secs -= h * 3600.0;
        const m = Math.floor(secs / 60.0);
        secs -= m * 60.0;
        const s = secs.toFixed(2);
        return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }

    renderChartTable() {
        const {dataI, dataO, channels, versions} = this.state.result;
        const entries = [];

        let categories = [];
        let sessionData = [];
        let lengthData = [];

        // time loop starts
        let iI = 0;
        let iO = 0;
        let keyI = 0;
        let timeIndex = moment(this.state.inputDateValueStart).startOf('day');
        if (this.state.timeScaleSelector == "month") {
            timeIndex.startOf('month');
        }
        let timeBoundary = moment(this.state.inputDateValueEnd).startOf('day').add(1, 'day');
        while (timeIndex.isBefore(timeBoundary)) {
            let periodStartFormat = null;
            let periodStart = timeIndex.clone();
            // time shift
            switch (this.state.timeScaleSelector) {
                case "hour":
                    periodStartFormat = timeIndex.format('YYYY-MM-DD HH:mm');
                    timeIndex.add(1, 'hour');
                    break;
                case "day":
                    periodStartFormat = timeIndex.format('YYYY-MM-DD');
                    timeIndex.add(1, 'day');
                    break;
                case "week":
                    periodStartFormat = timeIndex.format('YYYY-MM-DD');
                    timeIndex.add(7, 'days');
                    break;
                case "month":
                    periodStartFormat = timeIndex.format('YYYY-MM');
                    timeIndex.add(1, 'month');
                    break;
                default:
                    break;
            }

            // real logic
            let currentSessions = [];
            let loginStacks = {};
            while (iI < dataI.length && moment(dataI[iI].timeStamp).isBefore(timeIndex)) {
                if ((dataI[iI].channel == this.state.channelSelector || this.state.channelSelector == "all")
                && (dataI[iI].version == this.state.versionSelector || this.state.versionSelector == "all")) {
                    if (loginStacks.hasOwnProperty(dataI[iI].userId) == false) {
                        loginStacks[dataI[iI].userId] = [];
                    }
                    loginStacks[dataI[iI].userId].push(dataI[iI].timeStamp);
                }
                iI += 1;
            }
            while (iO < dataO.length && moment(dataO[iO].timeStamp).isBefore(timeIndex)) {
                if ((dataO[iO].channel == this.state.channelSelector || this.state.channelSelector == "all")
                && (dataO[iO].version == this.state.versionSelector || this.state.versionSelector == "all")) {
                    const item = dataO[iO];
                    const time = moment(item.timeStamp);
                    let currentSession = 0;
                    let earliestLogin = null;
                    if (loginStacks.hasOwnProperty(item.userId)) {
                        earliestLogin = loginStacks[item.userId].shift();
                        if (earliestLogin !== undefined) {
                            currentSession = time - moment(earliestLogin);
                        } else {
                            currentSession = time - periodStart;
                        }
                        if (loginStacks[item.userId].length == 0) {
                            delete loginStacks[item.userId];
                        }
                    } else {
                        // only logout, no login
                        currentSession = time - periodStart;
                    }
                    if (currentSession < 0) {
                        currentSessions.push(time - periodStart);
                        currentSessions.push(timeIndex - moment(earliestLogin));
                    } else {
                        currentSessions.push(currentSession);
                    }
                }
                iO += 1;
            }

            const loginStacksKeys = Object.keys(loginStacks);
            for (let i = 0; i < loginStacksKeys.length; i ++) {
                const item = loginStacks[loginStacksKeys[i]];
                for (let j = 0; j < item.length; j ++) {
                    currentSessions.push(timeIndex - moment(item[j]));
                }
            }

            let sum = currentSessions.reduce((a, i) => a + i, 0) / 1000;
            let avg = currentSessions.length == 0 ? 0 : sum / currentSessions.length;
            // $avg = $num == 0 ? 0 : $sum / $num;

            // chart
            categories.push(periodStartFormat);
            sessionData.push(currentSessions.length);
            lengthData.push(avg);
            // table
            entries.unshift(
                <tr key={keyI++}>
                    <td className="font-small">{periodStartFormat}</td>
                    <td className="font-small">{currentSessions.length}</td>
                    <td className="font-small">{this.secondsToHMS(avg)}</td>
                    <td className="font-small">{this.secondsToHMS(sum)}</td>
                </tr>
            );
        }

        // setting chart config
        const highConfig = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: '启动次数与在线时长'
            },
            xAxis: [{
                categories: categories
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}s'
                },
                title: {
                    text: '在线时长'
                },
                opposite: true
        
            }, { // Secondary yAxis
                title: {
                    text: '启动次数'
                },
                labels: {
                    format: '{value}'
                }
            }],
            tooltip: {
                shared: true
            },
            series: [{
                name: '启动次数',
                type: 'column',
                yAxis: 1,
                data: sessionData
        
            }, {
                name: '平均时长',
                type: 'spline',
                data: lengthData,
                secFormatter: this.secondsToHMS,
                tooltip: {
                    pointFormatter: function() {
                        return '<span style="color:'+this.color+'">\u25CF</span> '+this.series.name+': <b>'+this.series.userOptions.secFormatter(this.y)+'</b><br/>';
                    }
                },
            }]
        };

        // update channel selector
        this.channelSelectorOptionsDom.splice(1);
        const channelsKeys = Object.keys(channels);
        for (let i = 0; i < channelsKeys.length; i ++) {
            this.channelSelectorOptionsDom.push(
                <option key={i+1} value={channelsKeys[i]}>{channels[channelsKeys[i]]}</option>
            );
        }
        // update version selector
        this.versionSelectorOptionsDom.splice(1);
        for (let i = 0; i < versions.length; i ++) {
            this.versionSelectorOptionsDom.push(
                <option key={i+1} value={versions[i]}>{versions[i]}</option>
            );
        }

        return (
            <div className="request-result">
                <ReactHighcharts config = {highConfig} />
                <div className="table-responsive">
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
                </div>
            </div>
        );
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

    applyChannelSelector() {
        this.setState({channelSelector: this.refs.channelSelector.value});
    }

    applyversionSelector() {
        this.setState({versionSelector: this.refs.versionSelector.value});
    }

    updateTimeScale(value) {
        this.setState({timeScaleSelector: value});
    }

    render() {
        let ret;
        const headerDom = (
            <div>
                <h1 className="page-header">启动次数</h1>
                <div className="form-row align-items-center">
                    <div className="col-auto">
                        <label htmlFor="inputDateStart">选择起始日期：</label>
                        <input
                            type="date"
                            ref="inputDateStart"
                            id="inputDateStart"
                            value={this.state.inputDateValueStart}
                            className="form-control mb-2 mb-sm-0"
                            onChange={this.validateInput}
                        />
                    </div>
                    <div className="col-auto">
                        <label htmlFor="inputDateEnd">选择结束日期：</label>
                        <input
                            type="date"
                            ref="inputDateEnd"
                            id="inputDateEnd"
                            value={this.state.inputDateValueEnd}
                            className="form-control mb-2 mb-sm-0"
                            onChange={this.validateInput}
                        />
                    </div>
                    <div className="col-auto">
                        <label htmlFor="channelSelector">选择渠道：</label>
                        <select
                            className="form-control mb-2 mb-sm-0"
                            id="channelSelector"
                            ref="channelSelector"
                            value={this.state.channelSelector}
                            onChange={this.applyChannelSelector}
                        >
                            {this.channelSelectorOptionsDom}
                        </select>
                    </div>
                    <div className="col-auto">
                        <label htmlFor="versionSelector">选择版本：</label>
                        <select
                            className="form-control mb-2 mb-sm-0"
                            id="versionSelector"
                            ref="versionSelector"
                            value={this.state.versionSelector}
                            onChange={this.applyversionSelector}
                        >
                            {this.versionSelectorOptionsDom}
                        </select>
                    </div>
                    <div className="col-auto">
                        <label htmlFor="versionSelector">时间颗粒度：</label>
                        <RadioGroup
                            rgClass="form-control mb-2 mb-sm-0"
                            rlClass="nomargin-label channel-item"
                            rrClass="hx-radios"
                            rsClass="badge badge-primary channel-label"
                            rrName="timeScale"
                            rgValues={[["hour", "时"], ["day", "日"], ["week", "周"], ["month", "月"]]}
                            rgDefault={this.state.timeScaleSelector}
                            rgHandler={this.updateTimeScale}
                        />
                    </div>
                </div>
            </div>
        );
        switch (this.state.flag) {
            case Flag.success:
                ret = (
                    <div>
                        {headerDom}
                        {this.renderChartTable()}
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

}

export default Session;
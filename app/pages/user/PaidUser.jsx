import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';
import RadioGroup from '../../components/RadioGroup.jsx';

const moment = require('moment');

class PaidUser extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.applyChannelSelector = this.applyChannelSelector.bind(this);
        this.updateTimeScale = this.updateTimeScale.bind(this);
        this.renderChartTable = this.renderChartTable.bind(this);
        this.lastRequest = null;

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(7, 'days');

        this.channelSelectorOptionsDom = [];
        this.channelSelectorOptionsDom.push(
            <option key={0} value={"all"}>全部渠道</option>
        );

        this.state = {
            flag: Flag.nothing,
            inputDateValueStart: this.targetDateStart.format('YYYY-MM-DD'),
            inputDateValueEnd: this.targetDateEnd.format('YYYY-MM-DD'),
            channelSelector: "all",
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
            url: 'api/ops/paidUser.php',
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

    renderChartTable() {
        const {dataP, dataN, dataA, channels} = this.state.result;
        const hcCategories = [];
        const hcData = [];
        const entries = [];

        // time loop start
        let i = 0, iA = 0, iN = 0;
        let keyI = 0;
        let timeIndex = moment(this.state.inputDateValueStart).startOf('day');
        if (this.state.timeScaleSelector == "month") {
            timeIndex.startOf('month');
        }
        let timeBoundary = moment(this.state.inputDateValueEnd).startOf('day').add(1, 'day');
        while (timeIndex.isBefore(timeBoundary)) {
            let periodStartFormat = null;
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
            
            const devices = [];
            const aDevices = [];
            const nDevices = [];
            let newPayDevices = 0;
            let aus = 0;
            let sum = 0;
            while (iN < dataN.length && moment(dataN[iN].timeStamp).isBefore(timeIndex)) {
                if (dataN[iN].channel == this.state.channelSelector || this.state.channelSelector == "all") {
                    if (nDevices.indexOf(dataN[iN].deviceId) == -1) {
                        nDevices.push(dataN[iN].deviceId);
                    }
                }
                iN ++;
            }
            while (i < dataP.length && moment(dataP[i].timeStamp).isBefore(timeIndex)) {
                if (dataP[i].channel == this.state.channelSelector || this.state.channelSelector == "all") {
                    sum += parseFloat(dataP[i].amount);
                    if (devices.indexOf(dataP[i].deviceId) == -1) {
                        devices.push(dataP[i].deviceId);
                        if (nDevices.indexOf(dataP[i].deviceId) != -1) {
                            newPayDevices ++;
                        }
                    }
                }
                i += 1;
            }
            while (iA < dataA.length && moment(dataA[iA].timeStamp).isBefore(timeIndex)) {
                if (dataA[iA].channel == this.state.channelSelector || this.state.channelSelector == "all") {
                    if (aDevices.indexOf(dataA[iA].deviceId) == -1) {
                        aDevices.push(dataA[iA].deviceId);
                    }
                }
                iA ++;
            }
            // chart
            hcCategories.push(periodStartFormat);
            hcData.push(sum / 100.0);
            let cvr = 0;
            if (aDevices.length > 0) {
                cvr = devices.length / aDevices.length * 100.0;
            }
            let ncvr = 0;
            if (nDevices.length > 0) {
                ncvr = newPayDevices / nDevices.length * 100.0;
            }
            let arpu = 0;
            if (aDevices.length > 0) {
                arpu = sum / aDevices.length / 100.0;
            }
            let arppu = 0;
            if (devices.length > 0) {
                arppu = sum / devices.length / 100.0;
            }
            // table
            entries.unshift(
                <tr key={keyI++}>
                    <td className="font-small">{periodStartFormat}</td>
                    <td className="font-small">{(sum / 100.0).toFixed(2)}</td>
                    <td className="font-small">{devices.length}</td>
                    <td className="font-small">{cvr.toFixed(2)}%</td>
                    <td className="font-small">{newPayDevices}</td>
                    <td className="font-small">{ncvr.toFixed(2)}%</td>
                    <td className="font-small">{arpu.toFixed(2)}</td>
                    <td className="font-small">{arppu.toFixed(2)}</td>
                </tr>
            );
        }

        // update channel selector
        this.channelSelectorOptionsDom.splice(1);
        const channelsKeys = Object.keys(channels);
        for (let i = 0; i < channelsKeys.length; i ++) {
            this.channelSelectorOptionsDom.push(
                <option key={i+1} value={channelsKeys[i]}>{channels[channelsKeys[i]]}</option>
            );
        }
        const highConfig = {
            "chart": {
                "zoomType": 'x'
            },
            "title": {
                "text": "付费用户"
            },
            "xAxis": {
                "categories": hcCategories
            },
            "yAxis": {
                "title": {
                    "text": "数值"
                }
            },
            "series": [
                {
                    "name": "付费金额",
                    "data": hcData
                }
            ]

        };
        return (
            <div className="request-result">
                <ReactHighcharts config = {highConfig} />
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="font-small">时间段</th>
                                <th className="font-small">付费金额</th>
                                <th className="font-small">付费设备</th>
                                <th className="font-small">付费率</th>
                                <th className="font-small">新付费设备</th>
                                <th className="font-small">新付费率</th>
                                <th className="font-small">ARPU</th>
                                <th className="font-small">ARPPU</th>
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

    updateTimeScale(value) {
        this.setState({timeScaleSelector: value});
    }

    render() {
        let ret;
        const headerDom = (
            <div>
                <h1 className="page-header">付费用户</h1>
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
                        <label>时间颗粒度：</label>
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

export default PaidUser;
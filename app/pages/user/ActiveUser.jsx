import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';
import RadioGroup from '../../components/RadioGroup.jsx';

const moment = require('moment');

class ActiveUser extends React.Component {

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
            url: 'api/ops/activeUser.php',
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
        const {data, channels, versions} = this.state.result;
        const hcCategories = [];
        const hcData = [];
        const entries = [];

        let i = 0;
        let keyI = 0;
        let timeIndex = moment(this.state.inputDateValueStart).startOf('day');
        if (this.state.timeScaleSelector == "month") {
            timeIndex.startOf('month');
        }
        let timeBoundary = moment(this.state.inputDateValueEnd).startOf('day').add(1, 'day');
        while (timeIndex.isBefore(timeBoundary)) {
            let periodStartFormat = null;
            switch (this.state.timeScaleSelector) {
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
            while (i < data.length && moment(data[i].timeStamp).isBefore(timeIndex)) {
                if ((data[i].channel == this.state.channelSelector || this.state.channelSelector == "all")
                && (data[i].version == this.state.versionSelector || this.state.versionSelector == "all")) {
                    if (devices.indexOf(data[i].deviceId) == -1) {
                        devices.push(data[i].deviceId);
                    }
                }
                i += 1;
            }
            // chart
            hcCategories.push(periodStartFormat);
            hcData.push(devices.length);
            // table
            entries.unshift(
                <tr key={keyI++}>
                    <td className="font-small">{periodStartFormat}</td>
                    <td className="font-small">{devices.length}</td>
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
        // update version selector
        this.versionSelectorOptionsDom.splice(1);
        for (let i = 0; i < versions.length; i ++) {
            this.versionSelectorOptionsDom.push(
                <option key={i+1} value={versions[i]}>{versions[i]}</option>
            );
        }
        const highConfig = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: "活跃设备"
            },
            xAxis: {
                categories: hcCategories
            },
            yAxis: {
                title: {
                    text: "活跃设备"
                }
            },
            series: [
                {
                    name: "活跃设备",
                    type: "spline",
                    data: hcData
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
                                <th className="font-small">日期</th>
                                <th className="font-small">活跃设备</th>
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
                <h1 className="page-header">活跃用户</h1>
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
                        <label htmlFor="versionSelector">活跃区间：</label>
                        <RadioGroup
                            rgClass="form-control mb-2 mb-sm-0"
                            rlClass="nomargin-label channel-item"
                            rrClass="hx-radios"
                            rsClass="badge badge-primary channel-label"
                            rrName="timeScale"
                            rgValues={[["day", "日活"], ["week", "周活"], ["month", "月活"]]}
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

export default ActiveUser;
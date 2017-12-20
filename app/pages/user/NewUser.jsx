import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';
import RadioGroup from '../../components/RadioGroup.jsx';

const moment = require('moment');

class NewUser extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.validateInput = this.validateInput.bind(this);
        this.postData = this.postData.bind(this);
        this.applyChannelSelector = this.applyChannelSelector.bind(this);
        this.applyversionSelector = this.applyversionSelector.bind(this);
        this.updateTimeScale = this.updateTimeScale.bind(this);
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
        };
    }

    postData(dateStart, dateEnd) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/newUser.php',
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
        // Get channels, versions, device ids
        const {data, channels, versions} = this.state.result;
        const entries = [];
        const config = {categories: [], data: []}; // highcharts config
        let dnid = {
            name: "新账号",
            data: []
        };
        let dndid = {
            name: "新设备",
            data: []
        };
        switch (this.state.timeScaleSelector) {
            case "day":
                for (let i = 0, n = data.length; i < n; i++) {

                    config.categories.push(data[i].date);
                    const allUsers = data[i].data;
                    const userIds = Object.keys(allUsers);
                    // apply filter
                    // find device ids
                    const devices = [];
                    let account = 0;
                    for (let j = 0, m = userIds.length; j < m; j++) {
                        const item = allUsers[userIds[j]];
                        if ((item.channel == this.state.channelSelector || this.state.channelSelector == "all")
                            && (item.version == this.state.versionSelector || this.state.versionSelector == "all")) {
                            if (Flag.logUseIsNewDevice == true) {
                                if (item.newDevice == 1) {
                                    devices.push(item.deviceId);
                                }
                            } else {
                                if (devices.indexOf(item.deviceId) == -1) {
                                    devices.push(item.deviceId);
                                }
                            }
                            account += 1;
                        }
                    }

                    // chart
                    dnid.data.push(account);
                    dndid.data.push(devices.length);
                    // table
                    entries.unshift(
                        <tr key={i}>
                            <td className="font-small">{data[i].date}</td>
                            <td className="font-small">{account}</td>
                            <td className="font-small">{devices.length}</td>
                        </tr>
                    );
                }
                break;
            case "hour":
                let trkey = 0;
                for (let i = 0, n = data.length; i < n; i++) {
                    const sortable = [];
                    const allUsers = data[i].data;
                    const userIds = Object.keys(allUsers);
                    for (let j = 0, m = userIds.length; j < m; j++) {
                        sortable.push([userIds[j], allUsers[userIds[j]]]);
                    }
                    sortable.sort(function(a, b) {
                        return moment(a[1].timeStamp) - moment(b[1].timeStamp);
                    });

                    let timeStart = moment(data[i].date.substring(0, 10));
                    let endOfDay = moment(timeStart).add(24, 'hours');
                    let uidIndex = 0;
                    const countDevices = [];
                    do {
                        timeStart.add(1, 'hour');
                        config.categories.push(timeStart.format("YYYY-MM-DD HH:mm:ss"));
                        // apply filter
                        // find device ids
                        const devices = [];
                        let account = 0;

                        while (uidIndex < sortable.length && moment(sortable[uidIndex][1].timeStamp) < timeStart) {
                            const item = sortable[uidIndex][1];
                            if ((item.channel == this.state.channelSelector || this.state.channelSelector == "all")
                                && (item.version == this.state.versionSelector || this.state.versionSelector == "all")) {
                                if (Flag.logUseIsNewDevice == true) {
                                    if (item.newDevice == 1) {
                                        devices.push(item.deviceId);
                                    }
                                } else {
                                    if (countDevices.indexOf(item.deviceId) == -1) {
                                        devices.push(item.deviceId);
                                        countDevices.push(item.deviceId);
                                    }
                                }
                                account += 1;
                            }
                            uidIndex ++;
                        }

                        // chart
                        dnid.data.push(account);
                        dndid.data.push(devices.length);
                        // table
                        entries.unshift(
                            <tr key={trkey++}>
                                <td className="font-small">{timeStart.format("YYYY-MM-DD HH:mm:ss")}</td>
                                <td className="font-small">{account}</td>
                                <td className="font-small">{devices.length}</td>
                            </tr>
                        );

                    } while (timeStart < endOfDay);
                }
                break;
            case "week":
                let devices = [];
                let account = 0;
                let i = 0;
                for (i = 0; i < data.length; i++) {
                    if (i % 7 == 0) {
                        config.categories.push(data[i].date);
                        devices = [];
                        account = 0;
                    }
                    const allUsers = data[i].data;
                    const userIds = Object.keys(allUsers);
                    // apply filter
                    // find device ids
                    for (let j = 0, m = userIds.length; j < m; j++) {
                        const item = allUsers[userIds[j]];
                        if ((item.channel == this.state.channelSelector || this.state.channelSelector == "all")
                            && (item.version == this.state.versionSelector || this.state.versionSelector == "all")) {
                            if (Flag.logUseIsNewDevice == true) {
                                if (item.newDevice == 1) {
                                    devices.push(item.deviceId);
                                }
                            } else {
                                if (devices.indexOf(item.deviceId) == -1) {
                                    devices.push(item.deviceId);
                                }
                            }
                            account += 1;
                        }
                    }

                    if ((i + 1) % 7 == 0) {

                        // chart
                        dnid.data.push(account);
                        dndid.data.push(devices.length);
                        // table
                        entries.unshift(
                            <tr key={i}>
                                <td className="font-small">{data[i - 6].date}</td>
                                <td className="font-small">{account}</td>
                                <td className="font-small">{devices.length}</td>
                            </tr>
                        );
                    }
                }

                if (i % 7 != 0) {
                    i -= 1;
                    const lastPeriodI = Math.floor(i / 7.0) * 7;

                    // chart
                    dnid.data.push(account);
                    dndid.data.push(devices.length);
                    // table
                    entries.unshift(
                        <tr key={i}>
                            <td className="font-small">{data[lastPeriodI].date}</td>
                            <td className="font-small">{account}</td>
                            <td className="font-small">{devices.length}</td>
                        </tr>
                    );
                }
                break;
            case "month":
                for (let i = 0, n = data.length; i < n; i++) {

                    config.categories.push(data[i].date);
                    const allUsers = data[i].data;
                    const userIds = Object.keys(allUsers);
                    // apply filter
                    // find device ids
                    const devices = [];
                    let account = 0;
                    for (let j = 0, m = userIds.length; j < m; j++) {
                        const item = allUsers[userIds[j]];
                        if ((item.channel == this.state.channelSelector || this.state.channelSelector == "all")
                            && (item.version == this.state.versionSelector || this.state.versionSelector == "all")) {
                            if (devices.indexOf(item.deviceId) == -1) {
                                devices.push(item.deviceId);
                            }
                            account += 1;
                        }
                    }

                    // chart
                    dnid.data.push(account);
                    dndid.data.push(devices.length);
                    // table
                    entries.unshift(
                        <tr key={i}>
                            <td className="font-small">{data[i].date}</td>
                            <td className="font-small">{account}</td>
                            <td className="font-small">{devices.length}</td>
                        </tr>
                    );
                }
                break;
            default:
                break;
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

        config.data.push(dnid);
        config.data.push(dndid);
        
        const highConfig = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: "新用户"
            },
            xAxis: {
                categories: config.categories
            },
            tooltip: {
                shared: true
            },
            yAxis: {
                title: {
                    text: "新账号"
                }
            },
            series: config.data

        };

        return (
            <div className="request-result">
                <ReactHighcharts config = {highConfig} />
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="font-small">日期</th>
                                <th className="font-small">激活账号</th>
                                <th className="font-small">激活设备</th>
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
                <h1 className="page-header">新增用户</h1>
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

export default NewUser;
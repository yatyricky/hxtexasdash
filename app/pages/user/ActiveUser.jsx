import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class ActiveUser extends React.Component {

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
        const result = this.state.result.data;
        const entries = [];
        const config = {categories: [], data: []}; // highcharts config
        let rr1 = {
            "name": "活跃用户",
            "data": []
        };

        for (let i = 0, n = result.length; i < n; i++) {
            config.categories.push(result[i].date);
            rr1.data.push(parseFloat(result[i].dau));

            entries.unshift(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].dau}</td>
                </tr>
            );
        }
        config.data.push(rr1);

        const highConfig = {
            "chart": {
                "zoomType": 'x'
            },
            "title": {
                "text": "活跃用户"
            },
            "xAxis": {
                "categories": config.categories
            },
            "yAxis": {
                "title": {
                    "text": "活跃用户"
                }
            },
            "series": config.data

        };

        return (
            <div className="request-result">
                <ReactHighcharts config = {highConfig} />
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="font-small">日期</th>
                                <th className="font-small">活跃用户</th>
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
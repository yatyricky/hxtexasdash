import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class PlayerRetention extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.postData = this.postData.bind(this);
        this.validateInput = this.validateInput.bind(this);

        this.lastRequest = null;

        this.config = {categories: [], data: []}; // highcharts config

        this.targetDateEnd = moment(new Date()).subtract(1, 'days');
        this.targetDateStart = moment(new Date()).subtract(37, 'days');
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
            url: 'api/ops/playerRetention.php',
            method: 'post',
            data: encodeURI(`start=${dateStart}&end=${dateEnd}`),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + this.dataStore.getJWT()
            },
            cancelToken: source.token
        }

        const axiosRequest = axios(axiosConfig).then((response) => {
            this.config = {categories: [], data: []};
            this.setState({
                flag: Flag.success,
                result: response.data.data
            });
        }).catch((error) => {
            this.setState({
                flag: Flag.failed,
                result: error.response
            });
            hashHistory.push(`/auth?back=${this.props.location.pathname}`);
        });;

        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const entries = [];
        const result = this.state.result.reverse();

        for (let i = 0, n = result.length; i < n; i++) {
            let cols = [];
            for (let j = 0; j < result[i].retentions.length; j++) {
                let green = (result[i].retentions[j] - 0.05) / 0.45;
                if (green < 0) {
                    green = 0;
                } else if (green > 1) {
                    green = 1;
                }
                const style = {
                    "backgroundColor": `rgba(0,255,0,${green})`
                }
                cols.push(
                    <td key={j} className="text-right font-small" style={style}>{result[i].retentions[j] == 0.0 ? "-" : (result[i].retentions[j] * 100).toFixed(2)}</td>
                );
            }
            entries.push(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].dnu}</td>
                    {cols}
                </tr>
            );
        }

        let heads = [];
        for (let i = 1; i <= 30; i++) {
            heads.push(<th key={i} className="text-right font-small">+{i}</th>);
        }
        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="font-small">日期</th>
                        <th className="font-small">激活</th>
                        {heads}
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
                let rr1 = {
                    "name": "+1",
                    "data": []
                };
                let rr2 = {
                    "name": "+2",
                    "data": []
                };
                let rr7 = {
                    "name": "+7",
                    "data": []
                };
                for (let i = 0, n = this.state.result.length; i < n; i++) {
                    this.config.categories.push(this.state.result[i].date);
                    rr1.data.push(parseFloat(this.state.result[i].retentions[0])*100);
                    rr2.data.push(parseFloat(this.state.result[i].retentions[1])*100);
                    rr7.data.push(parseFloat(this.state.result[i].retentions[6])*100);
                }
                this.config.data.push(rr1);
                this.config.data.push(rr2);
                this.config.data.push(rr7);

                const highConfig = {
                    "title": {
                        "text": "留存率"
                    },
                    "xAxis": {
                        "categories": this.config.categories
                    },
                    "yAxis": {
                        "title": {
                            "text": "留存率"
                        }
                    },
                    "series": this.config.data

                };
                ret = (
                    <div>
                        {inputFields}
                        <ReactHighcharts config = {highConfig} />
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
            case Flag.nothing:
                ret = (<Link to="/auth">输入神秘代码</Link>);
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
        return (
            <div>
                <h1 className="page-header">留存率</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default PlayerRetention;
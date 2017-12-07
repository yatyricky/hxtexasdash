import React from 'react';
import { Link, hashHistory } from "react-router";
import ReactHighcharts from 'react-highcharts';
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

const moment = require('moment');

class TotalChips extends React.Component {

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
            url: 'api/ops/totalChips.php',
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

        let categories = [];
        let sumData = [];
        let dmdData = [];
        let gmData = [];
        let buyItemData = [];
        let rakeData = [];

        console.log(result);
        

        for (let i = 0, n = result.length; i < n; i++) {
            categories.push(result[i].date);
            sumData.push(parseFloat(result[i].sum));
            dmdData.push(parseFloat(result[i].dmd));
            gmData.push(parseFloat(result[i].gm));
            buyItemData.push(parseFloat(result[i].buyItem));
            rakeData.push(parseFloat(result[i].rake));

            entries.unshift(
                <tr key={i}>
                    <td className="font-small">{result[i].date}</td>
                    <td className="font-small">{result[i].sum}</td>
                    <td className="font-small">{result[i].dmd}</td>
                    <td className="font-small">{result[i].gm}</td>
                    <td className="font-small">{result[i].buyItem}</td>
                    <td className="font-small">{result[i].rake}</td>
                </tr>
            );
        }

        const highConfig = {
            "chart": {
                "zoomType": 'x'
            },
            title: {
                text: '库存变化'
            },
            xAxis: {
                categories: categories
            },
            yAxis: [{
                min: 0,
                title: {
                    text: '日变化量'
                }
            },{
                min: 0,
                title: {
                    text: '库存总量'
                },
                opposite: true
            }],
            tooltip: {
                formatter: function () {
                    let sumField = "";
                    if (this.series.options.stackName != "NO_VALUE") {
                        sumField = this.series.options.stackName + '合计: ' + (this.point.stackTotal === undefined ? 0 : this.point.stackTotal);
                    }
                    return '<b>' + this.x + '</b><br/>' // Category name
                        + '<span style="color:' + this.series.color + '">\u25CF</span>' // dot
                        + this.series.name + ': ' + this.y + '<br/>' + sumField; // series and value and total
                }
            },
        
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
        
            series: [{
                name: '钻石兑换',
                type: 'column',
                data: dmdData,
                stack: 'production',
                stackName: "产出"
            }, {
                name: 'GM变更',
                type: 'column',
                data: gmData,
                stack: 'production',
                stackName: "产出"
            }, {
                name: '购买道具',
                type: 'column',
                data: buyItemData,
                stack: 'consumption',
                stackName: "消耗"
            }, {
                name: '抽水',
                type: 'column',
                data: rakeData,
                stack: 'consumption',
                stackName: "消耗"
            },{
                name: '总筹码',
                type: 'spline',
                data: sumData,
                yAxis: 1,
                stackName: "NO_VALUE"
            },]
        };

        return (
            <div className="request-result">
                <ReactHighcharts config = {highConfig} />
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className="font-small">日期</th>
                                <th className="font-small">总筹码</th>
                                <th className="font-small">钻石兑换</th>
                                <th className="font-small">GM变更</th>
                                <th className="font-small">购买道具</th>
                                <th className="font-small">抽水</th>
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
                <h1 className="page-header">库存变化</h1>
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

export default TotalChips;
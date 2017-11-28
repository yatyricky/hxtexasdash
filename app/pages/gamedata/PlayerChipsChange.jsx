import React from 'react';
import {Flag} from '../../Flag.js';

const moment = require('moment');

class PlayerChipsChange extends React.Component {

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

        let request = `api/playerChipsChange.php?start=${dateStart}&end=${dateEnd}`;

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
        let sumGrossWin = 0;
        let sumLost = 0;
        let sumRobotProd = 0;
        let sumDiamonds = 0;
        let sumOtherProd = 0;
        let sumRake = 0;
        let sumOtherRecycle = 0;
        let sumBalance = 0;

        const entries = this.state.result.arr.map((item, i) => {
            const robotProd = item.grossWin + item.lost - item.rake;
            const balance = robotProd + item.diamonds + item.otherProd + item.otherRecycle;

            sumGrossWin += item.grossWin;
            sumLost += item.lost;
            sumRobotProd += robotProd;
            sumDiamonds += item.diamonds;
            sumOtherProd += item.otherProd;
            sumRake += item.rake;
            sumOtherRecycle += item.otherRecycle;
            sumBalance += balance;
            return (
                <tr key={i}>
                    <td>{item.date}</td>
                    <td className="text-right">{Number(item.store).toLocaleString()}</td>
                    <td className="text-right">{Number(item.grossWin).toLocaleString()}</td>
                    <td className="text-right">{Number(item.lost).toLocaleString()}</td>
                    <td className="text-right">{Number(robotProd).toLocaleString()}</td>
                    <td className="text-right">{Number(item.diamonds).toLocaleString()}</td>
                    <td className="text-right">{Number(item.otherProd).toLocaleString()}</td>
                    <td className="text-right">{Number(item.rake).toLocaleString()}</td>
                    <td className="text-right">{Number(item.otherRecycle).toLocaleString()}</td>
                    <td className="text-right">{Number(balance).toLocaleString()}</td>
                    <td className="text-right">{Math.floor(item.avgStore).toLocaleString()}</td>
                </tr>
            );
        });
        entries.push(
            <tr key={999}>
                <td><strong>合计</strong></td>
                <td className="text-right"><strong>{Number(this.state.result.sum).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumGrossWin).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumLost).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumRobotProd).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumDiamonds).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumOtherProd).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumRake).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumOtherRecycle).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Number(sumBalance).toLocaleString()}</strong></td>
                <td className="text-right"><strong>{Math.floor(this.state.result.avgSum).toLocaleString()}</strong></td>
            </tr>
        );

        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th className="text-right">筹码总量</th>
                        <th className="text-right">毛盈利</th>
                        <th className="text-right">输给机器人</th>
                        <th className="text-right">机器人产出</th>
                        <th className="text-right">钻石兑换</th>
                        <th className="text-right">其他产出</th>
                        <th className="text-right">抽水</th>
                        <th className="text-right">其他消耗</th>
                        <th className="text-right">平衡</th>
                        <th className="text-right">人均持币</th>
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
                <h1 className="page-header">玩家筹码变动</h1>
                <span>选择起始日期：</span>
                <input type="date" ref="inputDateStart" value={this.state.inputDateValueStart} className="input-sm" onChange={this.validateInput} />
                <span>选择结束日期：</span>
                <input type="date" ref="inputDateEnd" value={this.state.inputDateValueEnd} className="input-sm" onChange={this.validateInput} />
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default PlayerChipsChange;
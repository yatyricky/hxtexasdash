import React from 'react';

const Flag = {
    "nothing": 100,
    "waiting": 101,
    "success": 200,
    "failed": 300
}

class RobotPerformance extends React.Component {

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

        let request = `api/robotPerformance.php?start=${this.refs.inputDateStart.value.replace(/-/g, "")}&end=${this.refs.inputDateEnd.value.replace(/-/g, "")}`;

        xhr.open('GET', request);
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                this.setState({
                    flag: Flag.success,
                    result: xhr.responseText
                });
            } else {
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
        const obj = JSON.parse(this.state.result);

        const botConfig = {
            "bb": [10, 20, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000],
            "num": [100, 100, 100, 100, 100, 90, 90, 90, 90, 90, 60, 60, 30, 25, 20, 15]
        };

        let headerNums = [];
        for (var i = 1; i <= 16; i++) {
            headerNums.push(i);
        }
        const headerNumbers = headerNums.map((item, idx) => (
            <th key={idx} className="text-right">{item}</th>
        ));

        if (Object.keys(obj).length > 0) {
            const entries = Object.keys(obj).map((k, index) => {
                let arr = [];
                for (var i = 1; i <= 16; i++) {
                    arr.push(i);
                }
                const botsNumbers = arr.map((item, idx) => {
                    const num = obj[k][item].playedBots;
                    const greenColor = num/botConfig.num[item-1];
                    const style = {
                        "backgroundColor": `rgba(0,255,0,${greenColor})`
                    }
                    return (
                        <td key={idx} style={style} className="text-right">{num}</td>
                    );
                });
                return (
                    <tr key={index}>
                        <td className="text-right">{k}</td>
                        {botsNumbers}
                    </tr>
                );
            });

            const averageHands = Object.keys(obj).map((k, index) => {
                let arr = [];
                for (var i = 1; i <= 16; i++) {
                    arr.push(i);
                }
                const botsNumbers = arr.map((item, idx) => {
                    let num = 0;
                    if (obj[k][item].playedBots > 0) {
                        num = obj[k][item].playedHands / obj[k][item].playedBots;
                    }

                    return (
                        <td key={idx} className="text-right">{Math.round(num)}</td>
                    );
                });
                return (
                    <tr key={index}>
                        <td className="text-right">{k}</td>
                        {botsNumbers}
                    </tr>
                );
            });

            const handsBB = Object.keys(obj).map((k, index) => {
                let arr = [];
                for (var i = 1; i <= 16; i++) {
                    arr.push(i);
                }
                const botsNumbers = arr.map((item, idx) => {
                    let num = 0;
                    if (obj[k][item].playedHands > 0) {
                        num = obj[k][item].balance / obj[k][item].playedHands / botConfig.bb[item-1];
                    }
                    let style = {};
                    if (num > 0) {
                        const greenColor = num/10.0;
                        style = {
                            "backgroundColor": `rgba(0,255,0,${greenColor})`
                        }
                    } else {
                        const red = num/-10.0;
                        style = {
                            "backgroundColor": `rgba(255,0,0,${red})`
                        }
                    }
                    return (
                        <td key={idx} style={style} className="text-right">{num.toFixed(1)}</td>
                    );
                });
                return (
                    <tr key={index}>
                        <td className="text-right">{k}</td>
                        {botsNumbers}
                    </tr>
                );
            });
            return (
                <div>
                    <h3>机器人出勤数量</h3>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    {headerNumbers}
                                </tr>
                            </thead>
                            <tbody>
                                {entries}
                            </tbody>
                        </table>
                    </div>
                    <h3>机器人人均牌局数</h3>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    {headerNumbers}
                                </tr>
                            </thead>
                            <tbody>
                                {averageHands}
                            </tbody>
                        </table>
                    </div>
                    <h3>机器人手均盈亏BB数</h3>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    {headerNumbers}
                                </tr>
                            </thead>
                            <tbody>
                                {handsBB}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            return (<div>请重新选择日期</div>);
        }
    }

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (
                    <div>{this.renderTable()}</div>
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
                <h1 className="page-header">机器人每日牌局表现</h1>
                <span>选择起始日期：</span>
                <input type="date" ref="inputDateStart" className="input-sm" onChange={this.validateInput} />
                <span>选择结束日期：</span>
                <input type="date" ref="inputDateEnd" className="input-sm" onChange={this.validateInput} />
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default RobotPerformance;
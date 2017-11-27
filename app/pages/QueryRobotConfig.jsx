import React from 'react';
import {Flag} from '../Flag.js'

class QueryRobotConfig extends React.Component {

    constructor() {
        super();
        this.postData = this.postData.bind(this);
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

        xhr.open('POST', 'api/queryRobotConfig.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xhr.onload = () => {
            this.lastRequest = null;
            if (xhr.status === 200) {
                this.setState({
                    flag: Flag.success,
                    result: xhr.responseText
                });
            } else if (xhr.status !== 200) {
                this.setState({
                    flag: Flag.failed,
                    result: xhr.status
                });
            }
        };
        xhr.send(encodeURI(""));
        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        let obj = null;
        try {
            obj = JSON.parse(this.state.result);

            const entries = obj.map((item, index) => 
                {
                    const tokens = item.map((token, idx) => (
                        <td className="text-right" key={idx}>{Number(token).toLocaleString()}</td>
                    ));
                    return (
                        <tr key={index}>
                            {tokens}
                        </tr>
                    );
                }
            );
            return (
                <div>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">类型</th>
                                    <th className="text-right">初等下</th>
                                    <th className="text-right">初等上</th>
                                    <th className="text-right">初筹下</th>
                                    <th className="text-right">初筹上</th>
                                    <th className="text-right">进携下</th>
                                    <th className="text-right">进携上</th>
                                    <th className="text-right">场类型</th>
                                    <th className="text-right">目标筹</th>
                                    <th className="text-right">级上限</th>
                                    <th className="text-right">补给次</th>
                                    <th className="text-right">CD下</th>
                                    <th className="text-right">CD上</th>
                                    <th className="text-right">权重下</th>
                                    <th className="text-right">权重上</th>
                                    <th className="text-right">局数下</th>
                                    <th className="text-right">局数上</th>
                                    <th className="text-right">肉鸡</th>
                                    <th className="text-right">VIP下</th>
                                    <th className="text-right">VIP上</th>
                                    <th className="text-right">VIP比</th>
                                    <th className="text-right">数量</th>
                                    <th className="text-right">BB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } catch(e) {
            return (<div>Error!</div>);
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

    componentDidMount() {
        this.postData();
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }
    }

    render() {
        return (
            <div>
                <h1 className="page-header">当前机器人配置</h1>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default QueryRobotConfig;

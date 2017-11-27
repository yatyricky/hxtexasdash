import React from 'react';

const Flag = {
    "nothing": 100,
    "waiting": 101,
    "success": 200,
    "failed": 300
}

class CurrentOnline extends React.Component {

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

        xhr.open('POST', 'api/currentOnline.php');
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

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (
                    <div>当前在线玩家：{this.state.result}</div>
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
                <h1 className="page-header">当前在线玩家</h1>
                <button className="btn" onClick={this.postData}>刷新</button>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default CurrentOnline;

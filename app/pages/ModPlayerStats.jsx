import React from 'react';
import {Flag} from '../Flag.js';

class ModPlayerStats extends React.Component {

    constructor() {
        super();
        this.postData = this.postData.bind(this);
        this.lastRequest = null;
        this.state = {
            "flag": Flag.nothing
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    postData(params) {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }

        const xhr = new XMLHttpRequest();
        this.lastRequest = xhr;

        xhr.open('POST', 'api/modPlayerStats.php');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
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
        xhr.send(encodeURI(`server=${params.serverRadios}&accountId=${params.accountId}&diamonds=${params.diamonds}&chips=${params.chips}&vip=${params.vipRadios}`));
        this.setState({flag: Flag.waiting});
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target.elements;
        this.postData({
            serverRadios: form.serverRadios.value,
            accountId: form.accountId.value,
            diamonds: form.diamonds.value,
            chips: form.chips.value,
            vipRadios: form.vipRadios.value
        });
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.abort();
        }
    }

    renderResult(flag) {
        let ret;
        switch (flag) {
            case Flag.success:
                ret = (
                    <div>
                        <label>操作结果：</label>
                        {this.state.result.resp}
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

    render() {
        return (
            <div>
                <h1 className="page-header">修改玩家属性</h1>
                <div className="row">
                    <form className="form-horizontal col-md-6" onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label className="control-label col-xs-3">服务器：</label>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="serverRadios" value="alpha" defaultChecked="checked" /> 内网测试服
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="serverRadios" value="beta" />外网测试服
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="serverRadios" value="prod" />中文正式服
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="serverRadios" value="proden" />英文正式服
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-xs-3">玩家ID：</label>
                            <div className="col-xs-9">
                                <input type="text" className="form-control" name="accountId" autoComplete="on" placeholder="玩家ID" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-xs-3">钻石数量：</label>
                            <div className="col-xs-9">
                                <input type="text" className="form-control" name="diamonds" autoComplete="on" placeholder="钻石数量" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-xs-3">筹码数量：</label>
                            <div className="col-xs-9">
                                <input type="text" className="form-control" name="chips" autoComplete="on" placeholder="筹码数量" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-xs-3">VIP等级：</label>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="0" defaultChecked="checked" />
                                    <span className="text-nowrap"> 不更改 </span>
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="1" />
                                    <span className="text-nowrap"> 普通 </span>
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="2" />
                                    <span className="text-nowrap"> 白银 </span>
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="3" />
                                    <span className="text-nowrap"> 黄金 </span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-xs-3"></label>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="4" />
                                    <span className="text-nowrap"> 钻石 </span>
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="5" />
                                    <span className="text-nowrap"> 至尊 </span>
                                </label>
                            </div>
                            <div className="col-xs-2">
                                <label className="radio-inline">
                                    <input type="radio" name="vipRadios" value="6" />
                                    <span className="text-nowrap"> 神圣 </span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-xs-offset-3 col-xs-9">
                                <input type="submit" className="btn btn-primary" value="提交" />
                            </div>
                        </div>
                    </form>
                    <div className="col-md-6" />
                </div>
                <div>{this.renderResult(this.state.flag)}</div>
            </div>
        );
    }

}

export default ModPlayerStats;

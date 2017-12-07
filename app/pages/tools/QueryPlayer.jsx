import React from 'react';
import { Link, hashHistory } from "react-router";
import axios from 'axios';
import { CancelToken } from 'axios';

import {Flag} from '../../Flag.js';
import DataStore from '../../DataStore.js';

class QueryPlayer extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.postData = this.postData.bind(this);
        this.validateInput = this.validateInput.bind(this);

        this.lastRequest = null;

        this.state = {
            "flag": Flag.nothing,
            "inputPlayerIdValue": "",
            "inputPlayerNameValue": ""
        }
    }

    postData(e) {
        e.preventDefault();

        const {inputPlayerIdValue, inputPlayerNameValue} = this.state;

        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/queryPlayer.php',
            method: 'post',
            data: encodeURI(`view=${this.props.location.pathname}&id=${inputPlayerIdValue}&name=${inputPlayerNameValue}`),
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
            console.log(error);
            
            this.setState({
                flag: Flag.failed,
                resultFailed: error.response
            });
            hashHistory.push(`/auth${error.response.status == 403 ? '' : '?back=' + this.props.location.pathname}`);
        });

        this.setState({flag: Flag.waiting});
    }

    renderTable() {
        const entries = [];
        const {players} = this.state.result;
        const style = {
            width: '20rem'
        };
        for (let i = 0; i < players.length; i++) {
            const element = players[i];

            entries.push(
                <div key={i} className="card" style={style}>
                    <div className="card-body">
                        <h4 className="card-title text-center">{element.name}</h4>
                        <h6 className="card-subtitle mb-2 text-muted text-center">{element.id}</h6>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">筹码：{element.chips}</li>
                            <li className="list-group-item">钻石：{element.diamonds}</li>
                        </ul>
                    </div>
                </div>
            );
            
        }
        
        let ret = <div/>;
        if (entries.length > 0) {
            ret = (
                <div className="card-columns request-result">
                    {entries}
                </div>
            );
        }
        return ret;
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    validateInput() {
        this.setState({
            inputPlayerIdValue: this.refs.inputPlayerId.value,
            inputPlayerNameValue: this.refs.inputPlayerName.value
        });
    }

    render() {
        const headerDom = (
            <div>
                <h1 className="page-header">查询玩家</h1>
                <form className="form-row align-items-center" onSubmit={this.postData}>
                    <div className="col-auto">
                        <label htmlFor="inputPlayerId">输入玩家ID：</label>
                        <input
                            type="text"
                            ref="inputPlayerId"
                            id="inputPlayerId"
                            value={this.state.inputPlayerIdValue}
                            className="form-control mb-2 mb-sm-0"
                            placeholder="玩家ID"
                            onChange={this.validateInput}
                        />
                    </div>
                    <div className="col-auto">
                        <label htmlFor="inputPlayerName">输入玩家昵称：</label>
                        <input
                            type="text"
                            ref="inputPlayerName"
                            id="inputPlayerName"
                            value={this.state.inputPlayerNameValue}
                            className="form-control mb-2 mb-sm-0"
                            placeholder="玩家昵称"
                            onChange={this.validateInput}
                        />
                    </div>
                    <div className="col-auto">
                        <label>&nbsp;</label>
                        <button type="submit" className="form-control btn btn-primary">查询</button>
                    </div>
                </form>
            </div>
        );
        let ret;
        switch (this.state.flag) {
            case Flag.success:
                ret = (
                    <div>
                        {headerDom}
                        {this.renderTable()}
                    </div>
                );
                break;
            case Flag.failed:
                ret = (
                    <div>
                        <h3>载入失败 (╯‵□′)╯︵┻━┻</h3>
                        <div>{`${this.state.resultFailed.status}: ${this.state.resultFailed.statusText}`}</div>
                        <Link to="/auth">输入神秘代码</Link>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (<div className="loader" />);
                break;
            case Flag.nothing:
                ret = headerDom;
                break;
            default:
                ret = (<div />);
        }
        return ret;
    }

}

export default QueryPlayer;
import React from 'react';
import { Link, hashHistory } from 'react-router';
import axios from 'axios';
import { CancelToken } from 'axios';

import DataStore from '../../DataStore.js';
import {Flag} from '../../Flag.js';

class QueryPayment extends React.Component {

    constructor() {
        super();
        this.dataStore = new DataStore();
        this.lastRequest = null;

        this.handleSubmitQuery = this.handleSubmitQuery.bind(this);

        this.state = {
            flag: Flag.nothing
        }
    }

    redirect() {
        hashHistory.push("/");
    }

    postQuery(params) {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
        
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        this.lastRequest = source;

        const axiosConfig = {
            url: 'api/ops/queryPayment.php',
            method: 'post',
            data: encodeURI('view=' + this.props.location.pathname),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + this.dataStore.getJWT()
            },
            cancelToken: source.token
        }
        
        const axiosRequest = axios(axiosConfig).then((response) => {
            this.setState({
                flag: Flag.success,
                resultSuccess: response.data
            });
        }).catch((error) => {
            this.setState({
                flag: Flag.denied,
                resultFail: error.response
            });
            this.redirect();
        });
        this.setState({flag: Flag.waiting});
    }

    componentDidMount() {
        this.postQuery({});
    }

    componentWillUnmount() {
        if (this.lastRequest != null) {
            this.lastRequest.cancel();
        }
    }

    handleSubmitQuery(e) {
        e.preventDefault();
        const form = e.target.elements;
        this.postQuery({});
    }

    render() {
        let ret;
        const optionsDom = [];
        // let keys = Object.keys(this.ugconf);
        // for (let i = 0; i < keys.length; i++) {
        //     optionsDom.push(
        //         <option key={i} value={keys[i]}>{this.ugconf[keys[i]]}</option>
        //     );
        // }
        const formDom = (
            <div>
                <h1>订单查询</h1>
                <form onSubmit={this.handleSubmitQuery}>
                    <div className="form-group row">
                        <label htmlFor="startDate" className="col-sm-2 col-form-label">开始日期：</label>
                        <div className="col-sm-4">
                            <input
                                type="date"
                                className="form-control"
                                id="startDate"
                                name="startDate"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="endDate" className="col-sm-2 col-form-label">结束日期：</label>
                        <div className="col-sm-4">
                            <input
                                type="date"
                                className="form-control"
                                id="endDate"
                                name="endDate"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="paymentMethod" className="col-sm-2 col-form-label">支付方式：</label>
                        <div className="col-sm-4">
                            <select
                                className="form-control"
                                id="paymentMethod"
                                name="paymentMethod"
                            >
                                {optionsDom}
                            </select>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="transactionId" className="col-sm-2 col-form-label">订单号：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="transactionId"
                                name="transactionId"
                                placeholder="订单号"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="userId" className="col-sm-2 col-form-label">玩家ID：</label>
                        <div className="col-sm-4">
                            <input
                                type="text"
                                className="form-control"
                                id="userId"
                                name="userId"
                                placeholder="玩家ID"
                            />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-2">
                            <button type="submit" className="btn btn-primary">查询</button>
                        </div>
                    </div>
                </form>
            </div>
        );
        switch (this.state.flag) {
            // insert user success
            case Flag.success:
                // Result flash message
                let resDom = <div />;
                if (this.state.resultSuccess.hasOwnProperty('message')) {
                    resDom = (
                        <div className="alert alert-success col-md-6 request-result">
                            {this.state.resultSuccess.message}
                        </div>
                    );
                }
                ret = (
                    <div>
                        {formDom}
                        {resDom}
                    </div>
                );
                break;
            case Flag.failed:
                ret = (
                    <div>
                        {formDom}
                        <div className="alert alert-danger col-md-6 request-result">
                            {this.state.resultFail.data.message}
                        </div>
                    </div>
                );
                break;
            case Flag.waiting:
                ret = (
                    <div>
                        {formDom}
                        <div className="loader" />
                    </div>
                );
                break;
            case Flag.denied:
                ret = (<div className="loader" />);
            default:
                ret = (<div className="loader" />);
        }
        return ret;
    }

}

export default QueryPayment;
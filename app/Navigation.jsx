import React from 'react';
import { IndexLink, Link } from "react-router";

class NavigationOptions extends React.Component {

    render() {
                    // console.log( this.props.location.pathname);
        const items = this.props.list.map((item, index) => 
            {
                if (item.to == "/") {
                    return (
                        <li className="nav-item" key={index}>
                            <IndexLink to={item.to} className="nav-link" activeClassName="nav-link active">{item.text}</IndexLink>
                        </li>
                    );
                } else {
                    return (
                        <li className="nav-item" key={index}>
                            <Link to={item.to} className="nav-link" activeClassName="nav-link active">{item.text}</Link>
                        </li>
                    );
                }
            }
        );
        return (
            <ul className="nav nav-pills flex-column">
                {items}
            </ul>
        );
    }

}

class NavigationCategory extends React.Component {

    render() {
        const categories = this.props.list.map((item, index) => 
            (
                <div key={index}>
                    <h3>{item.category}</h3>
                    <NavigationOptions list={item.options} />
                </div>
            )
        );
        return (
            <nav className="col-sm-3 col-md-2 d-none d-sm-block bg-light sidebar">
                {categories}
            </nav>
        );
    }

}

class Navigation extends React.Component {

    render() {
        const menu = [
            {
                "category": "仪表盘",
                "options": [
                    {
                        "text": "总览",
                        "to": "/"
                    }
                ]
            },
            {
                "category": "用户分析",
                "options": [
                    {
                        "text": "新增用户",
                        "to": "newUser"
                    }, {
                        "text": "活跃用户",
                        "to": "activeUser"
                    }, {
                        "text": "付费用户",
                        "to": "paidUser"
                    }, {
                        "text": "启动次数",
                        "to": "session"
                    }, {
                        "text": "版本分布",
                        "to": "version"
                    }, {
                        "text": "渠道分布",
                        "to": "channel"
                    }, {
                        "text": "在线情况",
                        "to": "currentOnline"
                    }
                ]
            },
            {
                "category": "留存分析",
                "options": [
                    {
                        "text": "留存率",
                        "to": "playerRetention"
                    }
                ]
            },
            {
                "category": "付费分析",
                "options": [
                    {
                        "text": "付费排行榜",
                        "to": "paymentRanking"
                    }
                ]
            }, {
                "category": "游戏数据",
                "options": [
                    {
                        "text": "玩家筹码存量",
                        "to": "totalChips"
                    }, {
                        "text": "玩家筹码变动",
                        "to": "playerChipsChange"
                    }
                ]
            }, {
                "category": "GM工具",
                "options": [
                    {
                        "text": "查询玩家",
                        "to": "queryPlayer"
                    }, {
                        "text": "修改玩家属性",
                        "to": "modPlayerStats"
                    }
                ]
            }
        ];
        return (
            <NavigationCategory list={menu} />
        );
    }

}

export default Navigation;
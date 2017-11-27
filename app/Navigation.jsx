import React from 'react';
import { IndexLink, Link } from "react-router";

class NavigationOptions extends React.Component {

    render() {
        const items = this.props.list.map((item, index) => 
            {
                if (item.to == "/") {
                    return (
                        <li key={index}>
                            <IndexLink to={item.to} activeClassName="active">{item.text}</IndexLink>
                        </li>
                    );
                } else {
                    return (
                        <li key={index}>
                            <Link to={item.to} activeClassName="active">{item.text}</Link>
                        </li>
                    );
                }
            }
        );
        return (
            <ul className="nav nav-sidebar">
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
            <div className="col-sm-3 col-md-2 sidebar">
                {categories}
            </div>
        );
    }

}

class Navigation extends React.Component {

    render() {
        const menu = [
            {
                "category": "超屌德州",
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
                        "text": "启动次数",
                        "to": "sessions"
                    }, {
                        "text": "版本分布",
                        "to": "versions"
                    }, {
                        "text": "渠道分布",
                        "to": "channels"
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
                        "text": "付费用户",
                        "to": "paidUser"
                    }, {
                        "text": "付费金额",
                        "to": "playerRetention"
                    }, {
                        "text": "付费转化",
                        "to": "playerRetention"
                    }, {
                        "text": "ARPU",
                        "to": "playerRetention"
                    }
                ]
            }, {
                "category": "游戏数据",
                "options": [
                    {
                        "text": "玩家筹码存量",
                        "to": "serverLogs"
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
                        "to": "playerWonRobots"
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
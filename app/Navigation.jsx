import React from 'react';
import ReactDOM from 'react-dom';
import { IndexLink, Link } from "react-router";

import DataStore from './DataStore.js';

class NavigationOptions extends React.Component {

    render() {
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
        let categories = null;
        try {
            categories = this.props.list.map((item, index) => 
                (
                    <div key={index}>
                        <h3>{item.category}</h3>
                        <NavigationOptions list={item.options} />
                    </div>
                )
            );
        } catch (e) {
            categories = (
                <div>
                    <div>不明错误 (╯‵□′)╯︵┻━┻ </div>
                    <Link to="/">回到主页</Link>
                </div>
            );
        }
        const nClass = this.props.toggleDNone ? '' : 'd-none';
        return (
            <nav className={`col-sm-3 col-md-2 ${nClass} d-sm-block bg-light sidebar`}>
                {categories}
            </nav>
        );
    }

}

class Navigation extends React.Component {

    render() {
        const ds = new DataStore();
        const menu = ds.getAccess();
        return (<NavigationCategory list={menu} toggleDNone={this.props.toggleDNone} />);
    }

}

export default Navigation;
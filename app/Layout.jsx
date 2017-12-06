import React from "react";
import { hashHistory } from 'react-router';

import Indexer from './components/Indexer.jsx';
import Navigation from './Navigation.jsx';
import DataStore from './DataStore.js';

class Layout extends React.Component {

    constructor() {
        super();
        this.toggleNav = this.toggleNav.bind(this);

        this.historyChange = this.historyChange.bind(this);
        hashHistory.listen(this.historyChange);

        this.state = {
            showNav: false
        }
    }

    historyChange(e) {
        if (e.action == 'PUSH') {
            this.toggleNav();
        }
    }

    toggleNav() {
        const newValue = !this.state.showNav;
        this.setState({
            showNav: newValue
        })
    }

    renderNav() {
        let renderNav = true;
        if (this.props.location.pathname == '/'
            || this.props.location.pathname == '/auth'
            || this.props.location.pathname == '/account') {
            renderNav = false;
        }
        return renderNav == true ? <Navigation toggleDNone={this.state.showNav} location={location} /> : null;
    }

    render() {
        const { location } = this.props;
        return (
            <div>
                <Indexer toggleNav={this.toggleNav} />
                <div className="container-fluid">
                    <div className="row">
                        {this.renderNav()}
                        <div className="col-sm-9 ml-sm-auto col-md-10 pt-3">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default Layout;
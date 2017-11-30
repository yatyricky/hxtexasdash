import React from "react";

import Indexer from './components/Indexer.jsx';
import Navigation from './Navigation.jsx';
import DataStore from './DataStore.js';

class Layout extends React.Component {

    render() {
        const { location } = this.props;
        let renderNav = true;

        if (this.props.location.pathname == '/auth') {
            renderNav = false;
        }

        return (
            <div>
                <Indexer />
                <div className="container-fluid">
                    <div className="row">
                        {renderNav == true ? <Navigation location={location} /> : null}
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
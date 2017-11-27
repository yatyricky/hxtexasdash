import React from 'react';
import {render} from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Layout from './Layout.jsx';
import Welcome from './pages/Welcome.jsx';
import Auth from './Auth.jsx';

import NewUser from './pages/user/NewUser.jsx';

class Main extends React.Component {
    render () {
        return (
            <Router history={hashHistory}>
                <Route path="/" component={Layout}>
                    <IndexRoute component={Welcome}></IndexRoute>
                    <Route path="auth" name="auth" component={Auth}></Route>
                    <Route path="newUser" name="newUser" component={NewUser}></Route>
                </Route>
            </Router>
        );
    }
}

render(<Main />, document.getElementById('root'));
import React from 'react';
import {render} from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Layout from './Layout.jsx';
import Auth from './Auth.jsx';
import Account from './Account.jsx';

import Overview from './pages/user/Overview.jsx';
import NewUser from './pages/user/NewUser.jsx';
import ActiveUser from './pages/user/ActiveUser.jsx';
import PaidUser from './pages/user/PaidUser.jsx';
import Session from './pages/user/Session.jsx';
import Version from './pages/user/Version.jsx';
import Channel from './pages/user/Channel.jsx';
import CurrentOnline from './pages/user/CurrentOnline.jsx';

import PlayerRetention from './pages/retention/PlayerRetention.jsx';

import PaymentRanking from './pages/payment/PaymentRanking.jsx';

import TotalChips from './pages/gamedata/TotalChips.jsx';
import PlayerChipsChange from './pages/gamedata/PlayerChipsChange.jsx';

import QueryPlayer from './pages/tools/QueryPlayer.jsx';
import ModPlayerStats from './pages/tools/ModPlayerStats.jsx';
import QueryPayment from './pages/tools/QueryPayment.jsx';
import QueryTable from './pages/tools/QueryTable.jsx';

class Main extends React.Component {
    render () {
        return (
            <Router history={hashHistory}>
                <Route path="/" component={Layout}>
                    <IndexRoute component={Auth}></IndexRoute>
                    <Route path="auth" name="auth" component={Auth}></Route>
                    <Route path="account" name="account" component={Account}></Route>

                    <Route path="overview" name="overview" component={Overview}></Route>
                    <Route path="newUser" name="newUser" component={NewUser}></Route>
                    <Route path="activeUser" name="activeUser" component={ActiveUser}></Route>
                    <Route path="paidUser" name="paidUser" component={PaidUser}></Route>
                    <Route path="session" name="session" component={Session}></Route>
                    <Route path="version" name="version" component={Version}></Route>
                    <Route path="channel" name="channel" component={Channel}></Route>
                    <Route path="currentOnline" name="currentOnline" component={CurrentOnline}></Route>
                    
                    <Route path="playerRetention" name="playerRetention" component={PlayerRetention}></Route>
                    
                    <Route path="paymentRanking" name="paymentRanking" component={PaymentRanking}></Route>

                    <Route path="totalChips" name="totalChips" component={TotalChips}></Route>
                    <Route path="playerChipsChange" name="playerChipsChange" component={PlayerChipsChange}></Route>

                    <Route path="queryPlayer" name="queryPlayer" component={QueryPlayer}></Route>
                    <Route path="modPlayerStats" name="modPlayerStats" component={ModPlayerStats}></Route>
                    <Route path="queryPayment" name="queryPayment" component={QueryPayment}></Route>
                    <Route path="queryTable" name="queryTable" component={QueryTable}></Route>

                </Route>
            </Router>
        );
    }
}

render(<Main />, document.getElementById('root'));
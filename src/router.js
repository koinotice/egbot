import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import withRoot from './components/hocs/withRoot';
import MainLayout from './layouts/mainLayout';
import Dashboard from './containers/dashboard/dashboard';
import Portfolio from './containers/portfolio/portfolio';
import Coins from './containers/coins/coinsRouter';
import Trade from './containers/trade/trade';
import Settings from './containers/settings/settings';
import News from './containers/news/news';
import Bots from './containers/bots/bots';

const Router = () => (
  <BrowserRouter basename="/platform">
    <MainLayout>
      <Route
        exact
        path="/"
        render={() =>
          <Redirect to="/trade" />
        } />
      <Route path="/trade" component={Trade} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/market" component={Coins} />
      <Route path="/settings" component={Settings} />
      <Route path="/news" component={News} />
      <Route path="/bots" component={Bots} />
    </MainLayout>
  </BrowserRouter>
);

export default withRoot(Router);



// WEBPACK FOOTER //
// ./src/router.js
import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Main from './molecules/Main';
import Compliments from './molecules/Compliments';
import SlideShow from './molecules/SlideShow';
import NavBar from './atoms/NavBar';

class App extends React.Component {
  render() {
    const nav_items = [
      {'Home': 'compliments', 'SlideShow': 'slideshow', 'Submit': '/submit'}
    ];
    return (
        <BrowserRouter>
          <NavBar items={nav_items} appName='Compliment Hub' />
          <div className='content'>
              <Switch>
                  <Route exact path="/submit" component={Main} />
                  <Route exact path="/compliments" component={Compliments} />
                  <Route exact path="/slideshow" component={SlideShow} />
                  <Route exact path="*" component={Compliments} />
              </Switch>
          </div>
        </BrowserRouter>
    );
  }
}

export default App;

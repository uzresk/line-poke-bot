import React, {useReducer} from 'react';
import '../App.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Layout from './Layout';


function App() {

    return (
        <div className="App">
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Layout}/>
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;

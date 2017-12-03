import React from 'react';
import { render } from 'react-dom';

class Indexer extends React.Component {

    constructor() {
        super();
        this.clickToggle = this.clickToggle.bind(this);
    }

    clickToggle() {
        this.props.toggleNav();
    }

    render() {
        return (
            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                    <a className="navbar-brand" href="#">超屌德州</a>
                    <button className="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" onClick={this.clickToggle}></span>
                    </button>

                    {/* <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                        <ul className="navbar-nav mr-auto user-info">
                            <li className="nav-item">
                                <a className="nav-link">黄叔</a>
                            </li>
                            <li className="nav-item active">
                                <a className="nav-link" href="#">注销</a>
                            </li>
                        </ul>

                        <form className="form-inline mt-2 mt-md-0">
                            <input className="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                        </form>
                    </div> */}
                </nav>
            </header>
        );
    }

}

export default Indexer;

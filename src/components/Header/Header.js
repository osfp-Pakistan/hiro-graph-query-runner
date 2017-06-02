import React from "react";
import { Link } from "react-router-dom";

import Loader from "../Loader";
import "./Header.css";

const valignMiddle = { verticalAlign: "middle" };
const Logo = () =>
    Loader.Static({ width: "3rem", height: "3rem", style: valignMiddle });

const imgStyle = { width: "2rem", height: "2rem" };

const hiroGraphAPI = process.env.REACT_APP_HIRO_GRAPH_API;

const Header = ({ me = false, logout }) => {
    const links = [];
    if (me) {
        links.push(
            <li key="lucene" className="nav-item">
                <Link className="nav-link" to="/lucene">Lucene</Link>
            </li>,
            <li key="gremlin" className="nav-item">
                <Link className="nav-link" to="/gremlin">Gremlin</Link>
            </li>,
            <li key="history" className="nav-item">
                <Link className="nav-link" to="/history">History</Link>
            </li>
        );
    }
    links.push(
        <li key="github" className="nav-item">
            <a
                className="nav-link"
                href="https://github.com/arago/hiro-graph-query-runner"
            >
                <svg
                    aria-hidden="true"
                    class="octicon octicon-mark-github"
                    height="32"
                    version="1.1"
                    viewBox="0 0 16 16"
                    width="32"
                    style={valignMiddle}
                >
                    <path
                        fill-rule="evenodd"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                    />
                </svg>
            </a>
        </li>
    );
    return (
        <nav className="navbar navbar-toggleable-md fixed-top navbar-light bg-faded">
            <Link className="navbar-brand" to="/">
                <Logo />

                <span className="Header-title">HIRO Graph Query Runner</span>
            </Link>
            <ul className="navbar-nav mr-auto">
                {links}
            </ul>
            {me &&
                <span>
                    <img
                        src={`${hiroGraphAPI}/${me}/picture`}
                        style={imgStyle}
                        className="d-inline-block align-middle rounded-circle"
                        alt={me}
                    />
                    <span className="mx-2">{me}</span>
                    <button
                        type="button"
                        onClick={logout}
                        className="btn btn-secondary btn-sm align-middle"
                    >
                        Logout
                    </button>
                </span>}
        </nav>
    );
};

export default Header;

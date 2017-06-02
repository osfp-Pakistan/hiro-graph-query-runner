import React, { Component } from "react";

import Message from "../Message";

const rgbToGreyFactors = [0.21, 0.72, 0.07];
const toGreyscale = hex => {
    return hex
        .slice(1) //remove '#'
        .split(/([a-fA-F0-9]{2})/) //into colors
        .filter(Boolean) //remove the blanks
        .reduce(
            (final, color, index) => {
                const c = parseInt(color, 16);
                const f = rgbToGreyFactors[index];
                return [final[0] + c * f];
            },
            [0]
        )
        .map(n => Math.floor(n))
        .map(n => `rgba(${n},${n},${n}, 0.8)`)
        .pop();
};

const shuffle = input => {
    for (let i = input.length - 1; i >= 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [input[i], input[randomIndex]] = [input[randomIndex], input[i]];
    }
    return input;
};

const frameRate = 1000 / 24;

const svg = [
    {
        transform: "translate(30.546 84.743)",
        d: "m0 0-2.171 6.172c-3.735-1.343-7.222-3.175-10.39-5.414l3.694-5.399c2.701 1.92 5.678 3.49 8.867 4.641",
        fill: "#ff9920"
    },
    {
        transform: "translate(9.2015 64.865)",
        d: "m0 0-5.899 2.829c-1.568-3.479-2.691-7.191-3.302-11.058l6.431-1.206 6.574-1.233c0.396 2.716 1.154 5.326 2.226 7.776z",
        fill: "#ff7a20"
    },
    {
        transform: "translate(79.886 73.556)",
        d: "m0 0-5.4-3.694c-1.801 2.8-3.964 5.335-6.419 7.544l-4.353-5.075c2.013-1.83 3.783-3.929 5.252-6.245 1.433-2.258 2.579-4.722 3.384-7.347l6.31 2.219 6.173 2.171c-1.193 3.728-2.868 7.226-4.947 10.427",
        fill: "#25b5ec"
    },
    {
        transform: "translate(62.665 88.921)",
        d: "m0 0-2.829-5.898-2.89-6.026c2.462-1.246 4.738-2.82 6.768-4.666l4.353 5.075 4.258 4.963c-2.905 2.596-6.153 4.804-9.66 6.552",
        fill: "#69d5f7"
    },
    {
        transform: "translate(76.239 32.712)",
        d: "m0 0-6.029 2.892c-1.211-2.306-2.71-4.444-4.454-6.362-1.728-1.901-3.696-3.585-5.86-5.004l3.774-5.516 3.694-5.401c3.121 2.074 5.952 4.536 8.43 7.31l-4.963 4.258c2.123 2.36 3.942 4.989 5.408 7.823",
        fill: "#ff7a20"
    },
    {
        transform: "translate(30.565,21.993)",
        d: "m0 0-2.89-6.026-2.83-5.9c3.338-1.546 6.896-2.681 10.602-3.345l1.206 6.428 1.232 6.57c-2.557 0.449-5.012 1.221-7.32 2.273",
        fill: "#69d5f7"
    },
    {
        transform: "translate(18.641 31.657)",
        d: "m0 0c-1.545 2.09-2.833 4.388-3.81 6.852-0.958 2.416-1.617 4.991-1.932 7.682l-6.667-0.51c0.361-3.289 1.145-6.435 2.292-9.39l-6.175-2.171c1.365-3.569 3.181-6.901 5.372-9.933l5.401 3.695c1.88-2.578 4.079-4.9 6.536-6.909l4.353 5.074c-2.015 1.631-3.822 3.515-5.37 5.61",
        fill: "#ff9920"
    },
    {
        transform: "translate(30.546 84.743)",
        d: "m0 0 2.217-6.305 1.955-5.557c2.074 0.759 4.285 1.25 6.595 1.427l-0.45 5.872-0.51 6.663c-3.432-0.263-6.719-0.986-9.807-2.1",
        fill: "#69d5f7"
    },
    {
        transform: "translate(39.854 93.363)",
        d: "m0 0 0.499-6.52 0.51-6.662 0.449-5.873c2.311 0.177 4.571 0.028 6.736-0.406l1.086 5.79 1.232 6.568 1.206 6.43c-3.771 0.734-7.702 0.98-11.718 0.673",
        fill: "#25b5ec"
    },
    {
        transform: "translate(25.452 74.586)",
        d: "m0 0c-2.243-1.607-4.253-3.508-5.979-5.642-1.711-2.114-3.141-4.458-4.241-6.972l5.315-2.549c0.875 2.048 2.022 3.959 3.399 5.684 1.391 1.745 3.016 3.3 4.833 4.615z",
        fill: "#69d5f7"
    },
    {
        transform: "translate(59.896 24.238)",
        d: "m0 0-3.326 4.862c-1.701-1.103-3.551-2.003-5.518-2.664l1.955-5.559 2.218-6.306c3.016 1.03 5.847 2.434 8.445 4.151z",
        fill: "#ffffff"
    },
    {
        transform: "translate(72.35 58.739)",
        d: "m0 0-5.563-1.957c0.486-1.642 0.81-3.36 0.946-5.138 0.032-0.419 0.053-0.836 0.064-1.251l5.877 0.45c-0.015 0.416-0.036 0.832-0.068 1.251-0.177 2.303-0.606 4.526-1.256 6.645",
        fill: "#25b5ec"
    },
    {
        transform: "translate(23.506 34.985)",
        d: "m0 0c-1.256 1.67-2.306 3.509-3.11 5.482-0.791 1.94-1.345 4.009-1.62 6.174l-5.877-0.449c0.316-2.692 0.975-5.267 1.932-7.682 0.978-2.465 2.266-4.763 3.811-6.853 1.548-2.094 3.355-3.979 5.37-5.61l3.837 4.474c-1.626 1.296-3.087 2.795-4.343 4.464",
        fill: "#ffffff"
    },
    {
        transform: "translate(34.718 72.881)",
        d: "m0 0-1.954 5.557c-2.632-0.955-5.087-2.258-7.312-3.852l3.328-4.864 3.848-5.624c1.318 0.974 2.779 1.772 4.35 2.356z",
        fill: "#25b5ec"
    },
    {
        transform: "translate(25.508 51.852)",
        d: "m0 0-6.706 1.258-5.796 1.087-6.575 1.233c-0.422-2.756-0.539-5.603-0.317-8.502 0.032-0.418 0.073-0.833 0.118-1.247l6.667 0.511 5.877 0.449 6.803 0.521c-0.06 0.41-0.108 0.825-0.14 1.245-0.089 1.17-0.062 2.322 0.069 3.445",
        fill: "#69d5f7"
    },
    {
        transform: "translate(63.714 72.331)",
        d: "m0 0c-2.031 1.846-4.306 3.419-6.768 4.666l-2.549-5.314c1.996-1.023 3.839-2.313 5.48-3.825l-4.437-5.173c1.172-1.11 2.194-2.38 3.032-3.779l5.629 3.851 4.866 3.328c-1.47 2.317-3.24 4.416-5.253 6.246",
        fill: "#ff7a20"
    },
    {
        transform: "translate(49.134 79.692)",
        d: "m0 0-1.086-5.79-1.256-6.696c1.642-0.338 3.207-0.905 4.659-1.667l2.947 6.145 2.548 5.313c-2.441 1.237-5.066 2.151-7.812 2.695",
        fill: "#ffffff"
    },
    {
        transform: "translate(64.896 38.153)",
        d: "m0 0c-0.987-1.841-2.204-3.545-3.613-5.073l-5.173 4.437c-1.006-1.062-2.143-2.001-3.388-2.792l3.848-5.625 3.326-4.862c2.165 1.42 4.132 3.104 5.86 5.005 1.744 1.918 3.243 4.055 4.454 6.361z",
        fill: "#25b5ec"
    },
    {
        transform: "translate(67.797 50.393)",
        d: "m0 0-6.803-0.521c0.011-1.573-0.185-3.106-0.564-4.571l6.705-1.257 5.798-1.088c0.579 2.533 0.838 5.178 0.741 7.887z",
        fill: "#69d5f7"
    },
    {
        transform: "translate(68.967 66.086)",
        d: "m0 0-4.865-3.328-5.63-3.852c0.81-1.351 1.447-2.823 1.879-4.387l6.436 2.264 5.564 1.956c-0.805 2.625-1.952 5.089-3.384 7.347",
        fill: "#69d5f7"
    },
    {
        transform: "translate(32.286 35.693)",
        d: "m0 0-4.437-5.173-3.837-4.473c1.997-1.615 4.198-2.981 6.553-4.054l2.548 5.312 2.947 6.145c-1.351 0.592-2.618 1.347-3.774 2.243",
        fill: "#ff9920"
    },
    {
        transform: "translate(51.052 26.436)",
        d: "m0 0c-1.895-0.637-3.899-1.053-5.983-1.212l-0.52 6.79c-1.477-0.113-2.925-0.041-4.322 0.194l-1.256-6.697-1.086-5.791-1.233-6.57c3.027-0.538 6.169-0.707 9.376-0.462l-0.51 6.663c2.611 0.2 5.119 0.723 7.489 1.526z",
        fill: "#25b5ec"
    }
];

const inArray = (needle, haystack) => {
    return haystack.indexOf(needle) !== -1;
};

export default class Loader extends Component {
    constructor() {
        super();
        this.state = {
            reverse: false,
            fillsToDo: shuffle(this.initArray()),
            fillsDone: []
        };
        this.tick = this.tick.bind(this);
        this.stop = this.stop.bind(this);
    }

    componentDidMount() {
        this._raf = window.requestAnimationFrame(this.tick);
    }

    componentWillUnmount() {
        this.stop();
    }

    restart() {
        const { fillsToDo, fillsDone, reverse } = this.state;
        this.setState({
            fillsToDo: fillsDone,
            fillsDone: fillsToDo,
            reverse: !reverse
        });
    }

    stop() {
        window.cancelAnimationFrame(this._raf);
    }

    tick(time) {
        const delta = this._lastUpdate ? time - this._lastUpdate : frameRate;
        if (delta >= frameRate) {
            this._lastUpdate = time;
            this.update();
        }
        this._raf = window.requestAnimationFrame(this.tick);
    }

    update() {
        const { fillsToDo, fillsDone } = this.state;
        if (fillsToDo.length > 0) {
            const rmIdx = Math.floor(Math.random()) * (fillsToDo.length + 1);
            this.setState({
                fillsDone: fillsDone.concat(fillsToDo.splice(rmIdx, 1)),
                fillsToDo: fillsToDo.slice()
            });
        } else {
            this.restart();
        }
    }

    initArray() {
        return svg.map((item, i) => i);
    }

    render() {
        const { fillsToDo, reverse } = this.state;
        const { width = 100, height = 100, title = false } = this.props;
        const loader = (
            <svg
                className="hiro-loader"
                height={width}
                width={height}
                version="1.1"
                viewBox="0 0 115.82609 115.82609"
            >
                <defs>
                    <clipPath id="clipPath26" clipPathUnits="userSpaceOnUse">
                        <path d="m0 93.492h194.01v-93.492h-194.01z" />
                    </clipPath>
                </defs>
                <g transform="matrix(1.3333 0 0 -1.3333 -.00066667 124.79)">
                    <g clipPath="url(#clipPath26)">
                        {svg.map((item, i) => (
                            <g key={i} transform={item.transform}>
                                <path
                                    className="hiro-loader-path"
                                    d={item.d}
                                    fill={
                                        (inArray(i, fillsToDo) && !reverse) ||
                                            (!inArray(i, fillsToDo) && reverse)
                                            ? toGreyscale(item.fill)
                                            : item.fill
                                    }
                                />
                            </g>
                        ))}
                    </g>
                </g>
            </svg>
        );
        return title ? <Message title={title}>{loader}</Message> : loader;
    }
}

const noStyle = {};
Loader.Static = ({
    width = 100,
    height = 100,
    greyscale = false,
    style = noStyle
}) => {
    return (
        <svg
            className="hiro-loader"
            height={width}
            width={height}
            style={style}
            version="1.1"
            viewBox="0 0 115.82609 115.82609"
        >
            <defs>
                <clipPath id="clipPath26" clipPathUnits="userSpaceOnUse">
                    <path d="m0 93.492h194.01v-93.492h-194.01z" />
                </clipPath>
            </defs>
            <g transform="matrix(1.3333 0 0 -1.3333 -.00066667 124.79)">
                <g clipPath="url(#clipPath26)">
                    {svg.map((item, i) => (
                        <g key={i} transform={item.transform}>
                            <path
                                className="hiro-loader-path"
                                d={item.d}
                                fill={
                                    greyscale
                                        ? toGreyscale(item.fill)
                                        : item.fill
                                }
                            />
                        </g>
                    ))}
                </g>
            </g>
        </svg>
    );
};

import React from "react";

const Message = ({ children, title = false, type = "default" }) => {
    const titleClass = type === "default"
        ? "display-2"
        : "display-2 text-" + type;
    return (
        <div className="container-fluid text-center">
            {title && <h2 className={titleClass}>{title}</h2>}
            {children}
        </div>
    );
};

export default Message;

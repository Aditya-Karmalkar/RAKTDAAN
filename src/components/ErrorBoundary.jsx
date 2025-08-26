import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught", error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 16 }}>
                    Something went wrong. Please refresh the page.
                </div>
            );
        }
        return this.props.children;
    }
}
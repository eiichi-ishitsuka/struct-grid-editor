import React, { useEffect, useRef } from 'react';
import './style.css';
import { initOriginalLogic } from './originalLogic.js';

declare global {
    interface Window {
        acquireVsCodeApi: () => any;
        initialData: any;
        vscode: any;
    }
}

const vscode = typeof window !== 'undefined' && window.acquireVsCodeApi ? window.acquireVsCodeApi() : {
    postMessage: (msg: any) => console.log('postMessage:', msg),
    getState: () => ({}),
    setState: (state: any) => console.log('setState:', state)
};

const App: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Run original logic
        initOriginalLogic(vscode, window.initialData);

        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === 'update') {
                window.initialData = message.data;
                initOriginalLogic(vscode, window.initialData);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Create the structure that originalLogic.js expects
    return (
        <div style={{width: '100%', height: '100%'}}>
            <div id="app" ref={containerRef}></div>
            <div id="contextMenu" className="context-menu" style={{ display: 'none' }}></div>
            <div id="toastNotification" className="toast-notification"></div>
        </div>
    );
};

export default App;

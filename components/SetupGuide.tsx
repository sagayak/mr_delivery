import React from 'react';
import { InfoIcon } from './icons';

const SetupGuide: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-slate-800 rounded-lg shadow-2xl p-8 border border-cyan-500/30">
                <div className="flex items-center gap-4 mb-6">
                    <InfoIcon className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                    <h1 className="text-3xl font-bold text-cyan-400">Action Required: Connect Your Google Sheet</h1>
                </div>
                <p className="text-slate-300 text-lg mb-6">
                    The application can't load your orders because it's not connected to your Google Sheet yet.
                    Please follow these one-time setup steps:
                </p>

                <ol className="list-decimal list-inside space-y-5 text-slate-300 mb-8">
                    <li>
                        <span className="font-semibold text-white">Open the script file:</span> Find the file named <code className="bg-slate-700 text-amber-400 rounded px-1.5 py-0.5 text-sm">google-apps-script.js</code> in your project files.
                    </li>
                    <li>
                        <span className="font-semibold text-white">Deploy as a Web App:</span> Follow the instructions in that file's comments to deploy it from your Google account. It's a quick process that creates a secure bridge to your sheet.
                    </li>
                    <li>
                        <span className="font-semibold text-white">Copy the URL:</span> After deploying, Google will give you a unique "Web app URL". Copy it.
                    </li>
                    <li>
                        <span className="font-semibold text-white">Update the configuration:</span> Open the file <code className="bg-slate-700 text-amber-400 rounded px-1.5 py-0.5 text-sm">config.ts</code> and paste your URL, replacing the placeholder text.
                    </li>
                </ol>

                <div className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
                    >
                        I've updated the URL, Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupGuide;

import './bootstrap';
import '../css/app.css';

// Polyfill Buffer for browser (required by Deepgram SDK)
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Virtual Recruiter';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page: any = await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        );
        const Layout = (await import('./Layouts/Layout')).default;
        page.default.layout = page.default.layout || ((pageContent: any) => <Layout>{pageContent}</Layout>);
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#3b82f6',
    },
});

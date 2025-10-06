import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.jsx';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bọc toàn bộ App trong MantineProvider */}
    <MantineProvider >
        <Notifications />
        <App />
    </MantineProvider>
  </StrictMode>,
);

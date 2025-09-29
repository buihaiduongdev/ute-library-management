import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.jsx';


// Import các file CSS của Mantine
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bọc toàn bộ App trong MantineProvider */}
    <MantineProvider 
      theme={{ 
        /* Bạn có thể tùy chỉnh theme ở đây, ví dụ:
        primaryColor: 'cyan',
        */
      }}
    >
        <Notifications /> {/* Component để hiển thị thông báo */}
        <App />
    </MantineProvider>
  </StrictMode>,
);

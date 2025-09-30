import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AppLayout() {
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header> 
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default AppLayout;

import { AppShell, Container } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AppLayout() {
  return (
    <AppShell
      padding="md"
      header={<Navbar />}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      {/* Các trang con (AdminPage, StaffPage,...) sẽ được render ở đây */}
      <Outlet />
    </AppShell>
  );
}

export default AppLayout;

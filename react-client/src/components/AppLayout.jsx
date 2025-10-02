import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function AppLayout() {
  return (
    <AppShell
    fixed          // cố định header + navbar
    header={{ height: 60 }}
    styles={{
      main: { paddingLeft: 0 }
    }}
    >
      <AppShell.Header> 
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
       
        <Footer />
      
    </AppShell>
  );
}

export default AppLayout;

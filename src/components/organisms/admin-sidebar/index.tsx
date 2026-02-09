import { useState } from 'react';
import { Drawer, Grid, useMediaQuery, useTheme, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SubcategoryList from './admin-sidebar-subcategory';
import { categories } from './admin-sidebar-data';

interface SidebarProps {
  mobileOpen?: boolean;
  handleDrawerToggle?: () => void;
  isMobile?: boolean;
}

function AdminSidebar({ mobileOpen = false, handleDrawerToggle, isMobile = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [openSubMenu, setOpenSubMenu] = useState(null);

  const currentPath = location.pathname;
  const isFleetTracking = currentPath.includes('fleet-tracking');

  const handleSubcategoryClick = (subcategory: any) => {
    navigate(subcategory.key);
    if (isMobile && handleDrawerToggle) handleDrawerToggle();
  };

  const handleSubMenuToggle = (key: any) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };

  const sidebarWidth = '14%';
  const appBarHeight = theme.mixins.toolbar.minHeight;

  return (
    <Box
      component="nav"
      sx={{ width: { md: sidebarWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          zIndex: (theme) => isMobile ? theme.zIndex.drawer + 2 : theme.zIndex.drawer - 1,
          '& .MuiDrawer-paper': {
            width: isMobile ? '60%' : sidebarWidth,
            marginTop: isMobile ? 0 : `${appBarHeight}px`,
            height: isMobile ? '100%' : `calc(100vh - ${appBarHeight}px)`,
            bgcolor: '#3F5C78',
            boxSizing: 'border-box',
          },
        }}
      >
        <Grid container direction="row" sx={{ height: '100%', zIndex: 10 }}>
          <SubcategoryList
            selectedCategory={categories[0]}
            currentPath={currentPath}
            isFleetTracking={isFleetTracking}
            handleSubcategoryClick={handleSubcategoryClick}
            handleSubMenuToggle={handleSubMenuToggle}
            openSubMenu={openSubMenu}
            isMobile={isMobile}
            handleDrawerToggle={handleDrawerToggle}
          />
        </Grid>
      </Drawer>
    </Box>
  );
}

export default AdminSidebar;

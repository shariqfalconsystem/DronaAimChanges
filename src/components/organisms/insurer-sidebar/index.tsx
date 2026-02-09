import { useState } from 'react';
import { Drawer, Grid, useMediaQuery, useTheme, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SubcategoryList from './sidebar-subcategory';
import { categories, SuperInsurerCategories } from './sidebar-data';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface SidebarProps {
  mobileOpen?: boolean;
  handleDrawerToggle?: () => void;
  isMobile?: boolean;
}

function Sidebar({ mobileOpen = false, handleDrawerToggle, isMobile = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const currentPath = location.pathname;
  const isFleetTracking = currentPath.includes('fleet-tracking');

  const currentUserRole = useSelector((state: any) => state.auth.currentUserRole);

  const selectedCategory = currentUserRole === 'insurerSuperUser' ? SuperInsurerCategories[0] : categories[0];

  const handleSubcategoryClick = (subcategory: any) => {
    setSelectedSubcategory(subcategory);

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
            selectedCategory={selectedCategory}
            currentPath={currentPath}
            isFleetTracking={isFleetTracking}
            handleSubcategoryClick={handleSubcategoryClick}
            handleSubMenuToggle={handleSubMenuToggle}
            isMobile={isMobile}
            handleDrawerToggle={handleDrawerToggle}
          />
        </Grid>
      </Drawer>
    </Box>
  );
}

export default Sidebar;

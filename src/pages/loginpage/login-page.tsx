import React, { useEffect, useState } from 'react';
import { Grid, Typography, TextField, Button, FormControlLabel, Checkbox, Link } from '@mui/material';
import './login-page.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { signIn, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
// import environment from '../../environments/environment';
import NewPasswordComponent from '../new-password';
import LoginContainer from '../../components/organisms/login-container';
import { clearAuthState, loginSuccess } from '../../redux/auth/authSlice';
import { paths } from '../../common/constants/routes';
import LoaderDialog from '../../common/components/LoaderDialog';
import Logo from '../../assets/img/logo.png';
import restrictDriverLogin from '../../assets/img/driver-restrict.png';
import RoleSelectionModal from './multi-role';
import DriverRoleRestrictionDialog from '../../components/modals/driver-restriction-dialog';
import { getToken } from '../../services/apiService';
import PolicyExpirationDialog from '../../common/components/login-restriction';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordUpdateRequired, setIsPasswordUpdateRequired] = useState(false);
  const [isPolicyExpired, setIsPolicyExpired] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [showDriverRestriction, setShowDriverRestriction] = useState(false);
  const [policyDetails, setPolicyDetails] = useState<any>(null);

  const dispatch = useDispatch();

  const [userInfo, setUserInfo] = useState<any>(null);

  const role = useSelector((state: any) => state.auth.currentUserRole);

  console.log('role', role);

  useEffect(() => {
    const redirectToLogin = async (userRole: any) => {
      const token: any = await getToken();
      if (token) {
        if (userRole === 'fleetManager' || userRole === 'fleetManagerSuperUser') {
          navigate(paths.DASHBOARD);
        } else if (userRole === 'insurer' || userRole === 'insurerSuperUser') {
          navigate(paths.INSURERDASHBOARD);
        } else if (userRole === 'admin') {
          navigate(paths.ADMIN);
        }
      }
    };

    redirectToLogin(role);
  }, [navigate, role]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value.trim());
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value.trim());
  };

  const handleRememberMe = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };

  // Helper function to handle role selection logic
  const processRoleSelection = (userInfo: any) => {
    if (!userInfo.orgRoleAndScoreMapping || userInfo.orgRoleAndScoreMapping.length === 0) {
      setError('No roles found for this user. Please contact administrator.');
      dispatch(clearAuthState());
      return;
    }

    // If only one role available, auto-select it
    if (userInfo.orgRoleAndScoreMapping.length === 1) {
      const singleRole = userInfo.orgRoleAndScoreMapping[0];

      // Check if policy is expired for single role
      const policyDetail = singleRole.policyDetails?.[0];
      if (policyDetail && !policyDetail.isActive) {
        setPolicyDetails(policyDetail);
        setIsPolicyExpired(true);
        return;
      }

      // Handle driver role restriction for single role case
      if (singleRole.role === 'driver') {
        setShowDriverRestriction(true);
        return;
      }

      // Create the complete user data object with userId for single role auto-login
      const userDataWithSelectedRole = {
        ...userInfo,
        selectedRole: singleRole,
        currentUserRole: singleRole.role,
        currentOrganization: singleRole.name,
        currentLonestarId: singleRole.lonestarId,
        currentInsurerId: singleRole.insurerId,
      };

      // Dispatch login success and navigate
      dispatch(loginSuccess(userDataWithSelectedRole));
      navigateBasedOnRole(singleRole.role);
    } else {
      // Multiple roles available, show selection modal
      setOpenPopup(true);
    }
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   localStorage.clear();
  //   sessionStorage.clear();

  //   setIsLoading(true);
  //   setOpenDialog(true);
  //   setLoadingMessage('Logging in...');

  //   try {
  //     // REAL BACKEND API CALL
  //     const response = await fetch('https://your-api.com/auth/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         clientId: username,
  //         secret: password
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error('Login failed');
  //     }

  //     const data = await response.json();

  //     // Store real authentication token
  //     localStorage.setItem('authToken', data.token);

  //     // Set user info from backend
  //     setUserInfo(data.user);

  //     // Process role selection with real user data
  //     processRoleSelection(data.user);

  //   } catch (error: any) {
  //     console.error('Login failed:', error);
  //     setError(`${error?.message}`);
  //   } finally {
  //     setIsLoading(false);
  //     setOpenDialog(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    localStorage.clear();
    sessionStorage.clear();

    setIsLoading(true);
    setOpenDialog(true);
    setLoadingMessage('Logging in...');

    try {
      // Dummy backend authentication - Check if email contains "admin" to login as admin
      const isAdmin = username.toLowerCase().includes('admin');
      const dummyUserInfo = {
        userId: 'dummy-user-123',
        email: username,
        orgRoleAndScoreMapping: [
          {
            name: isAdmin ? 'Admin Organization' : 'Demo Organization',
            role: isAdmin ? 'admin' : 'fleetManager',
            lonestarId: 'lonestar-123',
            insurerId: 'insurer-456',
            policyDetails: [{ isActive: true, message: 'Policy active' }]
          }
        ]
      };

      // Store dummy token for private route authentication
      localStorage.setItem('authToken', 'dummy-jwt-token-12345');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUserInfo(dummyUserInfo);

      // Step 2: Process role selection (single or multiple)
      processRoleSelection(dummyUserInfo);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(`${error?.message}`);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
    }
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    setIsLoading(true);
    setOpenDialog(true);
    setLoadingMessage('Updating password...');
    localStorage.clear();
    sessionStorage.clear();

    try {
      // Dummy password update - just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store dummy token for private route authentication
      localStorage.setItem('authToken', 'dummy-jwt-token-12345');

      // Dummy password update - Check if email contains "admin" to login as admin
      const isAdmin = username.toLowerCase().includes('admin');
      const dummyUserInfo = {
        userId: 'dummy-user-123',
        email: username,
        orgRoleAndScoreMapping: [
          {
            name: isAdmin ? 'Admin Organization' : 'Demo Organization',
            role: isAdmin ? 'admin' : 'fleetManager',
            lonestarId: 'lonestar-123',
            insurerId: 'insurer-456',
            policyDetails: [{ isActive: true, message: 'Policy active' }]
          }
        ]
      };

      setUserInfo(dummyUserInfo);
      setIsPasswordUpdateRequired(false);

      // Process role selection after password update
      processRoleSelection(dummyUserInfo);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(`${error?.message}`);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
    }
  };

  // Helper function to navigate based on role
  const navigateBasedOnRole = (role: string) => {
    if (role === 'fleetManager' || role === 'fleetManagerSuperUser') {
      navigate(paths.DASHBOARD);
    } else if (role === 'insurer' || role === 'insurerSuperUser') {
      navigate(paths.INSURERDASHBOARD);
    } else if (role === 'admin') {
      navigate(paths.ADMIN);
    } else {
      setError('Invalid role selected. Please try again.');
    }
  };

  const handleSelectRole = (selectedRoleMapping: any) => {
    console.log('Selected role mapping:', selectedRoleMapping);

    // Check if policy is expired for selected role
    const policyDetail = selectedRoleMapping.policyDetails?.[0];
    if (policyDetail && !policyDetail.isActive) {
      setPolicyDetails(policyDetail);
      setIsPolicyExpired(true);
      setOpenPopup(false);
      return;
    }

    if (selectedRoleMapping.role === 'driver') {
      setShowDriverRestriction(true);
      setOpenPopup(false);
      return;
    }

    const userDataWithSelectedRole = {
      ...userInfo,
      selectedRole: selectedRoleMapping,
      currentUserRole: selectedRoleMapping.role,
      currentOrganization: selectedRoleMapping.name,
      currentLonestarId: selectedRoleMapping.lonestarId,
      currentInsurerId: selectedRoleMapping.insurerId,
    };

    dispatch(loginSuccess(userDataWithSelectedRole));
    navigateBasedOnRole(selectedRoleMapping.role);
    setOpenPopup(false);
  };

  const handleBackToRoleSelection = () => {
    setShowDriverRestriction(false);
    setOpenPopup(true);
  };

  const transformedRoles =
    userInfo?.orgRoleAndScoreMapping?.map((mapping: any) => ({
      organization: mapping.name,
      role: mapping.role,
      lonestarId: mapping.lonestarId,
      insurerId: mapping.insurerId,
      policyDetails: mapping.policyDetails,
      originalMapping: mapping,
    })) || [];

  console.log('transformed roles : ', transformedRoles);

  return (
    <>
      {isPasswordUpdateRequired ? (
        <LoginContainer>
          <NewPasswordComponent onSubmit={handlePasswordUpdate} />
        </LoginContainer>
      ) : (
        <LoginContainer>
          <form id="loginForm" onSubmit={handleLogin} className="loginForm">
            <TextField
              id="username"
              value={username}
              onChange={handleUsernameChange}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              autoFocus
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="password"
              InputLabelProps={{
                shrink: true,
              }}
              value={password}
              onChange={handlePasswordChange}
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              required
            />
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
              <FormControlLabel
                sx={{ color: '#3f5c77' }}
                control={<Checkbox checked={rememberMe} onChange={handleRememberMe} />}
                label="Remember Me"
              />
              <Link href="/forgot-password" underline="always" color="error">
                Forgot Password?
              </Link>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={isLoading}
              sx={{ borderRadius: '15px' }}
            >
              Log In
            </Button>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </form>
        </LoginContainer>
      )}
      <LoaderDialog open={openDialog} message={loadingMessage} />

      <DriverRoleRestrictionDialog
        open={showDriverRestriction}
        onClose={() => setShowDriverRestriction(false)}
        onOtherRolesClick={handleBackToRoleSelection}
        logoSrc={Logo}
        restrictionImageSrc={restrictDriverLogin}
      />

      <PolicyExpirationDialog
        userInfo={userInfo}
        isOpen={isPolicyExpired}
        message={policyDetails?.message}
        warning={policyDetails?.warning}
      />

      <RoleSelectionModal
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        roles={transformedRoles}
        onSelectRole={handleSelectRole}
        userInfo={userInfo}
      />
    </>
  );
};

export default LoginPage;

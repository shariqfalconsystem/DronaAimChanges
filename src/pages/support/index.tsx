import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Container, Grid } from '@mui/material';
import { Email, Language, Phone } from '@mui/icons-material';
import SupportIllustration from '../../assets/img/support-illustration.png';
import { getUserById } from '../../services/fleetManager/driverServices';
import SupportEmailModal from './support-email-modal';
import { useSelector } from 'react-redux';
import environment from '../../environments/environment';

const SupportScreen = () => {
  const fleetUserId = useSelector((state: any) => state.auth.currentUserId);
  const [userInfo, setUserInfo] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    if (!fleetUserId) return;
    try {
      const { status, data } = await getUserById(fleetUserId);
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, [fleetUserId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const toggleModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Container maxWidth={false}>
      <Grid
        container
        spacing={2}
        sx={{
          margin: 'auto',
          padding: 3,
          background: '#fff',
        }}
      >
        <Grid item xs={12}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: '#334155', fontWeight: 'bold', textAlign: 'left', mb: 3 }}
          >
            Support
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#F1F5F9', boxShadow: 'none', px: { xs: 2, md: 4 }, borderRadius: 4 }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#334155',
                      fontWeight: 'medium',
                      mb: 4,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    <span
                      style={{
                        textDecoration: 'underline',
                        textUnderlineOffset: '10px',
                        textDecorationThickness: '3px',
                      }}
                    >
                      Please
                    </span>{' '}
                    contact us for any help and support at
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      mt: 4,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <Email sx={{ color: '#64748B', mr: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: '#334155', fontSize: '1.1rem', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={toggleModal}
                    >
                      <a>{environment.supportEmail}</a>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 4,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <Phone sx={{ color: '#64748B', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '1.1rem' }}>
                      +1(817)-865-5261
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 4,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <Language sx={{ color: '#64748B', mr: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#334155',
                        fontSize: '1.1rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        '& a': {
                          color: 'blue',
                          textDecorationColor: 'blue',
                        },
                        '& a:active': {
                          color: 'blue',
                        },
                      }}
                    >
                      <a href="https://dronaaim.ai/" target="_blank" rel="noopener noreferrer">
                        https://dronaaim.ai/
                      </a>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={SupportIllustration}
                    alt="Support illustration"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      width: { xs: '100%', md: 450 },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <SupportEmailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fleetManagerId={fleetUserId}
        fleetManagerName={userInfo?.firstName ? `${userInfo?.firstName} ${userInfo?.lastName}` : ''}
        fleetManagerEmail={userInfo?.emailId || ''}
      />
    </Container>
  );
};

export default SupportScreen;

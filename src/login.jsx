import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Checkbox, FormControlLabel, Grid, Paper, Typography, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import './login.css';
import sha256 from './HashUtil.jsx';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [isPaperVisible, setIsPaperVisible] = useState(false);
  const [isPaperFadingOut, setIsPaperFadingOut] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleCheckboxChange = (event) => {
    setRememberMe(event.target.checked);
  };

  useEffect(() => {
    setIsPaperVisible(true);
  }, []);


  


  const handleLogin = async () => {
    if (username == '' || password == '') {
      setError('用户名或密码不能为空');
      setOpenSnackbar(true);
      return;
    }

    try {


      const response = await fetch(`http://127.0.0.1:11810/user/login?username=${username}&password=${sha256(password)}`);
      const data = await response.json();
      if (!data.message.startsWith("token")) {
        setError(data.message);
        setOpenSnackbar(true);
      } else {
        let cookieOptions = {
          httpOnly: true,
          sameSite: true,
        };

        if (rememberMe) {
          cookieOptions.expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1年喵
        } else {
          cookieOptions.expires = new Date(Date.now() + 60 * 60 * 1000); // 1小时喵
        }

        document.cookie = `loginToken=${data.message.slice(5)};expires=${cookieOptions.expires.toUTCString()};path=/`;

        setIsPaperFadingOut(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('发生错误:', error);
    }
  };

  const handleRegisterButton = () => {
    setIsPaperFadingOut(true);
    setTimeout(() => {
      window.location.href = '/register';
    }, 1000);
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={10} sm={6} md={4} lg={3}>
        {isPaperVisible && (
          <Paper className={`fade-in ${isPaperFadingOut ? 'fade-out' : ''}`} elevation={4} sx={{ p: 4, borderRadius: 10 }}>
            <Box mb={4} textAlign="center">
              <Typography variant="h4" style={{ fontFamily: 'Segoe UI, sans-serif' }}>登录 LemonCloud</Typography>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="用户名"
              variant="outlined"
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="密码"
              type="password"
              variant="outlined"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <FormControlLabel control={<Checkbox />} label="记住我" checked={rememberMe} onChange={handleCheckboxChange} />
              <Button color="primary" size="small" onClick={handleRegisterButton}>我没有账号</Button>
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2, borderRadius: 20 }}
              onClick={handleLogin}
            >
              登录
            </Button>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Snackbar>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}

export default Login;

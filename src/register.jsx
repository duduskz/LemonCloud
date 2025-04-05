import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Box, Checkbox, FormControlLabel, Grid, Paper, Typography, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import './login.css';
import sha256 from './HashUtil.jsx';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [isPaperVisible, setIsPaperVisible] = useState(false);
  const [code, setCode] = useState('');
  const timerRef = useRef();
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isPaperFadingOut, setIsPaperFadingOut] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleCheckboxChange = (event) => {
    setRememberMe(event.target.checked);
  };


  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsButtonDisabled(false);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const handleSendCode = async () => {

    try {

      const response = await fetch(`http://127.0.0.1:11810/user/sendEmailCode/${encodeURIComponent(mail)}`);
      const data = await response.json();

      if (data.message !== '发送成功') {
        setError(data.message);
        setOpenSnackbar(true);
      } else {
        setIsButtonDisabled(true);
        setCountdown(60);
      }
    } catch (error) {
      setIsButtonDisabled(false);
      setCountdown(0);
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    setIsPaperVisible(true);
  }, []);



  const handleLoginButton = () => {
    setIsPaperFadingOut(true);
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  const handleRegister = async () => {

    if (username == '' || password == '' || mail == '') {
      setError('用户名 密码或邮箱不能为空');
      setOpenSnackbar(true);
      return;
    }
    const response = await fetch(`http://127.0.0.1:11810/user/register?mail=${mail}&username=${username}&password=${sha256(password)}&code=${code}`);
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
        cookieOptions.expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1年
      } else {
        cookieOptions.expires = new Date(Date.now() + 60 * 60 * 1000); // 1小时
      }

      document.cookie = `loginToken=${data.message.slice(5)};expires=${cookieOptions.expires.toUTCString()};path=/`;

      setIsPaperFadingOut(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={10} sm={6} md={4} lg={3}>
        {isPaperVisible && (
          <Paper className={`fade-in ${isPaperFadingOut ? 'fade-out' : ''}`} elevation={4} sx={{ p: 4, borderRadius: 10 }}>
            <Box mb={4} textAlign="center">
              <Typography variant="h4" style={{ fontFamily: 'Segoe UI, sans-serif' }}>注册 LemonCloud</Typography>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="邮箱"
              variant="outlined"
              size="small"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
            />
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="邮箱验证码"
                variant="outlined"
                fullWidth
                size="small"
                margin="normal"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSendCode}
                disabled={isButtonDisabled}
                sx={{ width: 120 }}
              >
                {countdown > 0 ? `${countdown}秒` : '发送'}
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <FormControlLabel control={<Checkbox />} label="记住我" checked={rememberMe} onChange={handleCheckboxChange} />
              <Button color="primary" size="small" onClick={handleLoginButton}>已有账号?</Button>
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2, borderRadius: 20 }}
              onClick={handleRegister}
            >
              注册
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

export default Register;

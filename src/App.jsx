import './index.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Avatar,
  Button,

} from "@mui/material";

import ProfilePage from './ProfilePage.jsx'
import SharePage from './SharePage.jsx'
import FilePage from './FilePage.jsx'
import MainPage from './MainPage.jsx'

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Routes, Route, Outlet } from "react-router-dom";

const cookies = Object.fromEntries(
  document.cookie.split("; ").map((c) => c.split("="))
);

function App() {


  return (
    <Routes>
      <Route element={<AppBarLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/files" element={<FilePage />} />
      </Route>

      <Route path="/share/:uuid" element={<SharePage />} />
    </Routes>
  );
}

function AppBarLayout() {
  const [avatarUrl, setAvatarUrl] = useState('/path/to/avatar.jpg');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await fetch(
        `http://127.0.0.1:11810/user/userInfo/${cookies.loginToken}`
      );

      const data = await response.json();
      setAvatarUrl(`http://127.0.0.1:11810/user/avatar/${data.avatarId}`);
    };

    fetchUserInfo();


  }, [navigate]);

  return (


    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", color: "black" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <img src="/logo.png" alt="Logo" style={{ height: 40, marginRight: 10 }} />
              <Typography variant="h6">LemonCloud</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={Link}
                to="/"
                sx={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: location.pathname === "/" ? "#bbdefb" : "transparent",
                  "&:hover": { backgroundColor: "#eee" },
                }}
              >
                首页
              </Button>

              <Button
                component={Link}
                to="/files"
                sx={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: location.pathname === "/files" ? "#bbdefb" : "transparent",
                  "&:hover": { backgroundColor: "#eee" },
                }}
              >
                文件
              </Button>


              <Avatar onClick={() => navigate("./profile")} src={avatarUrl} sx={{ bgcolor: '#2196f3', cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' } }}></Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Outlet />
    </Box>
  );
}



export default App;
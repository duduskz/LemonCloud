import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField
} from '@mui/material';
import { AssignmentInd, HealthAndSafety, Email } from '@mui/icons-material';

function Profile() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("加载中");
    const [avatarUrl, setAvatarUrl] = useState('/path/to/avatar.jpg');
    const [view, setView] = useState("main"); // 控制视图切换
    const fileInputRef = useRef(null);
    const cookies = Object.fromEntries(
        document.cookie.split("; ").map((c) => c.split("="))
    );

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:11810/user/userInfo/${cookies.loginToken}`,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const data = await response.json();
                setUsername(data.username);
                setAvatarUrl(`http://127.0.0.1:11810/user/avatar/${data.avatarId}`);
            } catch (err) { }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleFileChange = async (e) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                if (img.width !== img.height) {
                    alert('请上传正方形图片！');
                    return;
                }

                const formData = new FormData();
                formData.append('avatar', file, 'avatar.jpg');

                await fetch('http://127.0.0.1:11810/user/upload-avatar', {
                    method: 'POST',
                    headers: {
                        Authorization: `${cookies.loginToken}`
                    },
                    body: formData
                });

                setAvatarUrl(URL.createObjectURL(file));
            };
        }
    };

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

            <Avatar
                sx={{ width: 120, height: 120, mb: 2, cursor: 'pointer' }}
                src={avatarUrl}
                onClick={() => fileInputRef.current.click()}
            />
            <Typography variant="h5">{username}</Typography>
            <Typography variant="body2" color="text.secondary">
                LemonCloud账号
            </Typography>

            {/* 退出登录 */}
            <Button
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => {
                    document.cookie = "loginToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = "./login";
                }}
            >
                退出登录
            </Button>

            {/* 个人信息表单，确保居中 */}
            {view === "editProfile" && (
                <Card sx={{ mt: 4, width: "100%", maxWidth: 500 }}>
                    <CardContent>
                    <TextField label="用户名" variant="outlined" fullWidth sx={{ mb: 2 }}/>
                    <Button variant="contained" onClick={saveProfile} color="primary" fullWidth sx={{ mb: 2 }}>
                        保存更改
                    </Button>
                    <Button variant="text" onClick={() => setView("main")} fullWidth >
                        返回
                    </Button>
                    </CardContent>
                </Card>
            )}

            {view === "security" && (
                <Card sx={{ mt: 4, width: "100%", maxWidth: 500 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            修改密码
                        </Typography>
                        <TextField label="旧密码" type="password" variant="outlined" fullWidth sx={{ mb: 2 }} />
                        <TextField label="新密码" type="password" variant="outlined" fullWidth sx={{ mb: 2 }} />
                        <TextField label="确认新密码" type="password" variant="outlined" fullWidth sx={{ mb: 2 }} />
                        <Button variant="contained" color="primary" fullWidth>
                            修改密码
                        </Button>
                        <Typography variant="h6" gutterBottom>
                            最近登录地点
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            显示最近的登录位置信息（此处可动态加载）
                        </Typography>
                        <Button variant="text" onClick={() => setView("main")} fullWidth>
                            返回
                        </Button>
                    </CardContent>
                </Card>
            )}

            {view === "main" && (
                    <Grid container spacing={3} sx={{ padding: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    transition: '0.3s',
                                    '&:hover': {
                                        backgroundColor: '#fafafa',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                                onClick={() => setView("editProfile")}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AssignmentInd sx={{ fontSize: 40, color: '#333', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6">个人信息</Typography>
                                            <Typography variant="body2" color="textSecondary">修改个人信息</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    transition: '0.3s',
                                    '&:hover': {
                                        backgroundColor: '#fafafa',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                                onClick={() => setView("security")}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <HealthAndSafety sx={{ fontSize: 40, color: '#333', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6">安全设置</Typography>
                                            <Typography variant="body2" color="textSecondary">点击查看安全设置</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    transition: '0.3s',
                                    '&:hover': {
                                        backgroundColor: '#fafafa',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                                onClick={() => setView("security")}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Email sx={{ fontSize: 40, color: '#333', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6">修改邮箱</Typography>
                                            <Typography variant="body2" color="textSecondary">修改你当前绑定的邮箱</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
            )}
        </Box>
    );
}

export default Profile;

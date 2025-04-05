import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import sha256 from './HashUtil.jsx';
import {
    Avatar,
    Box,
    Button,
    Typography,
    Grid,
    Card,
    Alert,
    Snackbar,
    CardContent,
    TextField
} from '@mui/material';
import { AssignmentInd, HealthAndSafety, Email } from '@mui/icons-material';

function Profile() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("加载中");
    const [lastLoginInfo, setLastLoginInfo] = useState("加载中");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [error, setError] = useState('');
    const [newUsername, setNewUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState('/path/to/avatar.jpg');
    const [view, setView] = useState("main");
    const [oldPassword, setOldPassword] = useState("");
    const [newEmail, setNewEmail] = useState('');
    const [code, setCode] = useState('');
    const timerRef = useRef();
    const [countdown, setCountdown] = useState(0);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const fileInputRef = useRef(null);
    const cookies = Object.fromEntries(
        document.cookie.split("; ").map((c) => c.split("="))
    );

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

    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await fetch(
                `http://127.0.0.1:11810/user/userInfo/${cookies.loginToken}`
            );

            const data = await response.json();
            setUsername(data.username);
            setAvatarUrl(`http://127.0.0.1:11810/user/avatar/${data.avatarId}`);

            const loginInfo = await (await fetch(
                `http://127.0.0.1:11810/user/userLoginInfo/${cookies.loginToken}`
            )).json();
            setLastLoginInfo(loginInfo.lastLoginDate + " " + loginInfo.lastLoginAddress);
        };

        fetchUserInfo();


    }, [navigate]);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const saveProfile = async () => {
        const response = await fetch(
            `http://127.0.0.1:11810/user/editUserInfo?newUsername=${newUsername}&token=${cookies.loginToken}`
        );
        const data = await response.json();

        if (data.message !== '更改成功') {
            setError(data.message);
            setOpenSnackbar(true);
        } else {
            setUsername(newUsername);
            setView("main");
        }

    }

    const handleFileChange = async (e) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                if (img.width !== img.height) {
                    setError("请上传正方形图片");
                    setOpenSnackbar(true);
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

    const handleSendCode = async () => {

        try {

            const response = await fetch(`http://127.0.0.1:11810/user/sendEmailCode/${encodeURIComponent(newEmail)}`);
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

    const handleSubmit = async () => {


        const response = await fetch(`http://127.0.0.1:11810/user/editUserEmail?token=${cookies.loginToken}&newEmail=${encodeURIComponent(newEmail)}&code=${code}`);
        const data = await response.json();

        if (data.message !== '更改成功') {
            setError(data.message);
            setOpenSnackbar(true);
        } else {
            setView('main');
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setError("新密码与确认密码不一致");
            setOpenSnackbar(true);
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:11810/user/editPassword?token=${cookies.loginToken}&newPassword=${sha256(newPassword)}&oldPassword=${sha256(oldPassword)}`
            );

            const data = await response.json();

            if (data.message !== '更改成功') {
                setError(data.message || "密码修改失败");
                setOpenSnackbar(true);
            } else {
                setView("main");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setError("修改失败");
            setOpenSnackbar(true);
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

            {view === "editProfile" && (
                <Card sx={{ mt: 4, width: "100%", maxWidth: 500 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            修改个人资料
                        </Typography>
                        <TextField
                            label="用户名"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
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
                        <TextField
                            label="旧密码"
                            type="password"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <TextField
                            label="新密码"
                            type="password"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="确认新密码"
                            type="password"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            sx={{ mb: 2 }}
                            color="primary"
                            fullWidth
                            onClick={handlePasswordChange}
                        >
                            修改密码
                        </Button>
                        <Typography variant="h6" gutterBottom>
                            最近登录地点
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            上次登录: {lastLoginInfo}
                        </Typography>
                        <Button variant="text" onClick={() => setView("main")} fullWidth>
                            返回
                        </Button>
                    </CardContent>
                </Card>
            )}

            {view === "editEmail" && (
                <Card sx={{ mt: 4, width: "100%", maxWidth: 500 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            修改你当前的邮箱
                        </Typography>

                        <TextField
                            label="新邮箱"
                            variant="outlined"
                            fullWidth
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="邮箱验证码"
                                variant="outlined"
                                fullWidth
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // 只允许数字
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

                        <Button
                            variant="contained"
                            sx={{ mb: 3 }}
                            color="primary"
                            fullWidth
                            onClick={handleSubmit}
                        >
                            修改
                        </Button>

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
                            onClick={() => setView("editEmail")}
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

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Profile;

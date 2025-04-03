import {
    InsertDriveFile,
    GitHub,
    Storage,
    Download,
    CloudDownload
} from "@mui/icons-material";

import React, { useEffect, useState } from 'react';

const cookies = Object.fromEntries(
  document.cookie.split("; ").map((c) => c.split("="))
);



import { useNavigate } from "react-router-dom";

import {
    Typography,
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    IconButton
    

} from "@mui/material";

function MainPage() {
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [storageInfo, setStorageInfo] = useState('加载中...');
    const [recentFiles, setRecentFiles] = useState([]);

    useEffect(() => {

        if (!cookies.loginToken) {
            window.location.href = '/login';
        } else {
            const checkToken = async () => { //大坏蛋js不让effect塞异步呜呜呜
                const response = await fetch(`http://127.0.0.1:11810/user/checkToken?token=` + cookies.loginToken);
                const data = await response.json();

                if (data.message === 'Successful') { //检查登录状态喵
                    setIsAuthenticated(true);
                    fetchRecentFiles();
                    fetchStorageInfo();
                } else {
                    window.location.href = '/login';
                }
            };
            checkToken();
        }

    }, [navigate]);

    if (isAuthenticated === null) return null;

    async function fetchStorageInfo() {
        try {
            const cookies = Object.fromEntries(
                document.cookie.split("; ").map((c) => c.split("="))
            );

            const response = await fetch('http://127.0.0.1:11810/user/storage?token=' + cookies.loginToken);

            if (!response.ok) throw new Error('获取存储信息失败');

            const data = await response.text();
            setStorageInfo(data);

        } catch (error) {
            setStorageInfo('获取信息失败');
            console.error('存储空间请求错误:', error);
        }
    };

    const handleDownload = async (fullPath) => {
        try {
            const cookies = Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")));
            const token = cookies.loginToken;

            const splitIndex = fullPath.lastIndexOf('/');
            const path = fullPath.slice(0, splitIndex);
            const file = fullPath.slice(splitIndex + 1);

            const downloadUrl = `http://127.0.0.1:11810/file/download?${new URLSearchParams({
                path: encodeURIComponent(path),
                file: encodeURIComponent(file)
            })}`;

            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `${token}` //AUV我就不信了这样还能被生成直链
                }
            });

            const blob = await response.blob();
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = file;
            downloadLink.click();
            URL.revokeObjectURL(downloadLink.href);

        } catch (err) {
            console.error('介个错误不好吃，还给你', err);
        }
    };

    async function fetchRecentFiles() {
        try {
            const cookies = Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")));
            const getAllFiles = async (path = "") => {
                const response = await fetch(
                    `http://127.0.0.1:11810/file/list?path=${encodeURIComponent(path)}&token=${cookies.loginToken}`
                );
                if (!response.ok) return [];

                const data = await response.json();
                const files = [];

                for (const item of data.files) {
                    if (item.type === 'dir') {
                        const subFiles = await getAllFiles(path ? `${path}/${item.name}` : item.name);
                        files.push(...subFiles);
                    } else {
                        files.push({
                            ...item,
                            fullPath: path ? `${path}/${item.name}` : item.name
                        });
                    }
                }
                return files;
            };

            const allFiles = await getAllFiles();
            const sortedFiles = allFiles.sort(
                (a, b) => new Date(b.modified) - new Date(a.modified)
            );
            setRecentFiles(sortedFiles.slice(0, 3));
        } catch (err) {
            console.error('获取最近文件出错:', err);
            setRecentFiles([]);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>


            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: 3,
                        transition: '0.3s',
                        '&:hover': {
                            backgroundColor: '#fafafa',
                            transform: 'translateY(-2px)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Storage sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">存储空间</Typography>
                                    <Typography variant="body2" color="textSecondary">已使用 {storageInfo}</Typography>
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
                        onClick={() => window.open('https://github.com/duduskz/LemonCloud', '_blank')}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <GitHub sx={{ fontSize: 40, color: '#333', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">GitHub 仓库</Typography>
                                    <Typography variant="body2" color="textSecondary">点击跳转至LemonCloud开源仓库</Typography>
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
                        onClick={() => window.location.href = ''}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CloudDownload sx={{ fontSize: 40, color: '#00a1d6', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">下载客户端</Typography>
                                    <Typography variant="body2" color="textSecondary">未完成</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>最近的文件</Typography>
                    <List>
                        {recentFiles.map((file, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                    borderRadius: 2
                                }}
                            >
                                <InsertDriveFile sx={{ color: '#757575', mr: 2 }} />
                                <ListItemText
                                    primary={file.name}
                                    secondary={`路径: ${file.fullPath} | 修改时间: ${new Date(file.modified).toLocaleString()}`} />
                                <IconButton onClick={() => handleDownload(file.fullPath)}>
                                    <Download />
                                </IconButton>
                            </ListItem>
                        ))}
                        {recentFiles.length === 0 && (
                            <ListItem>
                                <ListItemText primary="暂无最近文件" />
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>
        </Container>


    );
}

export default MainPage;
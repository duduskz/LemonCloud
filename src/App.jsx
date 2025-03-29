import './index.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  LinearProgress, Snackbar, Alert,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Breadcrumbs,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Menu,
  MenuItem,
  CircularProgress,
  
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
  
} from "@mui/material";

import {
  Search,
  InsertDriveFile,
  CreateNewFolder,
  Folder,
  GitHub,
  Storage,
  Refresh,
  Download,
  Delete,
  Share,
  CloudUpload,
  Home,
  CloudDownload
} from "@mui/icons-material";
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";

const cookies = Object.fromEntries(
  document.cookie.split("; ").map((c) => c.split("="))
);



// 文件页面组件
function FilePage() {

  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadStatus, setUploadStatus] = useState({ open: false, message: '', severity: 'success' });
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPath, setCurrentPath] = useState(['我的网盘']);
  const [files, setFiles] = useState([
    { name: '呜, 被你抓住本喵了哦.pdf', type: 'file', size: '2MB', modified: '2025-03-29' },
    { name: '本喵的女装照.png', type: 'file', size: '29.3MB', modified: '2025-03-29' },
    { name: '好康的.pptx', type: 'file', size: '5MB', modified: '2025-03-28' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const relativePath = currentPath.slice(1).join('/');
      const response = await fetch(
        `http://127.0.0.1:11810/file/list?path=${encodeURIComponent(relativePath)}&token=${cookies.loginToken}`
      );
      
      if (!response.ok) throw new Error('获取文件列表失败');
      
      const data = await response.json();
      setFiles(data.files);
      setError('');
    } catch (err) {
      setError(err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const relativePath = currentPath.slice(1).join('/');
      const downloadUrl = `http://127.0.0.1:11810/file/download?path=${encodeURIComponent(relativePath)}&file=${encodeURIComponent(fileName)}&token=${cookies.loginToken}`;
  
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
  
    } catch (err) {
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'modified') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.modified) - new Date(b.modified)
        : new Date(b.modified) - new Date(a.modified);
    }
    return 0;
  });



  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      selectedFile: file
    });
  };

  const handleFileUpload = (e) => {
    const files = e.target?.files;
    if (!files || files.length === 0) {
      setUploadStatus({
        open: true,
        message: '未选择文件！',
        severity: 'warning'
      });
      return;
    }

    const file = files[0];

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', cookies.loginToken);

    const pathParam = currentPath.slice(1).join('/');
    formData.append('paths', pathParam);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          setUploadStatus({
            open: true,
            message: '文件上传成功！',
            severity: 'success'
          });

          fetchFiles();
        } else {

          if (xhr.status === 413) {
            setUploadStatus({
              open: true,
              message: '你的储存容量已满!',
              severity: 'error'
            });
          } else {
            setUploadStatus({
              open: true,
              message: '文件上传失败！',
              severity: 'error'
            });
          }
          
        }
        setTimeout(() => setUploadProgress(-1), 1000);
      }
    };

    xhr.open('POST', 'http://127.0.0.1:11810/file/upload', true);
    xhr.send(formData);
  };

  const handleCreateFolder = async () => {
    try {
      const relativePath = currentPath.slice(1).join('/');
      const response = await fetch('http://127.0.0.1:11810/file/createFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: cookies.loginToken,
          path: relativePath,
          folderName: folderName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建目录失败');
      }

      setNewFolderOpen(false);
      setFolderName('');
      fetchFiles(); // 刷新列表
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const fileToDelete = contextMenu.selectedFile;
      if (!fileToDelete) return;

      const response = await fetch('http://127.0.0.1:11810/file/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath.slice(1).join('/'),
          name: fileToDelete.name,
          type: fileToDelete.type,
          token: cookies.loginToken
        })
      });

      if (!response.ok) throw new Error('删除失败');
      
      fetchFiles();
      setContextMenu(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileAction = (action) => {
    console.log(`${action} ${contextMenu.selectedFile.name}`);
    setContextMenu(null);
  };


  const handleBreadcrumbClick = (index) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  // 处理文件夹点击进入子目录
  const handleFolderClick = (folderName) => {
    setCurrentPath([...currentPath, folderName]);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Breadcrumbs aria-label="路径导航" sx={{ mb: 3 }}>
        {currentPath.map((path, index) => (
          <MuiLink
            key={index}
            component={Link}
            to="#"
            onClick={() => handleBreadcrumbClick(index)}
            sx={{ 
              cursor: 'pointer',
              fontWeight: index === currentPath.length - 1 ? 'bold' : 'normal'
            }}
          >
            {path}
          </MuiLink>
        ))}
      </Breadcrumbs>
        
      <Box>
      <IconButton onClick={fetchFiles} color="primary" title="刷新">
            <Refresh />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<CreateNewFolder />}
            sx={{ ml: 2 }}
            onClick={() => setNewFolderOpen(true)}
          >
            新建文件夹
          </Button>
        
        <Button
          variant="contained"
          sx={{ ml: 2 }}
          startIcon={<CloudUpload />}
          component="label"
        >
          上传文件
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
        </Box>
        
      </Box>

      <Dialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)}>
        <DialogTitle>新建文件夹</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文件夹名称"
            fullWidth
            variant="standard"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            error={!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(folderName)}
            helperText="仅支持中文、字母、数字和下划线"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderOpen(false)}>取消</Button>
          <Button 
            onClick={handleCreateFolder}
            disabled={!folderName || !/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(folderName)}
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 300,
  zIndex: 9999
}}>
  {uploadProgress > -1 && (
    <LinearProgress 
      variant="determinate" 
      value={uploadProgress} 
      sx={{ height: 8, borderRadius: 5 }}
    />
  )}
</Box>

<Snackbar
  open={uploadStatus.open}
  autoHideDuration={3000}
  onClose={() => setUploadStatus({ ...uploadStatus, open: false })}
>
  <Alert severity={uploadStatus.severity}>
    {uploadStatus.message}
  </Alert>
</Snackbar>

<TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'name'}
                  direction={sortConfig.direction}
                  onClick={() => setSortConfig({
                    key: 'name',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  文件名
                </TableSortLabel>
              </TableCell>
              <TableCell>类型</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'modified'}
                  direction={sortConfig.direction}
                  onClick={() => setSortConfig({
                    key: 'modified',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  修改时间
                </TableSortLabel>
              </TableCell>
              <TableCell>大小</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiles.map((file) => (
              <TableRow
                key={file.name}
                hover
                onContextMenu={(event) => {
                  event.preventDefault();
                  handleContextMenu(event, file);
                }}
                onClick={() => file.type === 'dir' && handleFolderClick(file.name)}
                sx={{ cursor: file.type === 'dir' ? 'pointer' : 'default' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {file.type === 'dir' ? <Folder color="primary" /> : <InsertDriveFile />}
                  {file.name}
  </Box>
</TableCell>
                <TableCell>{file.type === 'dir' ? '文件夹' : '文件'}</TableCell>
                <TableCell>
                  {new Date(file.modified).toLocaleString()}
                </TableCell>
                <TableCell>
                  {file.type === 'dir' ? '--' : `${(file.size / 1024).toFixed(2)} KB`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleDownload(contextMenu?.selectedFile.name)}>
          <Download sx={{ mr: 1 }} /> 下载
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} /> 删除
        </MenuItem>
        <MenuItem onClick={() => handleFileAction('share')}>
          <Share sx={{ mr: 1 }} /> 分享
        </MenuItem>
      </Menu>
    </Container>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [storageInfo, setStorageInfo] = useState('加载中...');

  const fetchStorageInfo = async () => {
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

  useEffect(() => {
    
    if (!cookies.loginToken) {
      window.location.href = '/login';
    } else {
      setIsAuthenticated(true);
      fetchStorageInfo();
    }

  }, [navigate]);

  if (isAuthenticated === null) return null;



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
              
              <Avatar sx={{ bgcolor: '#2196f3', cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' }}}>U</Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {location.pathname === "/" ? (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <TextField
            fullWidth
            placeholder="搜索文件..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              style: { borderRadius: 40, backgroundColor: '#fff' }
            }}
            sx={{ mb: 4 }}
          />

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
                {[
                  { name: 'document.pdf', date: '2023-08-20' },
                  { name: 'image.jpg', date: '2023-08-19' },
                  { name: 'presentation.pptx', date: '2023-08-18' }
                ].map((file, index) => (
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
                      secondary={`最后修改: ${file.date}`}
                    />
                    <IconButton onClick={() => window.location.href = `/files/${file.name}`}>
                      <Download />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      ) : (
        <FilePage />
      )}
    </Box>
  );
}

export default App;
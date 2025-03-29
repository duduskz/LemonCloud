import './index.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  List,
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
  TextField,
  InputAdornment
} from "@mui/material";
import {
  Search,
  InsertDriveFile,
  Folder,
  GitHub,
  VideoLibrary,
  Storage,
  Download,
  Delete,
  Share,
  CloudUpload,
  Home,
  CloudDownload
} from "@mui/icons-material";
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";

// 文件页面组件
function FilePage() {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPath, setCurrentPath] = useState(['我的网盘']);
  const [files, setFiles] = useState([
    { name: 'document.pdf', type: 'file', size: '2MB', modified: '2023-08-20' },
    { name: 'images', type: 'folder', size: '--', modified: '2023-08-19' },
    { name: 'presentation.pptx', type: 'file', size: '5MB', modified: '2023-08-18' }
  ]);

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      selectedFile: file
    });
  };

  const handleFileAction = (action) => {
    console.log(`${action} ${contextMenu.selectedFile.name}`);
    setContextMenu(null);
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Breadcrumbs aria-label="路径导航">
          <MuiLink component={Link} to="/files" color="inherit">
            <Home sx={{ fontSize: 20, verticalAlign: 'middle' }} />
          </MuiLink>
          {currentPath.map((path, index) => (
            <MuiLink key={index} component={Link} to="#" color="inherit">
              {path}
            </MuiLink>
          ))}
        </Breadcrumbs>
        
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          component="label"
        >
          上传文件
          <input type="file" hidden onChange={(e) => console.log(e.target.files)} />
        </Button>
      </Box>

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
              <TableCell>大小</TableCell>
              <TableCell>修改时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiles.map((file) => (
              <TableRow
                key={file.name}
                hover
                onContextMenu={(e) => handleContextMenu(e, file)}
                onClick={() => file.type === 'folder' 
                  ? setCurrentPath([...currentPath, file.name])
                  : navigate(`/files/${file.name}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {file.type === 'folder' ? 
                    <Folder color="primary" sx={{ mr: 1 }} /> : 
                    <InsertDriveFile color="action" sx={{ mr: 1 }} />}
                  {file.name}
                </TableCell>
                <TableCell>{file.type === 'folder' ? '文件夹' : '文件'}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.modified}</TableCell>
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
        <MenuItem onClick={() => handleFileAction('download')}>
          <Download sx={{ mr: 1 }} /> 下载
        </MenuItem>
        <MenuItem onClick={() => handleFileAction('delete')}>
          <Delete sx={{ mr: 1 }} /> 删除
        </MenuItem>
        <MenuItem onClick={() => handleFileAction('share')}>
          <Share sx={{ mr: 1 }} /> 分享
        </MenuItem>
      </Menu>
    </Container>
  );
}

// 主组件
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => c.split("="))
    );
    if (!cookies.loginToken) {
      window.location.href = '/login';
    } else {
      setIsAuthenticated(true);
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
                      <Typography variant="body2" color="textSecondary">已使用 10MB / 50MB</Typography>
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
                onClick={() => window.location.href = '/download/LemonCloud.exe'}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CloudDownload sx={{ fontSize: 40, color: '#00a1d6', mr: 2 }} />
                    <Box>
                      <Typography variant="h6">下载客户端</Typography>
                      <Typography variant="body2" color="textSecondary">Windows 客户端 v1.0.0</Typography>
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
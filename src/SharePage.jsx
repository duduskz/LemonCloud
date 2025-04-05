import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function Share() {
  const { uuid } = useParams();
  const [shareRecord, setShareRecord] = useState(null);
  const [creator, setCreator] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = `http://127.0.0.1:11810/file/shareDownloader/${uuid}`;
    link.download = shareRecord.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReport = async () => {
    handleMenuClose();
    try {
      fetch(`http://127.0.0.1:11810/file/reportShare?uuid=${uuid}`);
      
      alert('举报已提交');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchShareInfo = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:11810/file/share/${uuid}`
        );
        
        const data = await response.json();

        if (data.message) {
          setError(data.message);
        } else {
          const filePathParts = data.filePath.split('/');
          data.fileName = filePathParts[filePathParts.length - 1];
          setShareRecord(data);

          const response = await fetch(
            `http://127.0.0.1:11810/user/userInfoU/${data.creator}`
        );
          setCreator((await response.json()).username);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShareInfo();
  }, [uuid]);

  const formatExpireTime = (timestamp) => {
    if (!timestamp) return '永久有效';
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', my: 2.5 }}>
        {error}
      </Alert>
    );
  }

  if (!shareRecord) {
    return (
      <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', my: 2.5 }}>
        分享的内容不存在
      </Alert>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 2.5 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={8} container alignItems="center">
            <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'grey.100' }}>
              <InsertDriveFileIcon fontSize="large" sx={{ color: 'text.secondary' }} />
            </Avatar>
            
            <Grid item sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {shareRecord.isDirectory ? `${shareRecord.fileName}.zip` : shareRecord.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`分享者: ${creator} 过期时间: ${formatExpireTime(shareRecord.expire)}`}
              </Typography>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container alignItems="center" justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                  onClick={downloadFile}
                >
                  下载
                </Button>
              </Grid>
              <Grid item>
                <IconButton 
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleReport} dense>
            举报该分享
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}

export default Share;
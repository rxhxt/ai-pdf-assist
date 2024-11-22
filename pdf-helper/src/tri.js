import React, { useEffect, useState } from 'react';
import {
  Button, TextField, Box, Paper, Typography, Card, CardContent, CardHeader, Fab,
  Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Modal, CircularProgress,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [pdfData, setPdfData] = useState([]);
  const [Faq, setFaq] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false); // For loader
  const [chatOpen, setChatOpen] = useState(false); // Chat modal state
  const [messages, setMessages] = useState([]); // Chat messages
  const [inputMessage, setInputMessage] = useState(''); // Chat input message

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setFileUrl(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert('Please select a PDF file first!');
      return;
    }

    setLoading(true); // Show loader
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5050/upload_pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data.data;
      setPdfData(data);
    } catch (error) {
      alert('Error uploading the file. Please try again.');
    }

    try {
      const faqResponse = await axios.post('http://localhost:5050/get-faq', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFaq(faqResponse.data.data);
    } catch (error) {
      alert('Error fetching FAQ data. Please try again.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

  // Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle chat box toggle
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  // Handle sending chat message
  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = { user: 'You', text: inputMessage };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.post('http://localhost:5050/chat', { message: inputMessage });
      setMessages((prev) => [...prev, { user: 'Bot', text: response.data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { user: 'Bot', text: 'Error fetching response. Try again.' }]);
    }

    setInputMessage('');
  };

  return (
    <div className="container-flex m-5">
      <Typography
        className='text-center'
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', fontSize: '2rem', mt: 4 }}
      >
        PDF Viewer
      </Typography>

      {/* Loader */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, mx: 'auto' }}>
        {/* File Upload Section */}
        <div className='row'>
          <div className='col-md-10 col-sm-12'>
            <TextField
              variant="outlined"
              placeholder="Drag and Drop or Select a PDF"
              fullWidth
              value={selectedFile ? selectedFile.name : ''}
              InputProps={{ readOnly: true }}
              onClick={() => document.getElementById('file-input').click()}
              sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
            />
            <input
              type="file"
              id="file-input"
              style={{ display: 'none' }}
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
          <div className='col-md-2 col-sm-12'>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!selectedFile}
              sx={{ alignSelf: 'flex-end', mt: 1 }}
            >
              Upload
            </Button>
          </div>
        </div>

        {/* PDF and Output Section */}
        <div className='row'>
          <div className='col-md-6 col-sm-12'>
            <Paper elevation={3} sx={{ height: 800, overflow: 'auto', p: 2 }}>
              {fileUrl && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer fileUrl={fileUrl} />
                </Worker>
              )}
            </Paper>
          </div>
          <div className='col-md-6 col-sm-12'>
            {/* PDF Data */}
            <Card variant='outlined' sx={{ backgroundColor: '#fafafa', maxHeight: '100%' }}>
              <CardHeader title="PDF Output" titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} />
              <CardContent>
                {pdfData.length ? (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ overflowY: 'scroll', maxHeight: 700 }}
                  >
                    {/* Render Tabs */}
                    <Box sx={{ width: '100%' }}>
                      <Tabs
                        value={selectedTab}
                        onChange={handleChangeTab}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {pdfData.map((page, index) => (
                          <Tab label={`Page ${page.index}`} key={page.index} />
                        ))}
                      </Tabs>
                      {pdfData.map((page, index) => (
                        <div role="tabpanel" hidden={selectedTab !== index} key={page.index}>
                          {selectedTab === index && (
                            <Box p={3}>
                              <Typography>{page.text || 'No content available'}</Typography>
                            </Box>
                          )}
                        </div>
                      ))}
                    </Box>
                  </Typography>
                ) : (
                  <Typography>Loading PDF data...</Typography>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={toggleChat}
      >
        <AddIcon />
      </Fab>

      {/* Chat Modal */}
      <Modal open={chatOpen} onClose={toggleChat}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: 400,
            height: 500,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Chat</Typography>
            <IconButton onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: '4px',
              p: 1,
              mb: 2,
            }}
          >
            {messages.map((msg, index) => (
              <Typography
                key={index}
                align={msg.user === 'You' ? 'right' : 'left'}
                sx={{ margin: '5px 0' }}
              >
                <strong>{msg.user}: </strong>{msg.text}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Type a message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={sendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
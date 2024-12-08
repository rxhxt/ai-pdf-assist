import React, { useEffect, useState } from 'react';
import {
    Button, TextField, Box, Paper, Typography, Card, CardContent, CardHeader, Fab,
    Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Modal, CircularProgress,
    IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PDFViewer from 'pdf-viewer-reactjs';
import axios from 'axios';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';
import SendIcon from '@mui/icons-material/Send';
import Navbar from './Navbar';

const useStyles = makeStyles((theme) => ({
    faqAccordionSummary: {
        backgroundColor: 'inherit',
        borderBottom: `1px solid black`,
        fontWeight: 'bold',
    },
    faqAccordionDetails: {
        backgroundColor: 'inherit',
        padding: 2,
    },
}));

function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [message, setMessage] = useState('');
    const [pdfData, setPdfData] = useState([]);
    const [Faq, setFaq] = useState('')
    const [loading, setLoading] = useState(false); // For loader
    const [chatOpen, setChatOpen] = useState(false); // Chat modal state
    const [messages, setMessages] = useState([]); // Chat messages
    const [inputMessage, setInputMessage] = useState('');
    const classes = useStyles();
    const [error, setError] = useState(null);
    const [isValidFile, setIsValidFile] = useState(true);

    // Handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setError(null);

        if (!file) {
            setSelectedFile(null);
            setFileUrl(null);
            return;
        }

        if (file.type !== 'application/pdf') {
            setError('Please select a valid PDF file');
            setIsValidFile(false);
            setSelectedFile(null);
            return;
        }

        if (file.size > 10000000) { // 10MB limit
            setError('File size too large. Please select a file under 10MB');
            setIsValidFile(false);
            setSelectedFile(null);
            return;
        }

        try {
            setSelectedFile(file);
            setFileUrl(URL.createObjectURL(file));
            setIsValidFile(true);
        } catch (err) {
            setError('Error loading file. Please try again.');
            setIsValidFile(false);
        }
    };



    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!selectedFile || !isValidFile) {
            setError('Please select a valid PDF file first!');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        

        try {
            const response = await axios.post('http://localhost:5050/upload_pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setPdfData(response.data.data || []);
            setMessage('File uploaded successfully!');

            // FAQ API call
            const faqResponse = await axios.post('http://localhost:5050/get-faq', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (faqResponse.data) {
                try {
                    const parsedFaq = typeof faqResponse.data.data === 'string'
                        ? JSON.parse(faqResponse.data.data)
                        : faqResponse.data.data;
                    setFaq(parsedFaq);
                } catch (parseError) {
                    console.error('FAQ parsing error:', parseError);
                    setError('Error processing FAQ data');
                }
            }

        } catch (error) {
            console.error('API error:', error);
            setError(error.response?.data?.message || 'Error uploading file. Please try again.');
            setPdfData([]);
            setFaq([]);
        } finally {
            setLoading(false);
        }
    };
    const [selectedTab, setSelectedTab] = useState(0);

    const handleChangeTab = (event, newValue) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        console.log(`Selected tab: ${selectedTab}`);
    }, [selectedTab]);
    const goToPrevPage = () => {
        setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
    };
    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };
    const goToNextPage = () => {
        if (numPages) {
            setPageNumber((prevPage) => Math.min(prevPage + 1, numPages));
        }
    };

    useEffect(() => {
        console.log(pdfData)
    }, [Faq, pdfData])
    const sendMessage = async () => {
        if (inputMessage.trim() === '') return;

        const newMessage = { user: 'You', text: inputMessage };
        setMessages([...messages, newMessage]);

        try {
            const response = await fetchChatResponse(inputMessage, messages);
            setMessages((prev) => [...prev, { user: 'Bot', text: response.data }]);
        } catch (error) {
            setMessages((prev) => [...prev, { user: 'Bot', text: 'Error fetching response. Try again.' }]);
        }

        setInputMessage('');
    };

    const fetchChatResponse = async (message, entireChat) => {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('chat', message);
        formData.append('complete-chat', entireChat.map((msg) => `${msg.user}: ${msg.text}`).join('\n'));
        
        try {
            const response = await axios.post('http://localhost:5050/chat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log(response.data)
            return response.data;

        } catch (error) {
            console.error('Error fetching chat response:', error);
            return 'Error fetching response. Try again.';
        }
    };

    return (
        <div className="container-flex">
            {error && (
                <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: '#ffebee',
                    color: '#c62828',
                    borderRadius: 1
                }}>
                    <Typography>{error}</Typography>
                </Box>
            )}
            <Typography
                className='text-center'
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold', fontSize: '2rem', mt: 4 }}
            >
                PDF Viewer
            </Typography>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, mx: 'auto' }}>
                <div className='row'>
                    <div className='col-md-10 col-sm-12'>
                        <TextField
                            variant="outlined"
                            placeholder="Drag and Drop or Select a PDF"
                            fullWidth
                            value={selectedFile ? selectedFile.name : ''}
                            InputProps={{
                                readOnly: true,
                            }}
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

                <div className='row'>
                    <div className='col-md-6 col-sm-12'>
                        <Paper elevation={3} sx={{ height: 800, overflow: 'auto', p: 2 }}>
                            {fileUrl && (
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                                    <ErrorBoundary>
                                        <Viewer fileUrl={fileUrl} />
                                    </ErrorBoundary>
                                </Worker>
                            )}
                        </Paper>

                    </div>
                    <div className='col-md-6 col-sm-12'>
                        <Card variant='outlined' sx={{ backgroundColor: '#fafafa', maxHeight: '100%' }}>
                            <CardHeader title="PDF Output" titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} />
                            <CardContent>
                                {pdfData ? (
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ overflowY: 'scroll', maxHeight: 700 }}
                                    >
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
                                                            {page.code.summary ? (
                                                                <Accordion sx={{
                                                                    mb: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#fafafa',
                                                                    },
                                                                    boxShadow: 'none',
                                                                    border: '1px solid #e0e0e0',
                                                                }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        sx={{
                                                                            backgroundColor: '#f5f5f5',
                                                                            '&:hover': { backgroundColor: '#eeeeee' }
                                                                        }}
                                                                    >
                                                                        <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>Code</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ p: 2 }}>
                                                                        <Typography sx={{ color: '#555', fontSize: '0.95rem' }}>
                                                                            {page.code.summary || 'No code summary available'}
                                                                        </Typography>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            ) : <div></div>}

                                                            {Array.isArray(page.equations) && page.equations.length ? (
                                                                <Accordion sx={{
                                                                    mb: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#fafafa',
                                                                    },
                                                                    boxShadow: 'none',
                                                                    border: '1px solid #e0e0e0',
                                                                }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        sx={{
                                                                            backgroundColor: '#f5f5f5',
                                                                            '&:hover': { backgroundColor: '#eeeeee' }
                                                                        }}
                                                                    >
                                                                        <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>Equations</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ p: 2 }}>
                                                                        <Typography sx={{ color: '#555', fontSize: '0.95rem' }}>
                                                                            {page.equations.length ? page.equations.join(', ') : 'No equations available'}
                                                                        </Typography>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            ) : <div></div>}

                                                            {Array.isArray(page.images) && page.images.length ? (
                                                                <Accordion sx={{
                                                                    mb: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#fafafa',
                                                                    },
                                                                    boxShadow: 'none',
                                                                    border: '1px solid #e0e0e0',
                                                                }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        sx={{
                                                                            backgroundColor: '#f5f5f5',
                                                                            '&:hover': { backgroundColor: '#eeeeee' }
                                                                        }}
                                                                    >
                                                                        <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>Images</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ p: 2 }}>
                                                                        {page.images.length ? page.images.map((image, idx) => (
                                                                            <Box
                                                                                key={idx}
                                                                                sx={{
                                                                                    py: 1,
                                                                                    borderBottom: idx < page.images.length - 1 ? '1px solid #eee' : 'none'
                                                                                }}
                                                                            >
                                                                                <Typography sx={{ color: '#555', fontSize: '0.95rem' }}>
                                                                                    <strong style={{ color: '#4169E1' }}>{image.title}:</strong> {image.description}
                                                                                </Typography>
                                                                            </Box>
                                                                        )) : 'No images available'}
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            ) : <div></div>}

                                                            {Array.isArray(page.keywords) && page.keywords.length ? (
                                                                <Accordion sx={{
                                                                    mb: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#fafafa',
                                                                    },
                                                                    boxShadow: 'none',
                                                                    border: '1px solid #e0e0e0',
                                                                }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        sx={{
                                                                            backgroundColor: '#f5f5f5',
                                                                            '&:hover': { backgroundColor: '#eeeeee' }
                                                                        }}
                                                                    >
                                                                        <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                                            Keywords
                                                                        </Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ p: 2 }}>
                                                                        {page.keywords.length ? page.keywords.map((keyword, idx) => (
                                                                            <Box
                                                                                key={idx}
                                                                                sx={{
                                                                                    py: 1,
                                                                                    borderBottom: idx < page.keywords.length - 1 ? '1px solid #eee' : 'none'
                                                                                }}
                                                                            >
                                                                                <Typography>
                                                                                    <Box component="span" sx={{
                                                                                        fontWeight: 600,
                                                                                        color: '#1a73e8',
                                                                                        mr: 1
                                                                                    }}>
                                                                                        {keyword.keyword}:
                                                                                    </Box>
                                                                                    <Box component="span" sx={{
                                                                                        color: '#555',
                                                                                        fontSize: '0.95rem'
                                                                                    }}>
                                                                                        {keyword.definitions}
                                                                                    </Box>
                                                                                </Typography>
                                                                            </Box>
                                                                        )) : 'No keywords available'}
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            ) : <div></div>}
                                                        </Box>
                                                    )}
                                                </div>
                                            ))}
                                        </Box>
                                    </Typography>
                                ) : <Typography>Loading PDF data...</Typography>}
                            </CardContent>

                        </Card>
                    </div>
                    <div className='row mt-3'>
                        <div className='col-md-12 col-sm-12'>
                            <Card variant='outlined' sx={{ p: 2 }}>
                                <CardHeader title="FAQs" titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} />
                                <CardContent>
                                    {/* Add FAQ content here */}
                                    {Faq && (
                                        Faq.map((faq, index) => (
                                            <Accordion
                                                key={index}
                                                sx={{
                                                    mb: 1,
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5',
                                                    },
                                                    boxShadow: 'none',
                                                    border: '1px solid #e0e0e0',
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    className={classes.faqAccordionSummary}
                                                    sx={{
                                                        p: 2,
                                                        '&:hover': {
                                                            backgroundColor: '#fafafa',
                                                        }
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#2c3e50',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    >
                                                        {faq.Question}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails
                                                    className={classes.faqAccordionDetails}
                                                    sx={{
                                                        p: 3,
                                                        pl: 4,
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <hr />
                                                    <Typography
                                                        sx={{
                                                            color: '#555',
                                                            lineHeight: 1.6,
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        {faq.Answer}
                                                    </Typography>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    )}

                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Box>
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={toggleChat}
            >
                <AddIcon />
            </Fab>
            <Modal open={chatOpen} onClose={toggleChat}>
    <Box
        sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: { xs: '90%', sm: 400 }, // Responsive width
            height: { xs: '80%', sm: 500 }, // Responsive height
            backgroundColor: 'white',
            border: 'none', // Remove border to make it modern
            borderRadius: '12px',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {/* Header */}
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                pb: 1,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                Chat
            </Typography>
            <IconButton onClick={toggleChat} aria-label="Close chat">
                <CloseIcon />
            </IconButton>
        </Box>

        {/* Chat Messages */}
        <Box
            sx={{
                flexGrow: 1,
                overflowY: 'auto',
                backgroundColor: '#f9f9f9', // Light background for better readability
                borderRadius: '8px',
                p: 1,
                mb: 2,
            }}
        >
            {messages.map((msg, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        justifyContent: msg.user === 'You' ? 'flex-end' : 'flex-start',
                        mb: 1,
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: msg.user === 'You' ? '#007bff' : '#e0e0e0',
                            color: msg.user === 'You' ? '#fff' : '#000',
                            borderRadius: '12px',
                            p: 1.5,
                            maxWidth: '75%',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: '500',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            <strong>{msg.user}: </strong>
                            {msg.text}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>

        {/* Message Input */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Type a message"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#fff',
                    },
                }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                sx={{
                    textTransform: 'none',
                    borderRadius: '50%',
                    minWidth: '48px',
                    minHeight: '48px',
                }}
            >
                <SendIcon />
            </Button>
        </Box>
    </Box>
</Modal>
        </div>
    );
}

export default Home;

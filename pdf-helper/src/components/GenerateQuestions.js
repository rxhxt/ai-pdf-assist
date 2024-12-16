import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Paper,
  Chip,
  OutlinedInput,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const GenerateQuestions = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [formData, setFormData] = useState({
    numQuestions: 5,
    degree: 'bachelor',
    subject: '',
    learningOutcomes: '',
    questionTypes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const degrees = [
    { value: 'junior', label: 'Junior/High School' },
    { value: 'bachelor', label: 'Bachelor\'s Degree' },
    { value: 'master', label: 'Master\'s Degree' }
  ];

  const questionTypes = [
    { value: 'fillBlanks', label: 'Fill in the Blanks' },
    { value: 'multipleChoice', label: 'Multiple Choice' },
    { value: 'trueFalse', label: 'True/False' },
    { value: 'shortAnswer', label: '1-Line Answers' },
    { value: 'longAnswer', label: '3-4 Lines Answer' }
  ];

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    formData.append('file', selectedFile);
    console.log('Form submitted:', formData);
    try {
      const response = await axios.post('http://localhost:5050/generate-questions', formData, {
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
    // Add API call logic here

  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setFileUrl(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setSelectedFile(null);
      return;
    }

    if (file.size > 35000000) { // 10MB limit
      setSelectedFile(null);
      return;
    }

    try {
      setSelectedFile(file);
      setFileUrl(URL.createObjectURL(file));
    } catch (err) {
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 4
          }}
        >
          Question Generator
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>Questions generated successfully!</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* File Upload Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Upload Content
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                  <Typography>
                    {selectedFile ? selectedFile.name : 'Drag and drop or click to upload PDF'}
                  </Typography>
                  <input
                    type="file"
                    id="file-input"
                    style={{ display: 'none' }}
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
              </Grid>

              {/* Configuration Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Question Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  name="numQuestions"
                  label="Number of Questions"
                  type="number"
                  value={formData.numQuestions}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 1, max: 20 }
                  }}
                  fullWidth
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>Degree Level</InputLabel>
                  <Select
                    required
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                  >
                    {degrees.map((degree) => (
                      <MenuItem key={degree.value} value={degree.value}>
                        {degree.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  name="subject"
                  label="Subject/Topic Name"
                  value={formData.subject}
                  onChange={handleChange}
                  fullWidth
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="learningOutcomes"
                  label="Learning Outcomes"
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  fullWidth
                  variant="filled"
                  placeholder="Enter specific learning outcomes..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>Question Types</InputLabel>
                  <Select
                    required
                    multiple
                    name="questionTypes"
                    value={formData.questionTypes}
                    onChange={handleChange}
                    input={<OutlinedInput label="Question Types" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={questionTypes.find(type => type.value === value)?.label}
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              '&:hover': { backgroundColor: '#bbdefb' }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {questionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || !selectedFile}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2 30%, #2196F3 90%)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Generate Questions'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default GenerateQuestions;
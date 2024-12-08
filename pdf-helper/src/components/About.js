// about.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Description, 
  Analytics, 
  QuestionAnswer,
  Speed,
  Security,
  Psychology
} from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <Description />,
      title: "PDF Analysis",
      description: "Advanced PDF parsing and content extraction"
    },
    {
      icon: <Analytics />,
      title: "Smart Analytics",
      description: "In-depth analysis of document structure and content"
    },
    {
      icon: <QuestionAnswer />,
      title: "Question Generation",
      description: "AI-powered question generation from document content"
    },
    // {
    //   icon: <Speed />,
    //   title: "Fast Processing",
    //   description: "Quick and efficient document processing"
    // },
    // {
    //   icon: <Security />,
    //   title: "Secure",
    //   description: "Enterprise-grade security for your documents"
    // },
    {
      icon: <Psychology />,
      title: "AI Powered",
      description: "Advanced AI algorithms for better results"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 4
          }}
        >
          About PDF Analyzer
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Transforming the way you interact with PDF documents
        </Typography>
        <Divider sx={{ mb: 6 }} />
      </Box>

      {/* Mission Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Mission
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Help students to understand and learn from their study materials by providing a platform 
          that can analyze, assist and generate questions from PDF documents.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Key Features
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Technology Stack */}
      <Paper elevation={3} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Technology Stack
        </Typography>
        <List>
          {[
            'React.js',
            'Material-UI',
            'Gemini',
            'Flask',
            'Python'
          ].map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%' 
                  }} 
                />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Contact Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Get in Touch
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Have questions? I'd love to hear from you. Send me a message and I'll respond as soon as possible.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'primary.main' }}>
          contact@pdfanalyzer.com
        </Typography> */}
      </Box>
    </Container>
  );
};

export default About;
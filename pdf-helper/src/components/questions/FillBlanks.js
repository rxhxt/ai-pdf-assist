// src/components/questions/QuestionTypes/FillBlanks.js
import React from 'react';
import { TextField, Typography, Box } from '@mui/material';

const FillBlanks = ({ question, index, answer, onChange, showAnswers }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {index + 1}. {question.question}
      </Typography>
      <TextField
        fullWidth
        value={answer || ''}
        onChange={(e) => onChange(index, e.target.value)}
        disabled={showAnswers}
      />
      {showAnswers && (
        <Typography sx={{ mt: 1, color: 'green' }}>
          Correct Answer: {question.answer}
        </Typography>
      )}
    </Box>
  );
};

export default FillBlanks;
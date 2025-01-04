// src/components/questions/QuestionTypes/LongAnswer.js
import React from 'react';
import { TextField, Typography, Box } from '@mui/material';

const LongAnswer = ({ question, index, answer, onChange, showAnswers }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {index + 1}. {question.question}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={answer || ''}
        onChange={(e) => onChange(index, e.target.value)}
        disabled={showAnswers}
      />
      {showAnswers && (
        <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
          Sample Answer: {question.answer}
        </Typography>
      )}
    </Box>
  );
};

export default LongAnswer;
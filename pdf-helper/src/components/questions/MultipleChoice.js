// src/components/questions/QuestionTypes/MultipleChoice.js
import React from 'react';
import { Typography, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';

const MultipleChoice = ({ question, index, answer, onChange, showAnswers }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {index + 1}. {question.question}
      </Typography>
      <RadioGroup
        value={answer || ''}
        onChange={(e) => onChange(index, e.target.value)}
      >
        {question.options.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio />}
            label={option}
            sx={{
              backgroundColor: showAnswers 
                ? option === question.correctAnswer 
                  ? '#e8f5e9'
                  : answer === option 
                    ? '#ffebee'
                    : 'transparent'
                : 'transparent',
              borderRadius: 1,
              mb: 1
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default MultipleChoice;
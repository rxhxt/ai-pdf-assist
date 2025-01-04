// src/components/questions/Questions.js
import React, { useEffect, useState } from 'react';
import { Paper, Typography, Button, Box, Divider, Alert } from '@mui/material';
import QuestionTemplate from './QuestionTemplate';
import { use } from 'react';

const Questions = ({ data }) => {
  const [answers, setAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setShowAnswers(true);
  };
  useEffect(() => {
    console.log('data', data);
    }, [data]);

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }} style={{textAlign: "center"}}>
        {data.title}
      </Typography>

      {data.questions.map((question, index) => (
        <QuestionTemplate
          key={index}
          question={question}
          index={index}
          answer={answers[index]}
          onChange={handleAnswerChange}
          showAnswers={showAnswers}
        />
      ))}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          onClick={calculateScore}
          disabled={showAnswers}
        >
          Submit Quiz
        </Button>
        {showAnswers && (
          <Alert severity="info">
            Your Score: {score}/{data.questions.length}
          </Alert>
        )}
      </Box>

      {showAnswers && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Answer Key
          </Typography>
          {Object.entries(data.answerKey).map(([number, answer]) => (
            <Typography key={number}>
              Question {number}: {String(answer)}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default Questions;
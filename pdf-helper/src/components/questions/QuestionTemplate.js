// src/components/questions/QuestionTemplate.js
import React from 'react';
import { Box } from '@mui/material';
import FillBlanks from './FillBlanks';
import MultipleChoice from './MultipleChoice';
import TrueFalse from './TrueFalse';
import ShortAnswer from './ShortAnswer';
import LongAnswer from './LongAnswer';

const QuestionTemplate = ({ question, index, answer, onChange, showAnswers }) => {
  const components = {
    fillBlanks: FillBlanks,
    multipleChoice: MultipleChoice,
    trueFalse: TrueFalse,
    shortAnswer: ShortAnswer,
    longAnswer: LongAnswer,
    application: LongAnswer,

  };

  const Component = components[question.type];

  if (!Component) {
    return <Box sx={{ mb: 3 }}>Invalid question type: {question.type}</Box>;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Component
        question={question}
        index={index}
        answer={answer}
        onChange={onChange}
        showAnswers={showAnswers}
      />
    </Box>
  );
};

export default QuestionTemplate;
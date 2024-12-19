import questionsData from '../utils/questionsData';
import answersData from '../utils/answersData';


// Wrap the mock data in Promise-based functions, simulating an async fetch.
// Introduce a pattern that mirrors real API calls, making it easier to switch to a backend later.
export async function getQuestions() {
  // Simulate a fetch call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(questionsData);
    }, 200); 
  });
}

export async function getAnswersForQuestion(questionId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredAnswers = answersData.filter(a => a.questionId === questionId);
      resolve(filteredAnswers);
    }, 200);
  });
}

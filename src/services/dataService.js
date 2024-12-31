import questionsData from '../utils/questionsData';
import answersData from '../utils/answersData';
import storiesData from '../utils/storiesData';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

// Example function for questions
export async function getQuestions() {
  const qCol = collection(db, "questions");
  const qSnapshot = await getDocs(qCol);
  const questions = qSnapshot.docs.map(doc => doc.data());
  // questions should already have the fields you need
  return questions;
}

// Similarly, for answers:
export async function getAnswersForQuestion(questionId) {
  const answersRef = collection(db, "answers");
  const q = query(answersRef, where("questionId", "==", questionId));
  // const querySnapshot = await getDocs(q);
  // // const answers = querySnapshot.docs.map(doc => doc.data());
  // return querySnapshot.docs;
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (error) {
    console.error("Error fetching answers:", error);
    return [];
  }
};

// For stories:
export async function getStories() {
  const sCol = collection(db, "stories");
  const sSnapshot = await getDocs(sCol);
  const stories = sSnapshot.docs.map(doc => doc.data());
  return stories;
}

// Adding a new story (example):
export async function addStory(story) {
  const sCol = collection(db, "stories");
  await addDoc(sCol, story);
}



// // Wrap the mock data in Promise-based functions, simulating an async fetch.
// // Introduce a pattern that mirrors real API calls, making it easier to switch to a backend later.
// export async function getQuestions() {
//   // Simulate a fetch call
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(questionsData);
//     }, 200); 
//   });
// }

// export async function getAnswersForQuestion(questionId) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const filteredAnswers = answersData.filter(a => a.questionId === questionId);
//       resolve(filteredAnswers);
//     }, 200);
//   });
// }

// export async function getStories() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(storiesData);
//     }, 200);
//   });
// }

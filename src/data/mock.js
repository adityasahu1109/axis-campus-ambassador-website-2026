// This is our fake database for now
export const MOCK_LEADERBOARD = [
  { id: 1, rank: 1, name: "Aarav Sharma", points: 1250 },
  { id: 2, rank: 2, name: "Saanvi Chen", points: 1180 },
  { id: 3, rank: 3, name: "Vivaan Gupta", points: 1120 },
  { id: 4, rank: 4, name: "Myra Singh", points: 1050 },
  { id: 5, rank: 5, name: "Aditya Sahu", points: 980 },
  { id: 6, rank: 6, name: "Reyansh Kumar", points: 920 },
  { id: 7, rank: 7, name: "Diya Patel", points: 850 },
  { id: 8, rank: 8, name: "Kabir Das", points: 780 },
  { id: 9, rank: 9, name: "Ishaan Mehra", points: 710 },
  { id: 10, rank: 10, name: "Anika Reddy", points: 650 },
];

export const MOCK_TASKS = [
  { id: 101, title: "Share poster on Instagram", points: 50, status: "Pending Review" },
  { id: 102, title: "Get 5 friends to register", points: 150, status: "Approved" },
  { id: 103, title: "Write a blog post", points: 300, status: "Not Started" },
  { id: 104, title: "Share event on LinkedIn", points: 75, status: "Approved" },
];

export const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Sharma", points: 1250, tasksCompleted: 4 },
  { id: 5, name: "Aditya Sahu", points: 980, tasksCompleted: 3 },
  { id: 7, name: "Diya Patel", points: 850, tasksCompleted: 3 },
  { id: 8, name: "Kabir Das", points: 780, tasksCompleted: 2 },
];

export const MOCK_CURRENT_USER = {
  id: 5,
  name: "Aditya Sahu",
  email: "aditya@college.com",
};
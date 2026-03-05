/**
 * GATE Subject-wise Questions Database
 * This file stores all the questions for different GATE subjects
 * Each question follows a standard structure for the mock test generator
 */

export const gateQuestions = [
  // ============= TREES (DSA) =============
  {
    id: "q1",
    exam: "GATE",
    subject: "DSA",
    topic: "Trees",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the time complexity of searching in a binary search tree?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n^2)"
    ],
    answer: 1 // Index of correct answer
  },
  {
    id: "q2",
    exam: "GATE",
    subject: "DSA",
    topic: "Trees",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "In which traversal does the root come first?",
    options: [
      "Inorder",
      "Postorder",
      "Preorder",
      "Level order"
    ],
    answer: 2
  },
  {
    id: "q3",
    exam: "GATE",
    subject: "DSA",
    topic: "Trees",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the height of a balanced binary search tree with 100 nodes?",
    options: [
      "7",
      "8",
      "12",
      "50"
    ],
    answer: 0
  },

  // ============= GRAPHS (DSA) =============
  {
    id: "q4",
    exam: "GATE",
    subject: "DSA",
    topic: "Graphs",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "Which data structure is used for BFS (Breadth-First Search)?",
    options: [
      "Stack",
      "Queue",
      "Deque",
      "Priority Queue"
    ],
    answer: 1
  },
  {
    id: "q5",
    exam: "GATE",
    subject: "DSA",
    topic: "Graphs",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity of Dijkstra's algorithm using min-heap?",
    options: [
      "O(V^2)",
      "O(E log V)",
      "O(V + E)",
      "O(V * E)"
    ],
    answer: 1
  },
  {
    id: "q6",
    exam: "GATE",
    subject: "DSA",
    topic: "Graphs",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "Which algorithm finds the shortest path in a graph with negative edges?",
    options: [
      "Dijkstra",
      "Kruskal",
      "Bellman-Ford",
      "Floyd-Warshall"
    ],
    answer: 2
  },

  // ============= ARRAYS & SORTING (DSA) =============
  {
    id: "q7",
    exam: "GATE",
    subject: "DSA",
    topic: "Arrays",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the time complexity of linear search?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    answer: 2
  },
  {
    id: "q8",
    exam: "GATE",
    subject: "DSA",
    topic: "Sorting",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "Which sorting algorithm has O(n log n) worst-case time complexity?",
    options: [
      "Bubble Sort",
      "Insertion Sort",
      "Merge Sort",
      "Selection Sort"
    ],
    answer: 2
  },
  {
    id: "q9",
    exam: "GATE",
    subject: "DSA",
    topic: "Sorting",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the space complexity of Quick Sort?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    answer: 1
  },

  // ============= DYNAMIC PROGRAMMING (DSA) =============
  {
    id: "q10",
    exam: "GATE",
    subject: "DSA",
    topic: "DP",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the principle of dynamic programming called?",
    options: [
      "Greedy",
      "Optimal Substructure",
      "Divide and Conquer",
      "Backtracking"
    ],
    answer: 1
  },
  {
    id: "q11",
    exam: "GATE",
    subject: "DSA",
    topic: "DP",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "How many ways can you reach (n, n) in a grid from (0, 0)?",
    options: [
      "2^n",
      "n^2",
      "C(2n, n)",
      "n!"
    ],
    answer: 2
  },
  {
    id: "q12",
    exam: "GATE",
    subject: "DSA",
    topic: "DP",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity of the Longest Common Subsequence problem?",
    options: [
      "O(n)",
      "O(n^2)",
      "O(2^n)",
      "O(n log n)"
    ],
    answer: 1
  },

  // ============= HASHING (DSA) =============
  {
    id: "q13",
    exam: "GATE",
    subject: "DSA",
    topic: "Hashing",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the average time complexity for hash table lookup?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n^2)"
    ],
    answer: 0
  },
  {
    id: "q14",
    exam: "GATE",
    subject: "DSA",
    topic: "Hashing",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "Which collision resolution technique maintains a linked list?",
    options: [
      "Open Addressing",
      "Linear Probing",
      "Chaining",
      "Double Hashing"
    ],
    answer: 2
  },
  {
    id: "q15",
    exam: "GATE",
    subject: "DSA",
    topic: "Hashing",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the load factor in a hash table?",
    options: [
      "Number of elements / Hash table size",
      "Hash table size / Number of elements",
      "Number of collisions",
      "Hash function complexity"
    ],
    answer: 0
  },

  // ============= QUEUES & STACKS (DSA) =============
  {
    id: "q16",
    exam: "GATE",
    subject: "DSA",
    topic: "Stacks",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What does LIFO stand for?",
    options: [
      "Last In First Out",
      "Last In First Over",
      "Linear In First Out",
      "None of the above"
    ],
    answer: 0
  },
  {
    id: "q17",
    exam: "GATE",
    subject: "DSA",
    topic: "Queues",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity of enqueue and dequeue operations in a queue?",
    options: [
      "O(n)",
      "O(log n)",
      "O(1)",
      "O(n^2)"
    ],
    answer: 2
  },
  {
    id: "q18",
    exam: "GATE",
    subject: "DSA",
    topic: "Stacks",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "How can you implement a queue using two stacks?",
    options: [
      "Not possible",
      "Use one stack for push and transfer to second for pop",
      "Use both stacks interchangeably",
      "Always use stack 1 for both operations"
    ],
    answer: 1
  },

  // ============= LINKED LISTS (DSA) =============
  {
    id: "q19",
    exam: "GATE",
    subject: "DSA",
    topic: "LinkedLists",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the space complexity of a singly linked list with n nodes?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n^2)"
    ],
    answer: 2
  },
  {
    id: "q20",
    exam: "GATE",
    subject: "DSA",
    topic: "LinkedLists",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity to find the middle of a linked list?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n^2)"
    ],
    answer: 2
  }
];

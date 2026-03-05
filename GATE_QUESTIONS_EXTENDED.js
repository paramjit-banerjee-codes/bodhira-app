/**
 * GATE QUESTIONS - EXTENDED SAMPLE BANK
 * 
 * This file contains additional GATE questions you can add to your database.
 * Copy and paste these into backend/data/gateQuestions.js to expand your question bank.
 * 
 * Format:
 * - id: Unique identifier (q21, q22, etc. - continue from existing questions)
 * - exam: "GATE"
 * - subject: "DSA", "OS", "CN", "DBMS", etc.
 * - topic: Specific topic within subject
 * - difficulty: "easy", "medium", "hard"
 * - marks: 1 or 2
 * - type: "MCQ"
 * - question: The question text
 * - options: Array of 4 options
 * - answer: Index of correct answer (0, 1, 2, or 3)
 * 
 * TO ADD MORE QUESTIONS:
 * 1. Copy questions from this file
 * 2. Paste into backend/data/gateQuestions.js
 * 3. Change id from "example_q1" to "q21", "q22", etc. (continuing the sequence)
 * 4. Adjust subject/topic as needed
 */

export const extendedGateQuestions = [
  // ============ TREES ============
  {
    id: "q21",
    exam: "GATE",
    subject: "DSA",
    topic: "Trees",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "What is the minimum height of an AVL tree with 15 nodes?",
    options: ["3", "4", "5", "6"],
    answer: 0
  },

  {
    id: "q22",
    exam: "GATE",
    subject: "DSA",
    topic: "Trees",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "In a Red-Black tree, what can be the maximum height compared to a balanced BST?",
    options: ["Same", "2 times", "3 times", "4 times"],
    answer: 1
  },

  // ============ GRAPHS ============
  {
    id: "q23",
    exam: "GATE",
    subject: "DSA",
    topic: "Graphs",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the time complexity of Dijkstra's algorithm using a min-heap?",
    options: ["O(V^2)", "O(E log V)", "O(V log V)", "O(E^2)"],
    answer: 1
  },

  {
    id: "q24",
    exam: "GATE",
    subject: "DSA",
    topic: "Graphs",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "Which of the following graphs cannot be represented using adjacency matrix?",
    options: ["Directed graph", "Undirected graph", "Weighted graph", "All can be represented"],
    answer: 3
  },

  // ============ ARRAYS ============
  {
    id: "q25",
    exam: "GATE",
    subject: "DSA",
    topic: "Arrays",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 2
  },

  {
    id: "q26",
    exam: "GATE",
    subject: "DSA",
    topic: "Arrays",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "In quick sort, what is the expected time complexity with random pivot selection?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(n^1.5)"],
    answer: 1
  },

  // ============ LINKED LISTS ============
  {
    id: "q27",
    exam: "GATE",
    subject: "DSA",
    topic: "LinkedLists",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the time complexity to find middle element in a linked list?",
    options: ["O(1)", "O(n)", "O(n/2)", "O(log n)"],
    answer: 1
  },

  {
    id: "q28",
    exam: "GATE",
    subject: "DSA",
    topic: "LinkedLists",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "How many pointers does a node in a doubly linked list have?",
    options: ["1", "2", "3", "4"],
    answer: 1
  },

  // ============ STACKS & QUEUES ============
  {
    id: "q29",
    exam: "GATE",
    subject: "DSA",
    topic: "Stacks",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "What data structure is used to check balanced parentheses?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    answer: 1
  },

  {
    id: "q30",
    exam: "GATE",
    subject: "DSA",
    topic: "Queues",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "Which principle does a queue follow?",
    options: ["LIFO", "FIFO", "FILO", "LIFL"],
    answer: 1
  },

  // ============ DYNAMIC PROGRAMMING ============
  {
    id: "q31",
    exam: "GATE",
    subject: "DSA",
    topic: "DP",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is the time complexity of computing Fibonacci numbers using dynamic programming?",
    options: ["O(n)", "O(2^n)", "O(log n)", "O(n log n)"],
    answer: 0
  },

  {
    id: "q32",
    exam: "GATE",
    subject: "DSA",
    topic: "DP",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "In the Longest Increasing Subsequence problem, what is the recurrence relation?",
    options: [
      "LIS(n) = max(LIS(n-1), arr[n] + LIS(n-1))",
      "LIS(n) = LIS(n-1) + 1",
      "LIS(i) = max(1, LIS(j) + 1) for all j < i where arr[j] < arr[i]",
      "LIS(n) = 2^n"
    ],
    answer: 2
  },

  // ============ HASHING ============
  {
    id: "q33",
    exam: "GATE",
    subject: "DSA",
    topic: "Hashing",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "What is the best case time complexity for hash table insertion?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    answer: 0
  },

  {
    id: "q34",
    exam: "GATE",
    subject: "DSA",
    topic: "Hashing",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "Which collision resolution technique uses chaining?",
    options: ["Linear probing", "Quadratic probing", "Separate chaining", "Double hashing"],
    answer: 2
  },

  // ============ SORTING ============
  {
    id: "q35",
    exam: "GATE",
    subject: "DSA",
    topic: "Sorting",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "Which sorting algorithm is stable?",
    options: ["Quick sort", "Heap sort", "Merge sort", "All"],
    answer: 2
  },

  {
    id: "q36",
    exam: "GATE",
    subject: "DSA",
    topic: "Sorting",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the worst-case time complexity of heap sort?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
    answer: 1
  },

  // ============ OPERATING SYSTEMS ============
  {
    id: "q37",
    exam: "GATE",
    subject: "OS",
    topic: "Processes",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "How many states can a process be in?",
    options: ["2", "3", "4", "5"],
    answer: 2
  },

  {
    id: "q38",
    exam: "GATE",
    subject: "OS",
    topic: "Scheduling",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "Which scheduling algorithm minimizes average waiting time?",
    options: ["FCFS", "Shortest Job First", "Round Robin", "Priority"],
    answer: 1
  },

  {
    id: "q39",
    exam: "GATE",
    subject: "OS",
    topic: "Memory",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "What is thrashing in memory management?",
    options: [
      "Too many page replacements",
      "Memory overflow",
      "Cache miss",
      "CPU under-utilization"
    ],
    answer: 0
  },

  {
    id: "q40",
    exam: "GATE",
    subject: "OS",
    topic: "Deadlock",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "Which condition is NOT necessary for deadlock?",
    options: [
      "Mutual exclusion",
      "Hold and wait",
      "No preemption",
      "Random wait"
    ],
    answer: 3
  },

  // ============ COMPUTER NETWORKS ============
  {
    id: "q41",
    exam: "GATE",
    subject: "CN",
    topic: "TCP/IP",
    difficulty: "easy",
    marks: 1,
    type: "MCQ",
    question: "Which layer is responsible for routing?",
    options: [
      "Data Link Layer",
      "Network Layer",
      "Transport Layer",
      "Application Layer"
    ],
    answer: 1
  },

  {
    id: "q42",
    exam: "GATE",
    subject: "CN",
    topic: "Protocols",
    difficulty: "medium",
    marks: 1,
    type: "MCQ",
    question: "What is the default port number for HTTP?",
    options: ["80", "443", "25", "53"],
    answer: 0
  },

  {
    id: "q43",
    exam: "GATE",
    subject: "CN",
    topic: "Routing",
    difficulty: "medium",
    marks: 2,
    type: "MCQ",
    question: "Which routing protocol is distance-vector based?",
    options: ["OSPF", "RIP", "ISIS", "BGP"],
    answer: 1
  },

  {
    id: "q44",
    exam: "GATE",
    subject: "CN",
    topic: "Congestion",
    difficulty: "hard",
    marks: 2,
    type: "MCQ",
    question: "What is the main purpose of congestion control in TCP?",
    options: [
      "To maximize throughput",
      "To prevent network collapse",
      "To reduce latency",
      "To improve reliability"
    ],
    answer: 1
  }
];

/**
 * ============ INSTRUCTIONS FOR ADDING THESE QUESTIONS ============
 * 
 * 1. Open backend/data/gateQuestions.js
 * 
 * 2. Find the last question (currently ends with id: "q20")
 * 
 * 3. After the last question, add a comma:
 *    },  // Add comma here after last question
 * 
 * 4. Copy the questions array from extendedGateQuestions above
 * 
 * 5. The file should look like:
 *    export const gateQuestions = [
 *      { id: "q1", ... },
 *      { id: "q2", ... },
 *      ...
 *      { id: "q20", ... },  // ← Add comma here
 *      { id: "q21", ... },  // ← New questions start
 *      { id: "q22", ... },
 *      ...
 *      { id: "q44", ... }
 *    ];
 * 
 * 6. Save the file
 * 
 * 7. Test: node backend/utils/testGenerator.js
 * 
 * You should now see "Total: 44 questions" instead of 20!
 * 
 * ============ CONTINUE ADDING MORE ============
 * 
 * - This file has 24 additional questions (q21-q44)
 * - You have 44 total questions
 * - To get 50+ questions for full GATE tests, add 10-20 more
 * - Can find more GATE questions from official GATE websites
 * - Each subject (DSA, OS, CN, DBMS) should have 40+ questions
 * 
 */
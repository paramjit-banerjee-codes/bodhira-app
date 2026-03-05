import { 
  Brain, Zap, Settings, Calculator, TrendingUp, 
  Microscope, FileText, Briefcase, Shield, Building 
} from 'lucide-react';

export const mockExams = [
  {
    id: 'gate-cse',
    name: 'GATE CSE',
    fullName: 'Graduate Aptitude Test in Engineering - Computer Science',
    icon: Brain,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    description: 'Computer Science & Engineering entrance for M.Tech/PhD admissions at IITs, NITs & top institutions',
    duration: '180 min',
    durationValue: 180,
    questions: '65',
    questionsValue: 65,
    totalMarks: '100',
    rating: '4.9',
    difficulty: 'Mixed',
    sections: [
      {
        name: 'General Aptitude',
        icon: 'FileText',
        iconColor: '#8B5CF6',
        questions: 10,
        marks: 15
      },
      {
        name: 'Engineering Mathematics',
        icon: 'Calculator',
        iconColor: '#3B82F6',
        questions: 13,
        marks: 13
      },
      {
        name: 'Computer Science',
        icon: 'Brain',
        iconColor: '#10B981',
        questions: 42,
        marks: 72
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -1,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'gate-ece',
    name: 'GATE ECE',
    fullName: 'Graduate Aptitude Test in Engineering - Electronics & Communication',
    icon: Zap,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
    description: 'Electronics & Communication Engineering postgraduate entrance examination',
    duration: '180 min',
    durationValue: 180,
    questions: '65',
    questionsValue: 65,
    totalMarks: '100',
    rating: '4.8',
    difficulty: 'Mixed',
    sections: [
      {
        name: 'General Aptitude',
        icon: 'FileText',
        iconColor: '#8B5CF6',
        questions: 10,
        marks: 15
      },
      {
        name: 'Engineering Mathematics',
        icon: 'Calculator',
        iconColor: '#3B82F6',
        questions: 13,
        marks: 13
      },
      {
        name: 'Electronics & Communication',
        icon: 'Zap',
        iconColor: '#06B6D4',
        questions: 42,
        marks: 72
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -1,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'gate-me',
    name: 'GATE ME',
    fullName: 'Graduate Aptitude Test in Engineering - Mechanical',
    icon: Settings,
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
    description: 'Mechanical Engineering entrance for IITs, NITs, and PSU recruitment',
    duration: '180 min',
    durationValue: 180,
    questions: '65',
    questionsValue: 65,
    totalMarks: '100',
    rating: '4.7',
    difficulty: 'Mixed',
    sections: [
      {
        name: 'General Aptitude',
        icon: 'FileText',
        iconColor: '#8B5CF6',
        questions: 10,
        marks: 15
      },
      {
        name: 'Engineering Mathematics',
        icon: 'Calculator',
        iconColor: '#3B82F6',
        questions: 13,
        marks: 13
      },
      {
        name: 'Mechanical Engineering',
        icon: 'Settings',
        iconColor: '#F97316',
        questions: 42,
        marks: 72
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -1,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'jee-main',
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination Main',
    icon: Calculator,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    description: 'National engineering entrance for admission to IITs, NITs, IIITs, and CFTIs',
    duration: '180 min',
    durationValue: 180,
    questions: '90',
    questionsValue: 90,
    totalMarks: '300',
    rating: '4.9',
    difficulty: 'Mixed',
    sections: [
      {
        name: 'Physics',
        icon: 'Zap',
        iconColor: '#F59E0B',
        questions: 30,
        marks: 100
      },
      {
        name: 'Chemistry',
        icon: 'Microscope',
        iconColor: '#10B981',
        questions: 30,
        marks: 100
      },
      {
        name: 'Mathematics',
        icon: 'Calculator',
        iconColor: '#3B82F6',
        questions: 30,
        marks: 100
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -1,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 25,
      medium: 50,
      hard: 25
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'jee-advanced',
    name: 'JEE Advanced',
    fullName: 'Joint Entrance Examination Advanced',
    icon: TrendingUp,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    description: 'Advanced engineering entrance for IITs',
    duration: '180 min',
    durationValue: 180,
    questions: '54',
    questionsValue: 54,
    totalMarks: '360',
    rating: '4.8',
    difficulty: 'Hard',
    sections: [
      {
        name: 'Physics',
        icon: 'Zap',
        iconColor: '#F59E0B',
        questions: 18,
        marks: 120
      },
      {
        name: 'Chemistry',
        icon: 'Microscope',
        iconColor: '#10B981',
        questions: 18,
        marks: 120
      },
      {
        name: 'Mathematics',
        icon: 'Calculator',
        iconColor: '#3B82F6',
        questions: 18,
        marks: 120
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -2,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 15,
      medium: 45,
      hard: 40
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'neet-ug',
    name: 'NEET UG',
    fullName: 'National Eligibility cum Entrance Test - Undergraduate',
    icon: Microscope,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    description: 'National medical entrance examination for MBBS/BDS admissions across India',
    duration: '180 min',
    durationValue: 180,
    questions: '180',
    questionsValue: 180,
    totalMarks: '720',
    rating: '4.9',
    difficulty: 'Mixed',
    sections: [
      {
        name: 'Physics',
        icon: 'Zap',
        iconColor: '#F59E0B',
        questions: 45,
        marks: 180
      },
      {
        name: 'Chemistry',
        icon: 'Microscope',
        iconColor: '#10B981',
        questions: 45,
        marks: 180
      },
      {
        name: 'Biology',
        icon: 'Brain',
        iconColor: '#10B981',
        questions: 90,
        marks: 360
      }
    ],
    markingScheme: {
      correct: 4,
      wrong: -1,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 35,
      medium: 45,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    fullName: 'Staff Selection Commission - Combined Graduate Level',
    icon: FileText,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    description: 'Combined Graduate Level exam for various Group B & C posts in government',
    duration: '60 min',
    durationValue: 60,
    questions: '100',
    questionsValue: 100,
    totalMarks: '200',
    rating: '4.7',
    difficulty: 'Medium',
    sections: [
      {
        name: 'General Intelligence',
        icon: 'Brain',
        iconColor: '#8B5CF6',
        questions: 25,
        marks: 50
      },
      {
        name: 'General Awareness',
        icon: 'FileText',
        iconColor: '#3B82F6',
        questions: 25,
        marks: 50
      },
      {
        name: 'Quantitative Aptitude',
        icon: 'Calculator',
        iconColor: '#F59E0B',
        questions: 25,
        marks: 50
      },
      {
        name: 'English Comprehension',
        icon: 'FileText',
        iconColor: '#10B981',
        questions: 25,
        marks: 50
      }
    ],
    markingScheme: {
      correct: 2,
      wrong: -0.5,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 40,
      medium: 40,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'banking-po',
    name: 'Banking PO',
    fullName: 'Banking Probationary Officer',
    icon: Briefcase,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    description: 'Probationary Officer examination for nationalized and public sector banks',
    duration: '120 min',
    durationValue: 120,
    questions: '100',
    questionsValue: 100,
    totalMarks: '100',
    rating: '4.6',
    difficulty: 'Medium',
    sections: [
      {
        name: 'English Language',
        icon: 'FileText',
        iconColor: '#10B981',
        questions: 30,
        marks: 30
      },
      {
        name: 'Quantitative Aptitude',
        icon: 'Calculator',
        iconColor: '#F59E0B',
        questions: 35,
        marks: 35
      },
      {
        name: 'Reasoning Ability',
        icon: 'Brain',
        iconColor: '#8B5CF6',
        questions: 35,
        marks: 35
      }
    ],
    markingScheme: {
      correct: 1,
      wrong: -0.25,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 35,
      medium: 45,
      hard: 20
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'upsc-prelims',
    name: 'UPSC Prelims',
    fullName: 'Union Public Service Commission - Civil Services Prelims',
    icon: Shield,
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    description: 'Civil Services preliminary examination',
    duration: '240 min',
    durationValue: 240,
    questions: '200',
    questionsValue: 200,
    totalMarks: '400',
    rating: '4.8',
    difficulty: 'Hard',
    sections: [
      {
        name: 'General Studies Paper I',
        icon: 'FileText',
        iconColor: '#6366F1',
        questions: 100,
        marks: 200
      },
      {
        name: 'General Studies Paper II (CSAT)',
        icon: 'Brain',
        iconColor: '#8B5CF6',
        questions: 100,
        marks: 200
      }
    ],
    markingScheme: {
      correct: 2,
      wrong: -0.66,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 25,
      medium: 50,
      hard: 25
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  },
  {
    id: 'railway-rrb',
    name: 'Railway RRB',
    fullName: 'Railway Recruitment Board Exam',
    icon: Building,
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
    description: 'Railway Recruitment Board entrance exam',
    duration: '90 min',
    durationValue: 90,
    questions: '100',
    questionsValue: 100,
    totalMarks: '100',
    rating: '4.5',
    difficulty: 'Medium',
    sections: [
      {
        name: 'General Awareness',
        icon: 'FileText',
        iconColor: '#3B82F6',
        questions: 50,
        marks: 50
      },
      {
        name: 'Mathematics',
        icon: 'Calculator',
        iconColor: '#F59E0B',
        questions: 25,
        marks: 25
      },
      {
        name: 'General Intelligence',
        icon: 'Brain',
        iconColor: '#8B5CF6',
        questions: 25,
        marks: 25
      }
    ],
    markingScheme: {
      correct: 1,
      wrong: -0.33,
      unattempted: 0
    },
    difficultyDistribution: {
      easy: 40,
      medium: 45,
      hard: 15
    },
    instructions: [
      'This test is AI-generated and follows real exam patterns',
      'Test generation takes 10-15 seconds',
      'Once started, the timer cannot be paused',
      'All questions must be answered in one sitting',
      'Results will be available immediately after submission'
    ]
  }
];

export const getExamById = (id) => {
  return mockExams.find(exam => exam.id === id);
};

export const getExamsByCategory = (category) => {
  const categories = {
    engineering: ['gate-cse', 'gate-ece', 'gate-me', 'jee-main', 'jee-advanced'],
    medical: ['neet-ug'],
    government: ['ssc-cgl', 'upsc-prelims', 'railway-rrb'],
    banking: ['banking-po']
  };
  
  return mockExams.filter(exam => categories[category]?.includes(exam.id));
};

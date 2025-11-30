export const sectors = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 
  'Retail', 'Agriculture', 'Creative Arts', 'Hospitality', 'Construction'
];

export const skills = [
  'Programming', 'Data Analysis', 'Communication', 'Leadership', 'Design',
  'Marketing', 'Sales', 'Project Management', 'Research', 'Writing',
  'Problem Solving', 'Teamwork', 'Time Management', 'Critical Thinking'
];

export const qualifications = [
  '10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate', 'PhD'
];

export const streams = [
  'Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Management'
];

export const careerAspirations = [
  'Software Developer', 'Data Scientist', 'Business Analyst', 'Designer',
  'Marketing Manager', 'Project Manager', 'Entrepreneur', 'Consultant',
  'Teacher', 'Healthcare Professional', 'Financial Analyst', 'Content Creator'
];

export const pathways = [
  {
    id: '1',
    title: 'Full Stack Web Development',
    description: 'Comprehensive pathway to become a full-stack developer with hands-on projects',
    sector: 'Technology',
    duration: '12 months',
    nsqfLevel: 5,
    mode: 'Online',
    steps: [
      { title: 'HTML & CSS Fundamentals', duration: '4 weeks', nsqfLevel: 3, mode: 'Online', provider: 'FreeCodeCamp' },
      { title: 'JavaScript Essentials', duration: '6 weeks', nsqfLevel: 4, mode: 'Online', provider: 'Udemy' },
      { title: 'React.js Development', duration: '8 weeks', nsqfLevel: 5, mode: 'Online', provider: 'Coursera' },
      { title: 'Node.js Backend', duration: '6 weeks', nsqfLevel: 5, mode: 'Online', provider: 'Pluralsight' },
      { title: 'Database Management', duration: '4 weeks', nsqfLevel: 4, mode: 'Online', provider: 'MongoDB University' },
      { title: 'Full Stack Capstone Project', duration: '6 weeks', nsqfLevel: 6, mode: 'Online', provider: 'Self-paced' }
    ],
    jobOpportunities: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Developer'],
    skillDemand: 'High',
    tags: ['Web Development', 'JavaScript', 'React', 'Node.js']
  },
  {
    id: '2',
    title: 'Digital Marketing Specialist',
    description: 'Master digital marketing strategies from SEO to social media advertising',
    sector: 'Marketing',
    duration: '8 months',
    nsqfLevel: 4,
    mode: 'Hybrid',
    steps: [
      { title: 'Marketing Fundamentals', duration: '3 weeks', nsqfLevel: 3, mode: 'Online', provider: 'Google Digital Garage' },
      { title: 'SEO & Content Marketing', duration: '6 weeks', nsqfLevel: 4, mode: 'Online', provider: 'HubSpot Academy' },
      { title: 'Social Media Marketing', duration: '5 weeks', nsqfLevel: 4, mode: 'Online', provider: 'Facebook Blueprint' },
      { title: 'Google Ads Certification', duration: '4 weeks', nsqfLevel: 4, mode: 'Online', provider: 'Google' },
      { title: 'Analytics & Data-Driven Marketing', duration: '4 weeks', nsqfLevel: 5, mode: 'Online', provider: 'Google Analytics Academy' },
      { title: 'Marketing Campaign Project', duration: '6 weeks', nsqfLevel: 5, mode: 'Hybrid', provider: 'Self-paced' }
    ],
    jobOpportunities: ['Digital Marketing Manager', 'SEO Specialist', 'Social Media Manager', 'Content Strategist'],
    skillDemand: 'Very High',
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics']
  },
  {
    id: '3',
    title: 'Data Science & Analytics',
    description: 'Learn data analysis, machine learning, and visualization techniques',
    sector: 'Technology',
    duration: '10 months',
    nsqfLevel: 6,
    mode: 'Online',
    steps: [
      { title: 'Python for Data Science', duration: '5 weeks', nsqfLevel: 4, mode: 'Online', provider: 'DataCamp' },
      { title: 'Statistics & Probability', duration: '4 weeks', nsqfLevel: 5, mode: 'Online', provider: 'Khan Academy' },
      { title: 'Data Visualization', duration: '4 weeks', nsqfLevel: 5, mode: 'Online', provider: 'Tableau' },
      { title: 'Machine Learning Basics', duration: '8 weeks', nsqfLevel: 6, mode: 'Online', provider: 'Coursera' },
      { title: 'Deep Learning', duration: '6 weeks', nsqfLevel: 6, mode: 'Online', provider: 'Fast.ai' },
      { title: 'Capstone: Real-world Data Project', duration: '6 weeks', nsqfLevel: 7, mode: 'Online', provider: 'Self-paced' }
    ],
    jobOpportunities: ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Intelligence Analyst'],
    skillDemand: 'Extremely High',
    tags: ['Data Science', 'Python', 'Machine Learning', 'Analytics']
  }
];

export const courses = [
  {
    id: '1',
    title: 'HTML & CSS Fundamentals',
    provider: 'FreeCodeCamp',
    duration: '4 weeks',
    mode: 'Online',
    nsqfLevel: 3,
    description: 'Learn the basics of HTML and CSS to create beautiful web pages',
    learningOutcomes: [
      'Understand HTML structure and semantic tags',
      'Style web pages with CSS',
      'Create responsive layouts',
      'Build your first website'
    ]
  },
  {
    id: '2',
    title: 'JavaScript Essentials',
    provider: 'Udemy',
    duration: '6 weeks',
    mode: 'Online',
    nsqfLevel: 4,
    description: 'Master JavaScript fundamentals and modern ES6+ features',
    learningOutcomes: [
      'Understand JavaScript syntax and data types',
      'Work with functions and objects',
      'Handle asynchronous operations',
      'Build interactive web applications'
    ]
  }
];

export const diagnosticQuestions = [
  {
    id: 1,
    question: 'What is your primary reason for seeking skill development?',
    options: [
      'Career change',
      'Upskilling in current role',
      'Starting a new career',
      'Personal interest'
    ]
  },
  {
    id: 2,
    question: 'How comfortable are you with technology?',
    options: [
      'Very comfortable',
      'Somewhat comfortable',
      'Basic knowledge',
      'Complete beginner'
    ]
  },
  {
    id: 3,
    question: 'What is your preferred learning style?',
    options: [
      'Visual (videos, diagrams)',
      'Reading (articles, documentation)',
      'Hands-on (projects, practice)',
      'Interactive (live sessions)'
    ]
  },
  {
    id: 4,
    question: 'How many hours per week can you dedicate to learning?',
    options: [
      'Less than 5 hours',
      '5-10 hours',
      '10-20 hours',
      'More than 20 hours'
    ]
  },
  {
    id: 5,
    question: 'What motivates you to learn new skills?',
    options: [
      'Better job opportunities',
      'Higher salary',
      'Personal growth',
      'Passion for the subject'
    ]
  },
  {
    id: 6,
    question: 'How do you prefer to work?',
    options: [
      'Independently',
      'In small groups',
      'In large teams',
      'Mix of both'
    ]
  },
  {
    id: 7,
    question: 'What is your approach to problem-solving?',
    options: [
      'Analytical and methodical',
      'Creative and intuitive',
      'Collaborative',
      'Trial and error'
    ]
  },
  {
    id: 8,
    question: 'How important is certification to you?',
    options: [
      'Very important',
      'Somewhat important',
      'Not very important',
      'Not important at all'
    ]
  }
];

export const feedbackIssues = [
  'Courses not relevant to my goals',
  'Duration too long',
  'Duration too short',
  'Budget constraints',
  'Difficulty level mismatch',
  'Lack of practical projects',
  'Poor course quality',
  'Limited job opportunities',
  'Other'
];

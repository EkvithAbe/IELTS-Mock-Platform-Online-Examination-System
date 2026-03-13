// Run this script to seed sample test modules
// Usage: node scripts/seedTestModules.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import models
const TestModule = require('../models/TestModule').default;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Sample test modules
const sampleModules = [
  // Academic Listening
  {
    title: 'IELTS Academic Listening Test 1',
    description: 'Full-length IELTS Academic Listening test with authentic audio recordings',
    testType: 'Academic',
    moduleType: 'listening',
    price: 15,
    duration: 30,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      audioUrl: '/audio/academic-listening-1.mp3',
      transcript: 'Sample transcript for the listening test...',
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'multiple_choice',
        question: 'What is the main topic of the conversation?',
        options: ['University accommodation', 'Course selection', 'Library facilities', 'Student visa'],
        correctAnswer: 'University accommodation',
        marks: 1,
        explanation: 'The conversation primarily discusses accommodation options for new students.',
      },
      {
        questionNumber: 2,
        questionType: 'fill_blanks',
        question: 'The apartment is located on _____ street.',
        correctAnswer: 'Oxford',
        marks: 1,
      },
      {
        questionNumber: 3,
        questionType: 'multiple_choice',
        question: 'How much is the monthly rent?',
        options: ['$800', '$900', '$1000', '$1100'],
        correctAnswer: '$900',
        marks: 1,
      },
    ],
    instructions: 'Listen to the audio carefully. You will hear it only once. Answer all questions.',
    tags: ['listening', 'academic', 'intermediate'],
  },

  // Academic Reading
  {
    title: 'IELTS Academic Reading Test 1',
    description: 'Practice reading academic texts with various question types',
    testType: 'Academic',
    moduleType: 'reading',
    price: 15,
    duration: 60,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      passages: [
        {
          title: 'The Evolution of Artificial Intelligence',
          text: 'Artificial Intelligence (AI) has undergone remarkable transformation since its inception in the 1950s. Early pioneers in the field, such as Alan Turing and John McCarthy, laid the groundwork for what would become one of the most influential technologies of the modern era...',
        },
      ],
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'true_false_ng',
        question: 'Alan Turing was one of the early pioneers of AI.',
        correctAnswer: 'True',
        marks: 1,
      },
      {
        questionNumber: 2,
        questionType: 'multiple_choice',
        question: 'When did AI research begin?',
        options: ['1940s', '1950s', '1960s', '1970s'],
        correctAnswer: '1950s',
        marks: 1,
      },
      {
        questionNumber: 3,
        questionType: 'sentence_completion',
        question: 'AI has become one of the most _____ technologies of the modern era.',
        correctAnswer: 'influential',
        marks: 1,
      },
    ],
    instructions: 'Read the passage carefully and answer all questions. You have 60 minutes to complete this test.',
    tags: ['reading', 'academic', 'intermediate'],
  },

  // Academic Writing
  {
    title: 'IELTS Academic Writing Test 1',
    description: 'Practice academic writing with Task 1 and Task 2',
    testType: 'Academic',
    moduleType: 'writing',
    price: 25,
    duration: 60,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      tasks: [
        {
          taskNumber: 1,
          taskType: 'graph_description',
          prompt: 'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.',
          wordLimit: 150,
          instructions: 'Write at least 150 words. You should spend about 20 minutes on this task.',
        },
        {
          taskNumber: 2,
          taskType: 'essay',
          prompt: 'Some people believe that technology has made our lives more complicated. Others think that it has made our lives easier.\n\nDiscuss both views and give your own opinion.',
          wordLimit: 250,
          instructions: 'Write at least 250 words. You should spend about 40 minutes on this task.',
        },
      ],
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'short_answer',
        question: 'Task 1: Graph Description',
        marks: 6,
      },
      {
        questionNumber: 2,
        questionType: 'short_answer',
        question: 'Task 2: Essay Writing',
        marks: 9,
      },
    ],
    instructions: 'Complete both tasks. Task 1 should be at least 150 words and Task 2 should be at least 250 words.',
    tags: ['writing', 'academic', 'essay'],
  },

  // Academic Speaking
  {
    title: 'IELTS Academic Speaking Test 1',
    description: 'Full speaking test with all three parts',
    testType: 'Academic',
    moduleType: 'speaking',
    price: 30,
    duration: 15,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      parts: [
        {
          partNumber: 1,
          partName: 'Introduction and Interview',
          duration: 5,
          questions: [
            'What is your full name?',
            'Where are you from?',
            'Do you work or study?',
            'What do you like about your hometown?',
            'Do you prefer spending time with family or friends?',
          ],
        },
        {
          partNumber: 2,
          partName: 'Long Turn',
          duration: 4,
          questions: [
            'Describe a place you visited that you particularly enjoyed. You should say:\n- Where it was\n- When you visited it\n- What you did there\n- And explain why you enjoyed it',
          ],
        },
        {
          partNumber: 3,
          partName: 'Discussion',
          duration: 5,
          questions: [
            'What are the benefits of traveling?',
            'How has tourism changed in your country?',
            'Do you think tourism has positive or negative effects on local communities?',
          ],
        },
      ],
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'short_answer',
        question: 'Speaking Part 1, 2, and 3',
        marks: 9,
      },
    ],
    instructions: 'Record your responses to all questions. Speak clearly and naturally.',
    tags: ['speaking', 'academic', 'interview'],
  },

  // General Training Listening
  {
    title: 'IELTS General Training Listening Test 1',
    description: 'Practice listening comprehension with everyday scenarios',
    testType: 'General',
    moduleType: 'listening',
    price: 15,
    duration: 30,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      audioUrl: '/audio/general-listening-1.mp3',
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'multiple_choice',
        question: 'What time does the shop close on weekdays?',
        options: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
        correctAnswer: '6:00 PM',
        marks: 1,
      },
      {
        questionNumber: 2,
        questionType: 'fill_blanks',
        question: 'The customer wants to buy a _____ for his wife.',
        correctAnswer: 'watch',
        marks: 1,
      },
    ],
    instructions: 'Listen carefully and answer all questions.',
    tags: ['listening', 'general', 'everyday'],
  },

  // General Training Reading
  {
    title: 'IELTS General Training Reading Test 1',
    description: 'Reading test with everyday texts and work-related materials',
    testType: 'General',
    moduleType: 'reading',
    price: 15,
    duration: 60,
    difficulty: 'intermediate',
    isActive: true,
    isPremium: true,
    content: {
      passages: [
        {
          title: 'Notice: Community Center Activities',
          text: 'The community center is pleased to announce our new schedule of activities for the autumn season. We now offer yoga classes on Monday and Wednesday evenings from 6-7 PM...',
        },
      ],
    },
    questions: [
      {
        questionNumber: 1,
        questionType: 'true_false_ng',
        question: 'Yoga classes are available on weekdays.',
        correctAnswer: 'True',
        marks: 1,
      },
      {
        questionNumber: 2,
        questionType: 'multiple_choice',
        question: 'What time do yoga classes start?',
        options: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
        correctAnswer: '6:00 PM',
        marks: 1,
      },
    ],
    instructions: 'Read all passages carefully and answer the questions.',
    tags: ['reading', 'general', 'everyday'],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test modules
    console.log('\nClearing existing test modules...');
    await TestModule.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert sample modules
    console.log('\nInserting sample test modules...');
    const inserted = await TestModule.insertMany(sampleModules);
    console.log(`✅ Inserted ${inserted.length} test modules`);

    console.log('\n📊 Summary:');
    const academic = inserted.filter(m => m.testType === 'Academic');
    const general = inserted.filter(m => m.testType === 'General');
    
    console.log(`- Academic modules: ${academic.length}`);
    console.log(`- General Training modules: ${general.length}`);
    console.log(`- Total modules: ${inserted.length}`);

    console.log('\n✨ Sample data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();

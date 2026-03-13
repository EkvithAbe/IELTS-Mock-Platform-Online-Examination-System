// Sample IELTS Quiz Data

export const readingQuiz = {
  id: 'reading-001',
  title: 'IELTS Academic Reading Test',
  duration: 60, // minutes
  passages: [
    {
      id: 'passage-1',
      title: 'The History of Chocolate',
      text: `Chocolate, derived from the cacao bean, has a rich history dating back over 3,000 years. The ancient Mayans and Aztecs valued cacao so highly that they used the beans as currency. They also prepared a bitter beverage from cacao beans, which was reserved for royalty and religious ceremonies.

When Spanish conquistadors arrived in the Americas in the 16th century, they brought cacao beans back to Europe. Initially, chocolate remained a luxury item, accessible only to the wealthy. However, during the Industrial Revolution, new processing methods made chocolate more affordable and accessible to the masses.

The invention of the cocoa press by Coenraad van Houten in 1828 revolutionized chocolate production. This press could separate cocoa butter from roasted cacao beans, leaving behind a fine cocoa powder. This innovation made it possible to create solid chocolate bars, which became increasingly popular throughout the 19th century.

Today, chocolate is enjoyed worldwide in various forms, from dark and milk chocolate to white chocolate and countless confections. The global chocolate industry is worth billions of dollars, yet many cacao farmers in developing countries continue to face economic challenges.`,
    },
    {
      id: 'passage-2',
      title: 'Artificial Intelligence in Healthcare',
      text: `Artificial Intelligence (AI) is transforming healthcare in unprecedented ways. Machine learning algorithms can now analyze medical images with accuracy that rivals or exceeds human radiologists. These systems can detect subtle patterns in X-rays, MRIs, and CT scans that might be missed by the human eye.

Beyond diagnostics, AI is being used to predict patient outcomes, personalize treatment plans, and accelerate drug discovery. For instance, AI algorithms can analyze a patient's genetic information, medical history, and lifestyle factors to recommend the most effective treatment options.

However, the integration of AI in healthcare raises important ethical questions. Privacy concerns arise when vast amounts of patient data are collected and analyzed. There are also questions about accountability when AI systems make incorrect diagnoses or treatment recommendations.

Despite these challenges, experts believe AI will continue to play an increasingly important role in healthcare. The key is to develop robust regulations and ethical frameworks that protect patients while allowing innovation to flourish.`,
    },
    {
      id: 'passage-3',
      title: 'Urban Green Spaces',
      text: `Urban green spaces—parks, gardens, and natural areas within cities—provide numerous benefits to city dwellers. Research has shown that access to green spaces improves mental health, reduces stress, and encourages physical activity. People who live near parks report higher levels of life satisfaction and community engagement.

From an environmental perspective, urban green spaces help combat climate change by absorbing carbon dioxide and reducing the urban heat island effect. Trees and vegetation in cities can lower ambient temperatures by several degrees, reducing the need for air conditioning and consequently lowering energy consumption.

Green spaces also support biodiversity by providing habitats for various species of birds, insects, and small mammals. This urban biodiversity is essential for maintaining ecological balance and can serve educational purposes, helping city residents connect with nature.

However, creating and maintaining urban green spaces presents challenges. Land in cities is expensive and often in high demand for development. Ensuring equitable access to green spaces is another concern, as low-income neighborhoods often have fewer parks and natural areas than affluent districts.`,
    },
  ],
  questions: [
    // Passage 1 Questions
    {
      id: 'q1',
      passageId: 'passage-1',
      questionNumber: 1,
      questionType: 'multiple_choice',
      question: 'According to the passage, the ancient Mayans and Aztecs:',
      options: [
        'Sold chocolate to Europeans',
        'Used cacao beans as money',
        'Invented the cocoa press',
        'Made chocolate bars',
      ],
      correctAnswer: 1,
      marks: 1,
    },
    {
      id: 'q2',
      passageId: 'passage-1',
      questionNumber: 2,
      questionType: 'true_false_ng',
      question: 'Chocolate was immediately affordable when it arrived in Europe.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 1,
      marks: 1,
    },
    {
      id: 'q3',
      passageId: 'passage-1',
      questionNumber: 3,
      questionType: 'fill_blanks',
      question: 'The cocoa press invented by Coenraad van Houten could separate _____ from roasted cacao beans.',
      correctAnswer: 'cocoa butter',
      marks: 1,
    },
    {
      id: 'q4',
      passageId: 'passage-1',
      questionNumber: 4,
      questionType: 'multiple_choice',
      question: 'What enabled the creation of solid chocolate bars?',
      options: [
        'Spanish conquistadors',
        'The Mayan civilization',
        'The cocoa press invention',
        'The Industrial Revolution',
      ],
      correctAnswer: 2,
      marks: 1,
    },
    {
      id: 'q5',
      passageId: 'passage-1',
      questionNumber: 5,
      questionType: 'true_false_ng',
      question: 'All cacao farmers today earn substantial income from chocolate production.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 1,
      marks: 1,
    },

    // Passage 2 Questions
    {
      id: 'q6',
      passageId: 'passage-2',
      questionNumber: 6,
      questionType: 'multiple_choice',
      question: 'According to the passage, AI in healthcare can:',
      options: [
        'Only analyze X-rays',
        'Replace all doctors',
        'Analyze medical images with high accuracy',
        'Cure all diseases',
      ],
      correctAnswer: 2,
      marks: 1,
    },
    {
      id: 'q7',
      passageId: 'passage-2',
      questionNumber: 7,
      questionType: 'fill_blanks',
      question: 'AI algorithms can analyze genetic information and _____ factors to recommend treatments.',
      correctAnswer: 'lifestyle',
      marks: 1,
    },
    {
      id: 'q8',
      passageId: 'passage-2',
      questionNumber: 8,
      questionType: 'true_false_ng',
      question: 'There are no ethical concerns about using AI in healthcare.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 1,
      marks: 1,
    },
    {
      id: 'q9',
      passageId: 'passage-2',
      questionNumber: 9,
      questionType: 'multiple_choice',
      question: 'What is mentioned as a concern regarding AI in healthcare?',
      options: [
        'High costs',
        'Privacy and accountability issues',
        'Lack of technology',
        'Too many doctors',
      ],
      correctAnswer: 1,
      marks: 1,
    },
    {
      id: 'q10',
      passageId: 'passage-2',
      questionNumber: 10,
      questionType: 'true_false_ng',
      question: 'Experts believe AI will become less important in healthcare in the future.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 1,
      marks: 1,
    },

    // Passage 3 Questions
    {
      id: 'q11',
      passageId: 'passage-3',
      questionNumber: 11,
      questionType: 'multiple_choice',
      question: 'Urban green spaces provide all of the following benefits EXCEPT:',
      options: [
        'Improved mental health',
        'Reduced stress',
        'Increased property values',
        'Encouraged physical activity',
      ],
      correctAnswer: 2,
      marks: 1,
    },
    {
      id: 'q12',
      passageId: 'passage-3',
      questionNumber: 12,
      questionType: 'fill_blanks',
      question: 'Trees and vegetation can lower ambient temperatures by absorbing _____ dioxide.',
      correctAnswer: 'carbon',
      marks: 1,
    },
    {
      id: 'q13',
      passageId: 'passage-3',
      questionNumber: 13,
      questionType: 'true_false_ng',
      question: 'Urban green spaces support biodiversity by providing habitats for various species.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 0,
      marks: 1,
    },
    {
      id: 'q14',
      passageId: 'passage-3',
      questionNumber: 14,
      questionType: 'multiple_choice',
      question: 'What challenge is mentioned regarding urban green spaces?',
      options: [
        'Too many trees',
        'Expensive city land',
        'Lack of interest',
        'No wildlife',
      ],
      correctAnswer: 1,
      marks: 1,
    },
    {
      id: 'q15',
      passageId: 'passage-3',
      questionNumber: 15,
      questionType: 'true_false_ng',
      question: 'Low-income neighborhoods typically have the same access to green spaces as affluent areas.',
      options: ['True', 'False', 'Not Given'],
      correctAnswer: 1,
      marks: 1,
    },
  ],
};

export const writingQuiz = {
  id: 'writing-001',
  title: 'IELTS Academic Writing Test',
  duration: 60, // minutes
  tasks: [
    {
      id: 'task-1',
      taskNumber: 1,
      taskType: 'Data Description',
      duration: 20,
      wordLimit: 150,
      prompt: `The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
      instructions: `You should spend about 20 minutes on this task.

Task 1 Guidelines:
• Write at least 150 words
• Describe the main trends and features
• Make relevant comparisons
• Do not give your opinion
• Use formal academic language`,
      imageUrl: '/images/chart-sample.png', // Placeholder
    },
    {
      id: 'task-2',
      taskNumber: 2,
      taskType: 'Essay',
      duration: 40,
      wordLimit: 250,
      prompt: `Some people believe that the government should provide free education at all levels (primary, secondary, and tertiary). Others believe that students should pay for their university education.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
      instructions: `You should spend about 40 minutes on this task.

Task 2 Guidelines:
• Write at least 250 words
• Present a clear position throughout
• Support your ideas with examples
• Use formal academic language
• Organize your essay with clear paragraphs`,
    },
  ],
};

export const listeningQuiz = {
  id: 'listening-001',
  title: 'IELTS Listening Test',
  duration: 30,
  audioUrl: '/audio/listening-test.mp3', // Placeholder
  sections: [
    {
      id: 'section-1',
      title: 'Section 1: Conversation',
      description: 'A conversation between two people in a social context',
    },
    {
      id: 'section-2',
      title: 'Section 2: Monologue',
      description: 'A monologue in a social context',
    },
    {
      id: 'section-3',
      title: 'Section 3: Discussion',
      description: 'A conversation in an educational or training context',
    },
    {
      id: 'section-4',
      title: 'Section 4: Lecture',
      description: 'A monologue on an academic subject',
    },
  ],
  questions: [
    // Sample questions - would need actual audio
    {
      id: 'q1',
      sectionId: 'section-1',
      questionNumber: 1,
      questionType: 'fill_blanks',
      question: 'The customer wants to book a room for _____ nights.',
      correctAnswer: 'three',
      marks: 1,
    },
    // ... more questions
  ],
};

export const speakingQuiz = {
  id: 'speaking-001',
  title: 'IELTS Speaking Test',
  duration: 15,
  parts: [
    {
      id: 'part-1',
      partNumber: 1,
      partName: 'Introduction and Interview',
      duration: 5,
      description: 'General questions about yourself and familiar topics',
      questions: [
        'What is your full name?',
        'Can I see your identification?',
        'Where are you from?',
        'Do you work or are you a student?',
        'What do you enjoy most about your studies/job?',
        'Do you have any hobbies?',
        'What do you like to do in your free time?',
      ],
    },
    {
      id: 'part-2',
      partNumber: 2,
      partName: 'Individual Long Turn',
      duration: 4,
      description: 'Speak for 2 minutes on a given topic',
      topic: `Describe a book that you have read and enjoyed.

You should say:
• What the book was about
• When you read it
• Why you chose to read it
• And explain why you enjoyed reading it

You will have 1 minute to prepare. You can make notes if you wish.`,
      preparationTime: 1,
      speakingTime: 2,
    },
    {
      id: 'part-3',
      partNumber: 3,
      partName: 'Two-way Discussion',
      duration: 5,
      description: 'Discuss abstract ideas related to Part 2 topic',
      questions: [
        'What kinds of books are popular in your country?',
        'Do you think reading books is important? Why?',
        'How has technology changed the way people read?',
        'Do you think traditional books will disappear in the future?',
        'What are the advantages of reading compared to watching TV?',
      ],
    },
  ],
};

import ProjectCard from "./components/ProjectCard";
import React, { useState } from 'react';
import { BookOpen, Zap, Target, Award, Users, CheckCircle, ArrowRight, MessageCircle, Play, Upload, Search, Filter, Moon, Sun } from 'lucide-react';

// Mock Claude API for development
if (!window.claude) {
  window.claude = {
    complete: async (prompt) => {
      const responses = [
        "Great question! When designing PCB layouts, always consider your signal integrity first. Keep high-speed traces short and avoid sharp angles.",
        "For power distribution, make sure to use adequate copper pour and place decoupling capacitors close to your ICs.",
        "Ground planes are crucial for EMI reduction. Try to maintain a solid ground plane and avoid splitting it unnecessarily.",
        "When routing differential pairs, maintain consistent spacing and length matching to preserve signal quality.",
        "Component placement is key - group related components together and consider thermal management for power components."
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };
}

const TraceTutorDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your PCB design tutor. What would you like to learn about today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLearningPath, setSelectedLearningPath] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const projects = [
    {
      id: 1,
      title: 'LED Blinker Circuit',
      difficulty: 'Beginner',
      description: 'Learn basic PCB layout with a simple LED blinker using a 555 timer',
      duration: '30 min',
      skills: ['Schematic Design', 'Basic Routing', 'Component Placement'],
      tags: ['led', 'timer', '555', 'beginner', 'basic', 'blinker']
    },
    {
      id: 2,
      title: 'Arduino Shield',
      difficulty: 'Intermediate',
      description: 'Design a custom Arduino shield with sensors and connectors',
      duration: '2 hours',
      skills: ['Multi-layer Design', 'Connector Design', 'Power Distribution'],
      tags: ['arduino', 'shield', 'sensors', 'connectors', 'microcontroller']
    },
    {
      id: 3,
      title: 'Audio Amplifier',
      difficulty: 'Advanced',
      description: 'Create a high-quality audio amplifier with proper ground planes',
      duration: '4 hours',
      skills: ['Analog Design', 'EMI Considerations', 'Thermal Management'],
      tags: ['audio', 'amplifier', 'analog', 'ground planes', 'emi', 'thermal']
    },
    {
      id: 4,
      title: 'Power Supply Module',
      difficulty: 'Intermediate',
      description: 'Design a switching power supply with proper isolation and filtering',
      duration: '3 hours',
      skills: ['Power Electronics', 'Isolation Design', 'Noise Filtering'],
      tags: ['power', 'supply', 'switching', 'isolation', 'filtering']
    },
    {
      id: 5,
      title: 'IoT Sensor Board',
      difficulty: 'Intermediate',
      description: 'Create a wireless sensor board with WiFi connectivity and low power design',
      duration: '2.5 hours',
      skills: ['Wireless Design', 'Low Power', 'Sensor Integration'],
      tags: ['iot', 'sensor', 'wifi', 'wireless', 'low power', 'esp32']
    },
    {
      id: 6,
      title: 'Motor Controller',
      difficulty: 'Advanced',
      description: 'Design a high-current motor controller with proper heat dissipation',
      duration: '5 hours',
      skills: ['High Current Design', 'Thermal Management', 'Motor Control'],
      tags: ['motor', 'controller', 'high current', 'thermal', 'mosfet']
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: "Complete Beginner to PCB Designer",
      description: "Start from zero and build your way up to designing complex PCBs",
      duration: "8-12 weeks",
      difficulty: "Beginner to Advanced",
      projects: [1, 2, 3],
      milestones: [
        "Understand basic electronics and schematics",
        "Learn PCB layout fundamentals",
        "Master component placement and routing",
        "Design your first complete project"
      ],
      skills: ["Schematic Design", "PCB Layout", "Component Selection", "Manufacturing Prep"]
    },
    {
      id: 2,
      title: "Power Electronics Specialist",
      description: "Focus on power supply design and high-current applications",
      duration: "6-8 weeks",
      difficulty: "Intermediate to Advanced",
      projects: [4, 6, 3],
      milestones: [
        "Design switching power supplies",
        "Master thermal management",
        "Handle high-current routing",
        "Implement safety and isolation"
      ],
      skills: ["Power Electronics", "Thermal Design", "High Current", "Safety Standards"]
    },
    {
      id: 3,
      title: "IoT and Wireless Designer",
      description: "Specialize in connected devices and wireless communication",
      duration: "4-6 weeks",
      difficulty: "Intermediate",
      projects: [5, 2, 1],
      milestones: [
        "Design for wireless communication",
        "Optimize for low power consumption",
        "Integrate sensors and microcontrollers",
        "Handle EMI and antenna design"
      ],
      skills: ["Wireless Design", "Low Power", "Sensor Integration", "EMI Management"]
    },
    {
      id: 4,
      title: "Analog Circuit Master",
      description: "Deep dive into analog design and signal processing",
      duration: "6-10 weeks",
      difficulty: "Advanced",
      projects: [3, 6, 4],
      milestones: [
        "Design high-quality analog circuits",
        "Master ground plane techniques",
        "Handle noise and interference",
        "Implement precision measurements"
      ],
      skills: ["Analog Design", "Signal Integrity", "Noise Management", "Precision Design"]
    },
    {
      id: 5,
      title: "Quick Start Essentials",
      description: "Get up and running with PCB basics in just a few weeks",
      duration: "2-3 weeks",
      difficulty: "Beginner",
      projects: [1, 2],
      milestones: [
        "Learn schematic symbols and connections",
        "Place components on PCB",
        "Route basic traces",
        "Generate manufacturing files"
      ],
      skills: ["Basic Routing", "Component Placement", "Schematic Reading"]
    }
  ];

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await window.claude.complete(`
        You are an expert PCB design tutor. The user asked: "${userInput}"
        
        Provide a helpful, educational response about PCB design. Be encouraging and specific.
        If they ask about specific components, routing, or design principles, give practical advice.
        Keep responses concise but informative.
        
        Respond with just the educational content, no extra formatting.
      `);
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try asking your question again.' 
      }]);
    }
    
    setIsLoading(false);
  };

  const startProject = (project) => {
    setCurrentProject(project);
    setActiveTab('project');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || project.difficulty.toLowerCase() === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await window.claude.complete(`
        A student is searching for PCB design learning content with the query: "${searchQuery}"
        
        Based on this search, suggest a personalized learning path. Consider:
        - What skill level this suggests (beginner, intermediate, advanced)
        - What specific topics they should focus on
        - What order to learn things in
        - Any prerequisites they might need
        
        Keep the response concise and actionable, focusing on PCB design education.
      `);
      
      setChatMessages([
        { role: 'assistant', content: `Based on your search for "${searchQuery}", here's a personalized learning path:` },
        { role: 'assistant', content: response }
      ]);
      setActiveTab('tutor');
    } catch (error) {
      console.error('Error generating learning path:', error);
    }
  };

  const startLearningPath = (path) => {
    setSelectedLearningPath(path);
    setActiveTab('learning-path');
  };

  const showLearningPaths = () => {
    setActiveTab('learning-paths');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : isDarkMode 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow`}>
      <div className="flex items-center mb-4">
        <Icon className="w-8 h-8 text-blue-600 mr-3" />
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
      </div>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{description}</p>
    </div>
  );


  const LearningPathCard = ({ path }) => (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{path.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          path.difficulty.includes('Beginner') ? 'bg-green-100 text-green-800' :
          path.difficulty.includes('Intermediate') ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {path.difficulty}
        </span>
      </div>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{path.description}</p>
      
      <div className="space-y-3 mb-4">
        <div>
          <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-sm mb-1`}>Duration</h5>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{path.duration}</p>
        </div>
        
        <div>
          <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-sm mb-1`}>Key Milestones</h5>
          <ul className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm space-y-1`}>
            {path.milestones.slice(0, 2).map((milestone, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                {milestone}
              </li>
            ))}
            {path.milestones.length > 2 && (
              <li className="text-blue-600 text-xs">+{path.milestones.length - 2} more milestones</li>
            )}
          </ul>
        </div>

        <div>
          <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-sm mb-1`}>Skills You'll Master</h5>
          <div className="flex flex-wrap gap-1">
            {path.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
            {path.skills.length > 3 && (
              <span className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'} px-2 py-1 rounded text-xs`}>
                +{path.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => startLearningPath(path)}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Start Learning Path
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>TraceTutor</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => setActiveTab('pricing')} className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} font-medium`}>Pricing</button>
            </nav>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} font-medium`}>Sign In</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="learning-paths" label="Learning Paths" isActive={activeTab === 'learning-paths'} onClick={setActiveTab} />
          <TabButton id="projects" label="Projects" isActive={activeTab === 'projects'} onClick={setActiveTab} />
          <TabButton id="tutor" label="AI Tutor" isActive={activeTab === 'tutor'} onClick={setActiveTab} />
          <TabButton id="quizzes" label="Quizzes" isActive={activeTab === 'quizzes'} onClick={setActiveTab} />
          <TabButton id="project" label="Current Project" isActive={activeTab === 'project'} onClick={setActiveTab} />
          <TabButton id="learning-path" label="My Learning Path" isActive={activeTab === 'learning-path'} onClick={setActiveTab} />
        </div>

        {/* Personalized Search Bar */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 mb-8 border`}>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
            <Search className="w-5 h-5 text-blue-600" />
            What do you want to learn today?
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search for topics like 'power supply', 'microcontroller', 'analog circuits'..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                onClick={handleSearchSubmit}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Get Learning Path
              </button>
            </div>
          </div>
          
          {searchQuery && (
            <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredProjects.length > 0 ? (
                <span>Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"</span>
              ) : (
                <span>No projects found for "{searchQuery}". Try searching for different terms or check the AI Tutor for guidance.</span>
              )}
            </div>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className={`text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border`}>
              <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                Learn PCB Design Like a Pro
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-8`}>
                TraceTutor is your interactive guide to mastering printed circuit board design. 
                From schematics to manufacturing, learn with real projects and AI-powered feedback.
              </p>
              <div className="flex justify-center gap-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Learning
                </button>
                <button className={`border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} px-8 py-3 rounded-lg font-semibold transition-colors`} onClick={showLearningPaths}>
                  Watch Demo
                </button>
              </div>
            </section>

            {/* Features Grid */}
            <section>
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-8 text-center`}>
                Why Choose TraceTutor?
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={BookOpen}
                  title="Guided Learning"
                  description="Step by step tutorials that take you from beginner to advanced PCB designer with interactive challenges."
                />
                <FeatureCard
                  icon={Target}
                  title="Tool Agnostic"
                  description="Learn core principles that work with KiCad, Altium, Fusion 360, and other popular PCB design tools."
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Real Time Feedback"
                  description="Get instant feedback on your designs with AI-powered analysis for errors and improvements."
                />
                <FeatureCard
                  icon={Award}
                  title="Certifications"
                  description="Earn badges and certificates as you complete modules and master PCB design skills."
                />
                <FeatureCard
                  icon={Users}
                  title="Community"
                  description="Join thousands of learners, share projects, and get help from experienced designers."
                />
                <FeatureCard
                  icon={Zap}
                  title="Real Projects"
                  description="Work on practical projects from LED blinkers to complex microcontroller systems."
                />
              </div>
            </section>
          </div>
        )}

        {/* Learning Paths Tab */}
        {activeTab === 'learning-paths' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Choose Your Learning Path</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                Select a structured learning journey designed to take you from where you are to where you want to be in PCB design.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningPaths.map(path => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Hands-On Projects</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                Learn by building real PCB projects with step-by-step guidance and immediate feedback.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isDarkMode={isDarkMode}
                  startProject={startProject}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Tutor Tab */}
        {activeTab === 'tutor' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>AI PCB Design Tutor</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                Get personalized help and guidance from our AI tutor. Ask questions about PCB design, get feedback on your work, or request learning recommendations.
              </p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border`}>
              <div className="p-6 border-b border-gray-200">
                <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center gap-2`}>
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Chat with Your Tutor
                </h4>
              </div>
              
              <div className="h-96 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about PCB design, routing, components..."
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Choose Your Plan</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                Start learning for free or unlock advanced features with our premium plans.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Basic Plan */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border shadow-lg`}>
                <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Basic</h4>
                <div className="text-center mb-8">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>$0</span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Access to basic courses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>3 starter projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Community forum access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Limited AI tutor interactions</span>
                  </li>
                </ul>
                
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Get Started Free
                </button>
              </div>

              {/* Pro Plan */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-blue-500' : 'bg-white border-blue-500'} rounded-2xl p-8 border-2 shadow-xl relative`}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Pro</h4>
                <div className="text-center mb-8">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>$29</span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>All courses and projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Unlimited AI tutor access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Design review and feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Priority community support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Certificate upon completion</span>
                  </li>
                </ul>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Pro Plan
                </button>
              </div>

              {/* Expert Plan */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border shadow-lg`}>
                <h4 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Expert</h4>
                <div className="text-center mb-8">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>$99</span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>1-on-1 expert mentorship</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Custom project guidance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Industry connections</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Job placement assistance</span>
                  </li>
                </ul>
                
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Project Tab */}
        {activeTab === 'project' && currentProject && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>{currentProject.title}</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                {currentProject.description}
              </p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8`}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Project Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Difficulty: </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentProject.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        currentProject.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentProject.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration: </span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{currentProject.duration}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>Skills You'll Learn: </span>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Getting Started</h4>
                  <div className="space-y-4">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      This project will guide you through the complete PCB design process. You'll start with understanding the requirements,
                      move through schematic design, component placement, routing, and finally preparing for manufacturing.
                    </p>
                    <div className="flex gap-4">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start Project
                      </button>
                      <button className={`border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} px-6 py-3 rounded-lg transition-colors`}>
                        Download Files
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Learning Path Tab */}
        {activeTab === 'learning-path' && selectedLearningPath && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>{selectedLearningPath.title}</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                {selectedLearningPath.description}
              </p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8`}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Your Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Overall Progress</span>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>15%</span>
                      </div>
                      <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Milestones</h5>
                      {selectedLearningPath.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${index === 0 ? 'text-green-500' : isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                          <span className={`text-sm ${index === 0 ? (isDarkMode ? 'text-gray-200' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                            {milestone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Recommended Projects</h4>
                  <div className="space-y-4">
                    {selectedLearningPath.projects.map((projectId, index) => {
                      const project = projects.find(p => p.id === projectId);
                      return project ? (
                        <div key={projectId} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h6 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{project.title}</h6>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.duration}</p>
                            </div>
                            <button 
                              onClick={() => startProject(project)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                index === 0 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : isDarkMode 
                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {index === 0 ? 'Start' : 'Locked'}
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show message when no tab content */}
        {activeTab === 'project' && !currentProject && (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>No Project Selected</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Choose a project from the Projects tab to get started.
            </p>
            <button 
              onClick={() => setActiveTab('projects')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Projects
            </button>
          </div>
        )}

        {activeTab === 'learning-path' && !selectedLearningPath && (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>No Learning Path Selected</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Choose a learning path to start your structured PCB design journey.
            </p>
            <button 
              onClick={() => setActiveTab('learning-paths')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Learning Paths
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TraceTutorDemo;
        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Test Your Knowledge</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto mb-8`}>
                Challenge yourself with interactive quizzes to reinforce your learning and climb the leaderboard.
              </p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8`}>
              <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                Coming Soon: Gamified Quizzes and Leaderboards
              </h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Earn points, unlock badges, and see how you rank against other learners. Quizzes will cover schematic design, layout strategies, component knowledge, and more.
              </p>
            </div>
          </div>
        )}
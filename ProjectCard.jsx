import { Play } from "lucide-react";

export default function ProjectCard({ project, isDarkMode, startProject }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 backdrop-blur-sm'
      } shadow-xl hover:shadow-2xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{project.icon}</div>
            <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode 
                ? 'from-gray-100 to-gray-300' 
                : 'from-gray-900 to-gray-700'
            }`}>
              {project.title}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
            project.difficulty === 'Beginner' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50' :
            project.difficulty === 'Intermediate' ? 'bg-amber-100/80 text-amber-800 border border-amber-200/50' :
            'bg-rose-100/80 text-rose-800 border border-rose-200/50'
          }`}>
            {project.difficulty}
          </span>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.skills.map((skill, index) => (
            <span key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100/50 backdrop-blur-sm">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
            ⏱️ {project.duration}
          </span>
          <button 
            onClick={() => startProject(project)}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <Play className="w-4 h-4 relative" />
            <span className="relative">Start Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
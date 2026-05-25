import React from 'react';
import { Briefcase, Heart, BookOpen, Users, ArrowRight } from 'lucide-react';

const Projects = () => {
  const initiatives = [
    {
      title: "Scholarship Program",
      description: "Providing financial support to brilliant but needy students at St. Thomas Aquinas SHS.",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      status: "Active"
    },
    {
      title: "Community Outreach",
      description: "Annual charity events and health screenings in local communities across Accra.",
      icon: Heart,
      color: "bg-red-100 text-red-600",
      status: "Upcoming"
    },
    {
      title: "Business Collaborations",
      description: "A platform for alumni-led businesses to partner and grow together through networking.",
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
      status: "Ongoing"
    },
    {
      title: "Mentorship Circle",
      description: "Pairing experienced professionals with younger alumni and current students.",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      status: "Active"
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-primary text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Projects & Initiatives</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover projects led by Old Toms members aimed at giving back and creating impact.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {initiatives.map((project) => (
            <div key={project.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-6">
                <div className={`${project.color} p-4 rounded-xl`}>
                  <project.icon className="h-8 w-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                  {project.status}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-blue-600 transition-colors">{project.title}</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {project.description}
              </p>
              <button className="text-primary font-bold flex items-center hover:gap-2 transition-all">
                Learn more about this initiative <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Featured Impact Section */}
        <div className="bg-primary rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-6">Create Impact with Us</h2>
              <p className="text-blue-100 text-lg mb-10 leading-relaxed">
                Do you have a project idea that could benefit our alma mater or the wider community? 
                We provide the platform and network to bring meaningful initiatives to life.
              </p>
              <button className="bg-secondary text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all w-fit shadow-lg">
                Propose a Project
              </button>
            </div>
            <div className="bg-blue-900 flex items-center justify-center p-12">
               <div className="text-center">
                  <div className="text-5xl font-extrabold text-secondary mb-2">$5,000+</div>
                  <p className="text-blue-200 uppercase tracking-widest text-sm font-bold">Raised for Scholarships</p>
                  <div className="mt-8 text-5xl font-extrabold text-secondary mb-2">200+</div>
                  <p className="text-blue-200 uppercase tracking-widest text-sm font-bold">Students Impacted</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

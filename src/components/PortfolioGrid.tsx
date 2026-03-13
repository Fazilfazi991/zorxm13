import { ExternalLink } from "lucide-react";

const projects = [
    {
        id: 1,
        title: "Neonights",
        category: "Branding & Signage",
        description: "Professional vehicle branding, neon signs, and custom signage solutions for UAE businesses.",
        image: "/neonights.png",
        link: "https://neonights.ae"
    },
    {
        id: 2,
        title: "BWMC",
        category: "Business Consultancy",
        description: "UAE's trusted experts in financial management, business setup, accounting, and tax advisory services.",
        image: "/bwmc.png",
        link: "https://bwmc.ae"
    },
    {
        id: 3,
        title: "Tonio Senora",
        category: "Restaurant",
        description: "Elegant Mexican restaurant website blending traditional flavors with modern design aesthetics.",
        image: "/toniosenora.png",
        link: "https://toniosenora.com"
    },
    {
        id: 4,
        title: "Veriquendt",
        category: "Fintech",
        description: "Corporate verification platform with streamlined workflows and bank-grade security features.",
        image: "/veriquendt.png",
        link: "https://veriquendt.com"
    },
    {
        id: 5,
        title: "FM Auditors",
        category: "Financial Services",
        description: "Professional auditing firm website with sophisticated design and comprehensive financial tools.",
        image: "/fmauditors.png",
        link: "https://fmauditors.com"
    },
    {
        id: 6,
        title: "Synops Labs",
        category: "Technology",
        description: "Cutting-edge tech lab showcasing AI innovations and futuristic solutions for tomorrow.",
        image: "/synopslabs.png",
        link: "https://synopslabs.com"
    }
];

const PortfolioGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
                <a
                    key={project.id}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                    {/* Card Image Area */}
                    <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="w-14 h-14 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                                    <ExternalLink className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-white text-sm font-medium">Visit Site</p>
                            </div>
                        </div>


                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                {project.title}
                            </h3>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {project.category}
                            </span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default PortfolioGrid;

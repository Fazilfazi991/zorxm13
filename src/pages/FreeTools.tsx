import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Wrench } from "lucide-react";

const FreeTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="section-padding pt-32 lg:pt-48">
          <div className="section-container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
                Free Tools
              </div>
              <h1 className="heading-section text-foreground mb-4">
                Useful Marketing <span className="text-primary">Tools</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Boost your marketing efforts with our collection of free tools. (Page coming soon)
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl">
              <Wrench className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <p className="text-xl text-muted-foreground font-medium">Tools section is under development</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FreeTools;

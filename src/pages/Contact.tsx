import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Contact = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent!",
            description: "We'll get back to you as soon as possible.",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-hero overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    <div className="section-container relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                Get in Touch
                            </div>

                            <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                Let's Start a <span className="text-primary">Conversation</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                Have a question or ready to scale your business? Our team is here to help you navigate the digital landscape.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="section-padding bg-background">
                    <div className="section-container">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Contact Info */}
                            <div className="space-y-12 animate-fade-in">
                                <div className="space-y-6">
                                    <h2 className="heading-section text-foreground">Contact Information</h2>
                                    <p className="text-muted-foreground text-lg">
                                        Fill out the form and our team will get back to you within 24 hours.
                                    </p>
                                </div>

                                <div className="grid gap-8">
                                    {[
                                        {
                                            icon: Mail,
                                            title: "Email Us",
                                            content: "hello@zorx.ae",
                                            subContent: "Online support 24/7"
                                        },
                                        {
                                            icon: Phone,
                                            title: "Call Us",
                                            content: "+971 4 XXX XXXX",
                                            subContent: "Mon-Fri from 9am to 6pm"
                                        },
                                        {
                                            icon: MapPin,
                                            title: "Visit Us",
                                            content: "Business Bay, Dubai",
                                            subContent: "United Arab Emirates"
                                        }
                                    ].map((item, index) => (
                                        <div key={item.title} className="flex gap-6 group">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <item.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                                                <p className="text-[#065f46] font-semibold">{item.content}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{item.subContent}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Additional Info */}
                                <div className="p-8 bg-gray-50 rounded-3xl border border-border/50">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground">Working Hours</h4>
                                    </div>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex justify-between">
                                            <span>Monday - Friday</span>
                                            <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Saturday</span>
                                            <span className="font-medium text-foreground">10:00 AM - 2:00 PM</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Sunday</span>
                                            <span className="font-medium text-foreground">Closed</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-card border border-border/50 animate-fade-in">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="first-name">First Name</Label>
                                            <Input id="first-name" placeholder="John" className="h-12" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last-name">Last Name</Label>
                                            <Input id="last-name" placeholder="Doe" className="h-12" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="john@example.com" className="h-12" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="service">Interested Service</Label>
                                        <select
                                            id="service"
                                            className="w-full h-12 px-4 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select a service</option>
                                            <option value="seo">SEO Optimization</option>
                                            <option value="ppc">PPC Advertising</option>
                                            <option value="social">Social Media Marketing</option>
                                            <option value="web">Web Design & Development</option>
                                            <option value="content">Content Strategy</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us about your project..."
                                            className="min-h-[150px] resize-none"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-14 text-lg font-bold group bg-primary hover:bg-primary/90 transition-all duration-300">
                                        Send Message
                                        <Send className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </Button>

                                    <p className="text-center text-sm text-muted-foreground">
                                        By clicking "Send Message", you agree to our privacy policy.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;

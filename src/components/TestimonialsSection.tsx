import React from "react";
import { TestimonialsColumn, Testimonial } from "./ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials: Testimonial[] = [
    {
        text: "PhysioSim helped me think like a real clinician. The cases feel real, and the feedback changed how I approach diagnosis.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        name: "Ahmed Moussa",
        role: "Physiotherapy Student",
    },
    {
        text: "This is the closest thing to real clinical reasoning practice I’ve found online. It’s an essential tool for my internship.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        name: "Bilal Ahmed",
        role: "Intern Physiotherapist",
    },
    {
        text: "The support team is exceptional, guiding us through setup and providing ongoing assistance, ensuring our satisfaction.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        name: "Saman Malik",
        role: "Student - Cairo Univ",
    },
    {
        text: "Implementing this simulation in our curriculum was smooth. The interface is intuitive and students love it.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        name: "Omar Raza",
        role: "Clinical Instructor",
    },
    {
        text: "Its robust features and quick feedback have transformed our workflow, making us significantly more efficient.",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop",
        name: "Zainab Hussain",
        role: "Senior Physiotherapist",
    },
    {
        text: "The smooth implementation exceeded expectations. It streamlined processes, improving overall student performance.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
        name: "Aliza Khan",
        role: "Medical Analyst",
    },
    {
        text: "The cases are incredibly detailed. It's like having a clinical mentor available 24/7.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        name: "Farhan Siddiqui",
        role: "Physio Intern",
    },
    {
        text: "They delivered a solution that exceeded expectations. It's a game changer for clinical education.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        name: "Sana Sheikh",
        role: "Academic Lead",
    },
    {
        text: "Using PhysioSim, our students' confidence in diagnosis has significantly improved.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        name: "Hassan Ali",
        role: "Clinical Coordinator",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsSection = () => {
    return (
        <section className="bg-slate-50 py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-[640px] mx-auto text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="border border-teal-200 bg-teal-50 text-teal-700 py-1.5 px-6 rounded-full text-sm font-semibold tracking-wide">
                            Social Proof
                        </div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mt-2">
                        What Students & Professionals Say
                    </h2>
                    <p className="text-lg text-slate-600 mt-6 leading-relaxed">
                        Discover how PhysioSim is transforming clinical reasoning and practice for thousands of users.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[740px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={18} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={20} />
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

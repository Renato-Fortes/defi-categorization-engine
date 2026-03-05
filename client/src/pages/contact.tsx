import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Clock, Send, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const itemFade = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function GlowOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@deficategorizer.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Remote-first team",
    description: "Serving clients worldwide",
  },
  {
    icon: Clock,
    title: "Support hours",
    value: "Mon–Fri, 9am–6pm UTC",
    description: "Emergency support available",
  },
];

export default function Contact() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Message sent",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative px-6 md:px-10 py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GlowOrb className="w-[700px] h-[700px] bg-primary/[0.05] top-[-100px] right-[10%]" delay={0} />
          <GlowOrb className="w-[500px] h-[500px] bg-chart-3/[0.04] bottom-[10%] left-[5%]" delay={4} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.button
              variants={itemFade}
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-16 group"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </motion.button>

            <motion.div variants={itemFade} className="max-w-2xl mb-20">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                Get in touch
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] mb-6">
                Let's talk about
                <br />
                <span className="text-muted-foreground">your needs.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions about the DeFi Categorization Engine? Need custom protocol support?
                We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <motion.div variants={itemFade} className="lg:col-span-3">
                <div className="rounded-2xl border bg-card/50 backdrop-blur-xl p-8 md:p-10">
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="h-12 rounded-xl"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="h-12 rounded-xl"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        className="h-12 rounded-xl"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        data-testid="input-subject"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your needs..."
                        rows={6}
                        className="rounded-xl resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        data-testid="input-message"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-13 gap-2.5 text-base rounded-xl shadow-lg shadow-primary/20"
                      disabled={isSubmitting}
                      data-testid="button-submit-contact"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <>
                          Send message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>

              <motion.div variants={itemFade} className="lg:col-span-2 space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.title} className="p-6 rounded-2xl border bg-card/50 backdrop-blur-xl group hover:shadow-lg transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{info.title}</h3>
                        <p className="text-foreground text-sm mt-1">{info.value}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-6 rounded-2xl border bg-gradient-to-br from-primary/[0.04] to-chart-3/[0.04] border-primary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Enterprise</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Need custom protocol support, bulk processing, or API access?
                        Let's build a solution for your firm.
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-primary shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

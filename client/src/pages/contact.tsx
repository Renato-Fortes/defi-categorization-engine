import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Clock, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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
    value: "Mon-Fri 9am-6pm UTC",
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
    <div className="min-h-screen flex flex-col">
      <section className="relative px-4 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.button
              variants={fadeUp}
              custom={0}
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </motion.button>

            <motion.div variants={fadeUp} custom={1} className="mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Get in touch
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                Contact us
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Have questions about the DeFi Categorization Engine? We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <motion.div variants={fadeUp} custom={2} className="lg:col-span-3">
                <Card className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        data-testid="input-subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your needs..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        data-testid="input-message"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                      data-testid="button-submit-contact"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} custom={3} className="lg:col-span-2 space-y-4">
                {contactInfo.map((info) => (
                  <Card key={info.title} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{info.title}</h3>
                        <p className="text-foreground text-sm mt-0.5">{info.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card className="p-5 bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/10">
                  <h3 className="font-semibold text-foreground text-sm mb-2">Enterprise inquiries</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Need custom protocol support or bulk processing? Contact us for enterprise solutions tailored to your firm.
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

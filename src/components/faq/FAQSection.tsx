
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { HOME_FAQS } from "@/content/siteInfo";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Shared with the server-rendered homepage and its FAQPage structured data
const faqData: FAQItem[] = HOME_FAQS.map((faq, index) => ({ id: index + 1, ...faq }));

const FAQSection = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="faq" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6 xl:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about our wealth management services and investment approach.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              aria-label="Search FAQ questions"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No questions found matching your search.
                </p>
              </Card>
            ) : (
              filteredFAQs.map((faq, index) => (
                <Card
                  key={faq.id}
                  className="overflow-hidden transition-all duration-300 hover:shadow-md border border-border/50 bg-background/50 backdrop-blur-sm"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset transition-all duration-300 hover:bg-muted/20 group"
                    aria-expanded={openItems.has(faq.id)}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground pr-4 group-hover:text-primary transition-colors duration-300">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-all duration-300 ease-in-out flex-shrink-0 group-hover:text-primary",
                          openItems.has(faq.id) && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${faq.id}`}
                    className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out",
                      openItems.has(faq.id)
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <CardContent className="px-6 pb-6 pt-0">
                      <div className={cn(
                        "text-muted-foreground leading-relaxed transition-all duration-300",
                        openItems.has(faq.id)
                          ? "transform translate-y-0 opacity-100"
                          : "transform -translate-y-2 opacity-0"
                      )}>
                        {faq.answer}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center p-8 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our wealth management experts are here to help you make informed investment decisions.
            </p>
            <button
              onClick={() => {
                localStorage.setItem('redirect_after_login', '/dashboard/compass');
                sessionStorage.setItem('auth_context_consultation', 'true');
                navigate('/auth');
              }}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

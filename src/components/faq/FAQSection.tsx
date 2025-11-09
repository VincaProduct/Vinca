
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Why should I invest with Vinca Wealth?",
    answer: "We offer one-to-one consultation to maintain an equilibrium before investing your money. Our Wealth Managers acknowledge your financial goals and develop the best-suited investment plans."
  },
  {
    id: 2,
    question: "Do you charge any fee for Planning or Investing through VincaWealth?",
    answer: "No, We don't charge any fee. We get commissions from Fund Houses."
  },
  {
    id: 3,
    question: "How does Vinca Wealth make money?",
    answer: "We get commission from the Fund Houses as per SEBI regulations. It may vary from 0.3% to 1.2%"
  },
  {
    id: 4,
    question: "How can Vinca Wealth help me with my existing investments?",
    answer: "We will give a free and detailed review of your existing investments"
  },
  {
    id: 5,
    question: "Does Vinca Wealth have an app to track our investments?",
    answer: "Yes, We have our app with the name 'Vinca Wealth' in the Google Play store & 'Fund Connect' in the Apple store. Using this app you can track your investments"
  },
  {
    id: 6,
    question: "Can I meet and talk to any Vinca Wealth Managers in person? If yes, when and how?",
    answer: "Yes, We will do one-on-one meetings at our registered office in Bangalore or at the place of your choice in Bangalore. For non-Bangalorians, we can connect through zoom call."
  },
  {
    id: 7,
    question: "Why should I choose Vinca Wealth over others?",
    answer: "At Vinca Wealth we give unbiased advice based on thorough research. We can also explain you in detail why our advice is the best advice"
  },
  {
    id: 8,
    question: "What are the different products Vinca Wealth suggest?",
    answer: "We suggest Mutual Funds, Health Insurance, Life insurance, Equity Baskets, PMS and Fractional Real estate products"
  },
  {
    id: 9,
    question: "As an NRI, do I have a limitation in terms of funds and schemes?",
    answer: "If you are a US or Canadian resident, then you have limited options. If you are a resident of any other country, you don't have limitations."
  },
  {
    id: 10,
    question: "How do you ensure my goals will be met?",
    answer: "We follow a goal-based exit procedure as we move towards the goal, we reduce the risk exposure gradually and make the goal safer. You won't get short of funds even though the market crashes."
  },
  {
    id: 11,
    question: "Can I invest through VincaWealth without a financial goal?",
    answer: "We do wealth management for HNIs without goal based planning if required."
  },
  {
    id: 12,
    question: "How often my portfolio will be reviewed?",
    answer: "We will do one-on-one review once a year. But, We monitor your portfolio all the time. We will call you as and when action is required"
  },
  {
    id: 13,
    question: "What happen when the market fall midway while you have invested for long term?",
    answer: "Long-term investors shouldn't be concerned about short-term volatility in the market. If you take a time horizon of 5 years and roll it, the market always has given good positive returns."
  },
  {
    id: 14,
    question: "Should we transfer money to Vinca Wealth while investing?",
    answer: "We will add the chosen products to the cart and send the link to you. You'll approve and pay the amount directly from your Bank account to the Fund house. Vinca Wealth will not be a part of this transaction."
  },
  {
    id: 15,
    question: "Do you share my data with other banks?",
    answer: "No. We dont share the data of customers to any third party. Your data is fully secured."
  },
  {
    id: 16,
    question: "What happens when a VW account holder passes away?",
    answer: "All the investments will have nominees. Without Nominees KYCs will not be processed."
  }
];

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
                localStorage.setItem('redirect_after_login', '/dashboard/book-wealth-manager');
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

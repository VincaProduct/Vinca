
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Kalyan",
      title: "TCS, Assistant Consultant- C3A",
      image: "/testimonials/kalyan.png",
      quote: "Vinca Wealth with their excellent financial planning strategy has helped me to get better clarity on our Financial goals. They not only guided me on how much and where to invest, they also emphasised on the inflation adjusted returns."
    },
    {
      name: "Uday", 
      title: "Hitachi Vantara India Pvt Ltd, Regional Manager",
      image: "/testimonials/uday.png",
      quote: "I got in touch with Vinca Wealth when I was unsure of my existing investments plans. And then got to know that we should not opt for insurance cum investment products. They helped me to switch to Mutual funds instead for long term wealth creation."
    },
    {
      name: "Nagarajan M",
      title: "Hewlett Packard Enterprise, Global Workplace Manager", 
      image: "/testimonials/Nagarajan-M.png",
      quote: "I have been thinking about my future financial planning, got excellent team support from Vinca wealth, now I have got freedom on time. If you're interested in early retirement too, I highly recommend their services."
    },
    {
      name: "Dr Durga Prasad",
      title: "MKH CRESCENT, MBBS, DCH",
      image: "/testimonials/Dr-Durga-Prasad.png", 
      quote: "I am Giving this review after using the app and vinca wealth advice for over 2 years.Vinca Wealth has always been a dependable advice to invest in the right Mutual funds. All the recommendations have been given after thorough research and analysis."
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/6 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-24 h-24 bg-primary/15 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-current" />
            CLIENT SUCCESS STORIES
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4">
            What Our Clients Say
            <span className="text-primary block">About Their Success</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from clients who have achieved their financial goals with our expert guidance and personalized strategies.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="animate-fade-in group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                {/* Quote icon background */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-12 h-12 text-primary" />
                </div>
                
                <CardContent className="p-6 lg:p-8">
                  {/* Star rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-muted-foreground leading-relaxed mb-6 text-sm lg:text-base italic relative">
                    <span className="text-primary text-2xl absolute -top-2 -left-1">"</span>
                    <span className="pl-4">{testimonial.quote}</span>
                    <span className="text-primary text-2xl">"</span>
                  </blockquote>

                  {/* Client info */}
                  <div className="flex items-center gap-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="object-fill w-14 h-14 "
                      />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-base lg:text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-12 lg:mt-16 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="inline-flex items-center gap-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-6 py-4">
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-primary">60+</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-primary">4.9★</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Client Rating</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-primary">₹50L+</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Wealth Created</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

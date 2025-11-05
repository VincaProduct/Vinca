
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsGrid = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Retired Teacher',
      content: 'Vincawealth helped me retire 3 years earlier than planned. Their retirement calculator was spot-on, and their personalized advice made all the difference.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      title: 'Tech Executive',
      content: 'The AI tools gave me great insights, but the personal consultation was game-changing. My portfolio performance has improved significantly.',
      rating: 5
    },
    {
      name: 'Linda Martinez',
      title: 'Small Business Owner',
      content: 'Finally, financial planning that makes sense. The team understood my business needs and created a strategy that works for both personal and business goals.',
      rating: 5
    }
  ];

  return (
    <div>
      <h3 className="text-2xl sm:text-3xl font-display font-semibold text-center mb-8 sm:mb-12 text-foreground px-2">
        What Our Clients Say
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <Card 
            key={testimonial.name}
            className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border hover:border-primary/20 animate-fade-in"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <CardContent className="p-0">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic text-sm sm:text-base">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.title}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsGrid;

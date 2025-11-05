
const StatsSection = () => {
  const stats = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '1,200+', label: 'Satisfied Clients' },
    { value: '15+', label: 'Years Experience' },
    { value: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <div className="bg-primary/10 rounded-xl p-6 sm:p-8 mb-12 sm:mb-16 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-muted-foreground text-xs sm:text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;

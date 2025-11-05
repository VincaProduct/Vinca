import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TOCItem } from './TOCEditor';

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export const TableOfContents = ({ items, className = '' }: TableOfContentsProps) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => document.getElementById(item.anchor)).filter(Boolean);
      
      if (sections.length === 0) return;

      const scrollPosition = window.scrollY + 100; // Offset for header
      
      // Find the current section based on scroll position
      let currentSection = '';
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = section.id;
          break;
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const headerOffset = 100; // Adjust for fixed header
      const elementPosition = element.offsetTop - headerOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) return null;

  const getLevelStyles = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1: return 'pl-0 text-sm font-medium';
      case 2: return 'pl-4 text-sm';
      case 3: return 'pl-8 text-xs';
    }
  };

  return (
    <div className={`sticky top-24 ${className}`}>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground uppercase tracking-wide">
            <span>On this page</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 p-0 hover:bg-muted/50"
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="px-0 pt-0">
            <nav>
              <ul className="space-y-2 border-l border-border/40">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.anchor)}
                      className={`block w-full text-left py-1.5 px-4 -ml-px border-l-2 transition-all duration-200 hover:border-primary/50 hover:text-foreground ${
                        getLevelStyles(item.level)
                      } ${
                        activeSection === item.anchor
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-muted-foreground'
                      }`}
                    >
                      <span className="line-clamp-2 leading-relaxed">
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
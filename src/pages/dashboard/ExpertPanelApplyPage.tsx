import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Expert Panel apply step, inside the dashboard (signed-in only).
 * For now the application goes by email; a form with saved applications and
 * the Member / Associate / Senior Member roles comes in the next phase.
 */

const APPLY_EMAIL = 'support@vincawealth.com';

const ExpertPanelApplyPage = () => {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || '';
  const email = user?.email || '';

  const subject = 'Expert Panel application';
  const body = [
    `Name: ${fullName}`,
    `Email: ${email}`,
    'LinkedIn profile:',
    'Current role / studies:',
    'Topics I want to write about:',
    'Link to something I have written (optional):',
  ].join('\n');
  const mailto = `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Apply to the Expert Panel</h1>
        <p className="text-lg text-muted-foreground">
          {fullName ? `Thanks for your interest, ${fullName.split(' ')[0]}. ` : 'Thanks for your interest. '}
          One last step to send your application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Send your application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Tell us a little about yourself:</p>
          <ul className="list-disc pl-5 space-y-1 text-foreground">
            <li>Your LinkedIn profile</li>
            <li>What you do now (job or studies)</li>
            <li>The topics you want to write about</li>
            <li>A link to something you have written, if you have one</li>
          </ul>
          <Button asChild size="lg" className="gap-2">
            <a href={mailto}>
              <Mail className="h-4 w-4" />
              Email my application
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Or write to us at <a className="text-primary underline" href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</a>.
            Our team reviews every application and replies within a week.
          </p>
        </CardContent>
      </Card>

      <Button variant="ghost" asChild className="gap-2">
        <Link to="/expert-panel">
          <ArrowLeft className="h-4 w-4" />
          Back to the Expert Panel
        </Link>
      </Button>
    </div>
  );
};

export default ExpertPanelApplyPage;

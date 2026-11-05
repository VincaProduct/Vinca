import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PRIVACY_POLICY_HTML } from "@/content/privacyPolicy";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>

        {/* Fixed text from our own file, also served in the page HTML by the pages edge function */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

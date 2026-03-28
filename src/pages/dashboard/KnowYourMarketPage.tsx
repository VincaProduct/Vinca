import { useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { X, AlertTriangle, Clock, Target, Book, CalendarCheck, Gamepad2, Gift, List, Wallet, Heart, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function KnowYourMarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'valuations' | 'products'>('valuations');
  const [activeCategory, setActiveCategory] = useState('Long-term Wealth');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false);

  // Market Valuation Data
  const valuations = [
    {
      id: 'nifty50',
      name: 'Nifty 50',
      type: 'equity',
      situation: 'India\'s benchmark equity index showing strength',
      currentPE: 24.5,
      historicalAvgPE: 18.2,
      currentZone: 'Above Average',
      zones: [
        { label: 'Below Average', status: 'below' },
        { label: 'Near Average', status: 'near' },
        { label: 'Above Average', status: 'above' },
      ],
    },
    {
      id: 'sensex',
      name: 'Sensex',
      type: 'equity',
      situation: 'BSE\'s flagship index reflecting market sentiment',
      currentPE: 23.8,
      historicalAvgPE: 17.9,
      currentZone: 'Above Average',
      zones: [
        { label: 'Below Average', status: 'below' },
        { label: 'Near Average', status: 'near' },
        { label: 'Above Average', status: 'above' },
      ],
    },
    {
      id: 'gold',
      name: 'Gold',
      type: 'metal',
      situation: 'Precious metal showing steady demand',
      currentPrice: '₹72,500/10g',
      priceChange: '+12.5%',
      currentZone: 'Near Average',
      zones: [
        { label: 'Below Average', status: 'below' },
        { label: 'Near Average', status: 'near' },
        { label: 'Above Average', status: 'above' },
      ],
    },
    {
      id: 'silver',
      name: 'Silver',
      type: 'metal',
      situation: 'Industrial metal with cyclical trends',
      currentPrice: '₹95,000/kg',
      priceChange: '-3.2%',
      currentZone: 'Below Average',
      zones: [
        { label: 'Below Average', status: 'below' },
        { label: 'Near Average', status: 'near' },
        { label: 'Above Average', status: 'above' },
      ],
    },
  ];

  // Product Categories with icons (matching financial readiness style)
  const categories = [
    { key: 'Long-term Wealth', label: 'Long-term Wealth', icon: Wallet, mobileLabel: 'Wealth' },
    { key: 'Regular Income', label: 'Regular Income', icon: CalendarCheck, mobileLabel: 'Income' },
    { key: 'Tax Saving', label: 'Tax Saving', icon: Calculator, mobileLabel: 'Tax' },
    { key: 'High Growth', label: 'High Growth', icon: Target, mobileLabel: 'Growth' },
    { key: 'Capital Protection', label: 'Capital Protection', icon: Heart, mobileLabel: 'Protection' },
    { key: 'Global Exposure', label: 'Global Exposure', icon: Book, mobileLabel: 'Global' },
  ];

  // Market Products Data
  const products: Record<string, any[]> = {
    'Long-term Wealth': [
      {
        id: 'equity-mf',
        category: 'Long-term Wealth',
        name: 'Equity Mutual Funds',
        description: 'Funds investing in company shares for long-term growth',
        timeHorizon: '10+ years',
        riskLevel: 'High',
        purpose: 'Wealth creation',
        returnHint: 'Historically ~10–14% over long periods',
      },
      {
        id: 'index-funds',
        category: 'Long-term Wealth',
        name: 'Index Funds',
        description: 'Track market indices for diversified equity exposure',
        timeHorizon: '10+ years',
        riskLevel: 'Medium-High',
        purpose: 'Market exposure',
        returnHint: 'In line with index performance',
      },
      {
        id: 'elss',
        category: 'Long-term Wealth',
        name: 'ELSS',
        description: 'Equity-linked savings schemes with tax benefits',
        timeHorizon: '3+ years',
        riskLevel: 'High',
        purpose: 'Tax savings + wealth',
        returnHint: 'Variable, potential for 10%+ returns',
      },
    ],
    'Regular Income': [
      {
        id: 'debt-mf',
        category: 'Regular Income',
        name: 'Debt Mutual Funds',
        description: 'Funds investing in bonds and fixed-income securities',
        timeHorizon: '1-3 years',
        riskLevel: 'Low-Medium',
        purpose: 'Regular returns',
        returnHint: 'Typically 4-7% depending on duration',
      },
      {
        id: 'liquid-funds',
        category: 'Regular Income',
        name: 'Liquid Funds',
        description: 'Short-term investments with high liquidity',
        timeHorizon: 'Very short (days to months)',
        riskLevel: 'Very Low',
        purpose: 'Cash management',
        returnHint: '3-4% with easy access',
      },
      {
        id: 'government-bonds',
        category: 'Regular Income',
        name: 'Government Bonds',
        description: 'Bonds issued by government for fixed returns',
        timeHorizon: '5-10 years',
        riskLevel: 'Very Low',
        purpose: 'Capital safety',
        returnHint: 'Fixed coupon + face value at maturity',
      },
    ],
    'Tax Saving': [
      {
        id: 'elss-tax',
        category: 'Tax Saving',
        name: 'ELSS (Tax Saver)',
        description: 'Equity-linked savings schemes with Section 80C benefit',
        timeHorizon: '3+ years',
        riskLevel: 'High',
        purpose: 'Tax deduction + growth',
        returnHint: 'Up to ₹1.5 lakh deduction + growth potential',
      },
      {
        id: 'nps',
        category: 'Tax Saving',
        name: 'NPS (National Pension System)',
        description: 'Retirement-focused investment with tax benefits',
        timeHorizon: 'Till retirement',
        riskLevel: 'Medium',
        purpose: 'Retirement planning',
        returnHint: 'Section 80C + 80CCD(1b) benefits',
      },
      {
        id: 'ppf',
        category: 'Tax Saving',
        name: 'PPF (Public Provident Fund)',
        description: 'Government-backed savings scheme with guaranteed returns',
        timeHorizon: '15 years minimum',
        riskLevel: 'Very Low',
        purpose: 'Secure savings',
        returnHint: 'Government-guaranteed interest rate',
      },
    ],
    'High Growth': [
      {
        id: 'small-cap',
        category: 'High Growth',
        name: 'Small Cap Funds',
        description: 'Aggressive growth through smaller companies',
        timeHorizon: '10+ years',
        riskLevel: 'Very High',
        purpose: 'Maximum growth',
        returnHint: 'High volatility, 15%+ potential',
      },
      {
        id: 'mid-cap',
        category: 'High Growth',
        name: 'Mid Cap Funds',
        description: 'Growth with moderate-size companies',
        timeHorizon: '7+ years',
        riskLevel: 'High',
        purpose: 'Growth',
        returnHint: 'Moderate volatility, 12%+ potential',
      },
      {
        id: 'direct-stocks',
        category: 'High Growth',
        name: 'Direct Equity',
        description: 'Direct ownership of individual company shares',
        timeHorizon: '5+ years',
        riskLevel: 'Very High',
        purpose: 'Wealth creation',
        returnHint: 'Varies by company, high volatility',
      },
    ],
    'Capital Protection': [
      {
        id: 'debt-funds',
        category: 'Capital Protection',
        name: 'Debt Funds',
        description: 'Conservative fixed-income investments',
        timeHorizon: '1-5 years',
        riskLevel: 'Low',
        purpose: 'Capital preservation',
        returnHint: '4-6% stable returns',
      },
      {
        id: 'savings-account',
        category: 'Capital Protection',
        name: 'Savings Account',
        description: 'Bank deposits with guaranteed returns',
        timeHorizon: 'Ongoing',
        riskLevel: 'Very Low',
        purpose: 'Safety',
        returnHint: '2-4% with full liquidity',
      },
      {
        id: 'fd',
        category: 'Capital Protection',
        name: 'Fixed Deposits',
        description: 'Bank FDs with guaranteed principal return',
        timeHorizon: '3 months to 10 years',
        riskLevel: 'Very Low',
        purpose: 'Guaranteed returns',
        returnHint: 'Fixed rates, full principal protection',
      },
    ],
    'Global Exposure': [
      {
        id: 'international-mf',
        category: 'Global Exposure',
        name: 'International Equity Funds',
        description: 'Exposure to global markets and companies',
        timeHorizon: '10+ years',
        riskLevel: 'Medium-High',
        purpose: 'Diversification',
        returnHint: 'Varies with global markets',
      },
      {
        id: 'gold-etf',
        category: 'Global Exposure',
        name: 'Gold ETFs',
        description: 'Investment in gold through exchange-traded funds',
        timeHorizon: 'Medium-term',
        riskLevel: 'Medium',
        purpose: 'Hedging + diversification',
        returnHint: 'Linked to global gold prices',
      },
      {
        id: 'global-bonds',
        category: 'Global Exposure',
        name: 'Global Bonds',
        description: 'Fixed income from international issuers',
        timeHorizon: '5+ years',
        riskLevel: 'Low-Medium',
        purpose: 'Diversified income',
        returnHint: 'Currency + interest rate dependent',
      },
    ],
  };

  const getRiskExplanation = (riskLevel: string) => {
    const explanations: Record<string, string> = {
      'Very Low': 'Minimal price fluctuation with steady, predictable returns. Ideal for capital preservation.',
      'Low': 'Designed for safety with small price changes. Lower growth potential but stable.',
      'Low-Medium': 'Balance of safety and growth. Moderate fluctuations acceptable.',
      'Medium': 'Moderate price fluctuations. Long-term investing helps weather volatility.',
      'Medium-High': 'Significant price swings expected. Longer investment horizon recommended.',
      'High': 'Substantial volatility possible. Extended holding periods important.',
      'Very High': 'Highly volatile. Only suitable if you can afford potential loss.',
    };
    return explanations[riskLevel] || 'Standard risk profile.';
  };

  const filteredProducts = products[activeCategory] || [];

  return (
    <>
      <CanonicalPageHeader
        title="Understand where current markets stand relative to history, and explore available investment products."
      />
      
      {/* Content flows naturally without max-width container - matching Sprint B layout */}
      <div className="py-12">
        {/* Tab Buttons - Now with proper left padding to align with header */}
        <div className="px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'valuations' | 'products')} className="mb-12">
            <TabsList className="grid w-auto grid-cols-2 border-b border-slate-200 rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="valuations"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none px-4 py-3 font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Valuations
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none px-4 py-3 font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Products
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Valuations Tab */}
        {activeTab === 'valuations' && (
          <div>
            {/* Cards grid - Full width with side padding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-6 lg:px-8">
              {valuations.map((asset) => (
                <Card key={asset.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{asset.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{asset.situation}</p>

                  {/* Metrics */}
                  <div className="bg-slate-100 rounded-lg p-4 mb-4 space-y-2">
                    {asset.type === 'equity' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Current PE</span>
                          <span className="font-semibold text-slate-900">{asset.currentPE}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Historical Avg PE</span>
                          <span className="font-semibold text-slate-900">{asset.historicalAvgPE}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Current Price</span>
                          <span className="font-semibold text-slate-900">{asset.currentPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Price Change</span>
                          <span className={`font-semibold ${asset.priceChange.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                            {asset.priceChange}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Valuation Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {asset.zones.map((zone) => (
                      <button
                        key={zone.status}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
                          zone.label === asset.currentZone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {zone.label}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Educational Disclaimer - Full width with side padding */}
            <div className="px-6 lg:px-8">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Educational Awareness Only:</strong> Valuations describe market context—what assets are priced at historically. They do not predict future returns, do not constitute investment advice, and should not drive investment decisions. Market timing is extremely difficult. This information is for understanding market context only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Category Filter - Full width with side padding */}
            <div className="px-6 lg:px-8">
              <div 
                role="tablist" 
                aria-orientation="horizontal" 
                className="inline-flex items-center text-muted-foreground w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-8 overflow-x-auto flex-nowrap"
                data-orientation="horizontal"
              >
                {categories.map((category) => {
                  const isActive = activeCategory === category.key;
                  const Icon = category.icon;
                  
                  return (
                    <button
                      key={category.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      data-state={isActive ? "active" : "inactive"}
                      onClick={() => setActiveCategory(category.key)}
                      className={`
                        justify-center rounded-sm font-medium ring-offset-background transition-all 
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                        flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap
                        ${isActive 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                      tabIndex={isActive ? 0 : -1}
                      data-orientation="horizontal"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden">{category.mobileLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Grid - Full width with side padding */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 px-6 lg:px-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Info Rows */}
                  <div className="space-y-2 mb-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{product.timeHorizon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{product.riskLevel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{product.purpose}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic mb-4">{product.returnHint}</p>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsProductPopupOpen(true);
                    }}
                    className="text-emerald-700 font-semibold text-sm hover:underline"
                  >
                    View details →
                  </button>
                </Card>
              ))}
            </div>

            {/* Educational Disclaimer - Full width with side padding */}
            <div className="px-6 lg:px-8">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Educational Awareness Only:</strong> This information is for learning about available investment products and their characteristics. It does not constitute investment recommendations, advice, or suggestions to buy or sell any products. Consult with a qualified financial advisor before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Popup */}
      {isProductPopupOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <Card className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
            {/* Sticky Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedProduct.name}</h2>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  {selectedProduct.category}
                </span>
              </div>
              <button
                onClick={() => setIsProductPopupOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-6">
                {/* What is it used for */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">What is it used for?</h3>
                  <p className="text-slate-700">{selectedProduct.description}</p>
                </div>

                {/* Key Characteristics */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Key Characteristics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">Purpose:</span>
                      <span>{selectedProduct.purpose}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">Time Horizon:</span>
                      <span>{selectedProduct.timeHorizon}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">Risk Level:</span>
                      <span>{selectedProduct.riskLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Explanation */}
                <div className="bg-slate-100 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Risk Profile</h4>
                  <p className="text-sm text-slate-700">{getRiskExplanation(selectedProduct.riskLevel)}</p>
                </div>

                {/* Return Expectation */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Typical Long-term Expectation</h3>
                  <p className="text-slate-700">{selectedProduct.returnHint}</p>
                </div>

                {/* What NOT guaranteed */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">What This Does NOT Guarantee</h4>
                  <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                    <li>Past performance does not guarantee future results</li>
                    <li>Returns are not guaranteed unless stated by the provider</li>
                    <li>Market conditions can affect outcomes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-6">
              <Button
                onClick={() => navigate('/dashboard/investor-hub/elevate/')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium mb-3"
              >
                Talk to a Vinca Wealth Expert
              </Button>
              <p className="text-xs text-slate-600 text-center">
                Get personalized guidance based on your unique situation
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
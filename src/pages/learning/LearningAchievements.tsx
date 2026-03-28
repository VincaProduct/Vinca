import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { Award, Lock, CheckCircle2, TrendingUp, Star, Target, Crown, Zap, Sparkles, Gem, Flame, Brain, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useNavigate } from "react-router-dom";

// ============================================
// FIRST: Define ACHIEVEMENTS with 12 levels RIGHT HERE
// ============================================
const ACHIEVEMENTS = [
  // Level 1
  {
    id: "level-1",
    name: "Financial Explorer",
    description: "Take your first step into financial wisdom",
    pointsRequired: 100,
    icon: "Award",
  },
  // Level 2
  {
    id: "level-2",
    name: "Saving Seeker",
    description: "Build consistent saving habits",
    pointsRequired: 250,
    icon: "Award",
  },
  // Level 3
  {
    id: "level-3",
    name: "Budget Builder",
    description: "Master the art of budgeting",
    pointsRequired: 500,
    icon: "Award",
  },
  // Level 4
  {
    id: "level-4",
    name: "Debt Navigator",
    description: "Understand and manage debt effectively",
    pointsRequired: 1000,
    icon: "Award",
  },
  // Level 5
  {
    id: "level-5",
    name: "Investment Apprentice",
    description: "Begin your investment journey",
    pointsRequired: 2000,
    icon: "TrendingUp",
  },
  // Level 6
  {
    id: "level-6",
    name: "Portfolio Practitioner",
    description: "Build and maintain a diversified portfolio",
    pointsRequired: 3500,
    icon: "Flame",
  },
  // Level 7
  {
    id: "level-7",
    name: "Wealth Strategist",
    description: "Develop long-term wealth strategies",
    pointsRequired: 5500,
    icon: "Target",
  },
  // Level 8
  {
    id: "level-8",
    name: "Tax Tactician",
    description: "Optimize tax efficiency in your finances",
    pointsRequired: 8000,
    icon: "Brain",
  },
  // Level 9
  {
    id: "level-9",
    name: "Estate Architect",
    description: "Plan for generational wealth transfer",
    pointsRequired: 11000,
    icon: "Gem",
  },
  // Level 10
  {
    id: "level-10",
    name: "Financial Sage",
    description: "Demonstrate comprehensive financial mastery",
    pointsRequired: 15000,
    icon: "Star",
  },
  // LEVEL 11 - ADDED
  {
    id: "level-11",
    name: "Strategic Master",
    description: "Synthesize complex strategies across all financial domains",
    pointsRequired: 20000,
    icon: "Zap",
  },
  // LEVEL 12 - ADDED
  {
    id: "level-12",
    name: "Wisdom Keeper",
    description: "Achieve peak financial enlightenment and guide others",
    pointsRequired: 30000,
    icon: "Crown",
  },
];

// Helper function to get latest achievement (simplified version)
const getLatestAchievement = (points: number) => {
  const unlocked = ACHIEVEMENTS.filter(a => points >= a.pointsRequired);
  return unlocked[unlocked.length - 1] || null;
};

const advisoryDescriptions: Record<string, string> = {
  "level-1": "You have begun a structured financial practice.",
  "level-2": "You are building early momentum with intention.",
  "level-3": "You are developing consistent learning discipline.",
  "level-4": "You are expanding practical financial insight.",
  "level-5": "You are demonstrating confident financial awareness.",
  "level-6": "You are reinforcing disciplined financial behavior.",
  "level-7": "You are thinking strategically about your money.",
  "level-8": "You are exploring advanced financial depth.",
  "level-9": "You are refining mastery of advanced concepts.",
  "level-10": "You are operating with full financial maturity.",
  "level-11": "You are synthesizing complex financial strategies across multiple domains.",
  "level-12": "You have achieved peak financial wisdom and mastery, capable of teaching others.",
};

const getLevelIcon = (levelId: string, isUnlocked: boolean) => {
  const iconClass = isUnlocked ? "h-4 w-4" : "h-3.5 w-3.5 sm:h-4 sm:w-4";
  
  switch(levelId) {
    case "level-12":
      return <Crown className={iconClass} />;
    case "level-11":
      return <Zap className={iconClass} />;
    case "level-10":
      return <Star className={iconClass} />;
    case "level-9":
      return <Gem className={iconClass} />;
    case "level-8":
      return <Brain className={iconClass} />;
    case "level-7":
      return <Target className={iconClass} />;
    case "level-6":
      return <Flame className={iconClass} />;
    case "level-5":
      return <TrendingUp className={iconClass} />;
    default:
      return <Award className={iconClass} />;
  }
};

const LearningAchievements = () => {
  const navigate = useNavigate();
  const { progress } = useLearningProgress();
  const latestAchievement = getLatestAchievement(progress?.totalLearningPoints || 0);
  
  // Sort achievements by points required (1 → 12 order)
  const orderedAchievements = [...ACHIEVEMENTS].sort((a, b) => a.pointsRequired - b.pointsRequired);

  // VERIFY: This will show in console that we have 12 levels
  console.log("✅ Learning Ladder with", orderedAchievements.length, "levels:", 
    orderedAchievements.map(a => a.id).join(", "));

  const getCardVariant = (achievement: typeof ACHIEVEMENTS[0]) => {
    const isUnlocked = (progress?.totalLearningPoints || 0) >= achievement.pointsRequired;
    const isCurrent = latestAchievement?.id === achievement.id;
    
    if (isCurrent) return "current";
    if (isUnlocked) return "unlocked";
    return "locked";
  };

  const getProgressToNext = (achievement: typeof ACHIEVEMENTS[0]) => {
    const points = progress?.totalLearningPoints || 0;
    if (points >= achievement.pointsRequired) return 100;
    
    const currentIndex = orderedAchievements.findIndex(a => a.id === achievement.id);
    const prevPoints = currentIndex > 0 ? orderedAchievements[currentIndex - 1].pointsRequired : 0;
    
    const pointsNeeded = achievement.pointsRequired - prevPoints;
    const pointsEarned = Math.max(0, points - prevPoints);
    
    return Math.min(100, Math.round((pointsEarned / pointsNeeded) * 100));
  };

  const renderAchievementCard = (achievement: typeof ACHIEVEMENTS[0]) => {
    const variant = getCardVariant(achievement);
    const isUnlocked = variant === "unlocked" || variant === "current";
    const isCurrent = variant === "current";
    const isFuture = variant === "locked";
    
    const points = progress?.totalLearningPoints || 0;
    const unlockDate = progress?.achievementUnlocks?.[achievement.id];
    const description = advisoryDescriptions[achievement.id] ?? achievement.description;
    const progressPercent = getProgressToNext(achievement);
    
    // Get level number from ID
    const levelNumber = parseInt(achievement.id.replace("level-", ""));

    return (
      <Card
        key={achievement.id}
        className="rounded-lg border border-border bg-card shadow-sm group relative overflow-hidden transition-all duration-300"
      >
        {/* Progress indicator bar for locked levels */}
        {isFuture && progressPercent > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-emerald-200/50 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        )}
        <CardContent className="p-4 flex flex-col gap-3 h-full">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-4 ${isCurrent ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                >
                  Level {levelNumber}
                </Badge>
                <h3 className={`text-base font-semibold leading-tight ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>{achievement.name}</h3>
                {/* Current indicator */}
                {isCurrent && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium">Current</span>
                  </div>
                )}
                {/* Special badges for top levels */}
                {levelNumber === 12 && isUnlocked && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                    👑 Grand Master
                  </Badge>
                )}
                {levelNumber === 11 && isUnlocked && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                    ⚡ Elite
                  </Badge>
                )}
                {levelNumber === 10 && isUnlocked && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    🌟 Sage
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Icon */}
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300
                ${isUnlocked 
                  ? levelNumber === 12 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : levelNumber === 11
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
                }
                ${isCurrent ? "ring-2 ring-emerald-200 dark:ring-emerald-800" : ""}`}
            >
              {isUnlocked ? getLevelIcon(achievement.id, true) : <Lock className="h-4 w-4" />}
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2 ${isFuture ? "opacity-70" : ""}`}>{description}</p>

          {/* Footer metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Points */}
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-0.5 h-5 font-mono"
            >
              {achievement.pointsRequired.toLocaleString()} pts
            </Badge>

            {/* Status badges */}
            {isUnlocked && !isCurrent && unlockDate && (
              <span className="text-muted-foreground">
                {new Date(unlockDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            
            {isCurrent && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {points.toLocaleString()} pts earned
              </span>
            )}
            
            {isFuture && (
              <span className="text-emerald-600/80 dark:text-emerald-500/80 font-medium">
                {achievement.pointsRequired - points} pts needed
              </span>
            )}
          </div>

          {/* Mobile-specific progress hint */}
          {isFuture && progressPercent > 0 && (
            <div className="mt-2 sm:hidden">
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                <span>Progress to next</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400/50 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Calculate stats
  const points = progress?.totalLearningPoints || 0;
  const completedCount = orderedAchievements.filter(a => points >= a.pointsRequired).length;
  const nextLevel = orderedAchievements.find(a => points < a.pointsRequired);

  return (
    <div className="space-y-4 sm:space-y-6">
      <CanonicalPageHeader
        title="Learning Ladder"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/learning")}
            className="hidden sm:flex w-full sm:w-auto"
          >
            Back to Learning
          </Button>
        }
        children={
          <Button
            variant="ghost"
            size="icon"
            className="flex sm:hidden h-8 w-8 -ml-1 mt-2"
            onClick={() => navigate("/dashboard/learning")}
            aria-label="Back to Learning"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        }
      />

      {/* ============================================ */}
      {/* ACHIEVEMENT GRID - 12 LEVELS IN 3-COLUMN GRID */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {orderedAchievements.map((achievement) => renderAchievementCard(achievement))}
      </div>

      {/* Mobile summary card */}
      <div className="block sm:hidden mt-4">
        <Card className="bg-muted/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next Level</span>
              <span className="font-semibold text-emerald-600">
                {nextLevel?.name || "🏆 Mastery Achieved"}
              </span>
            </div>
            {nextLevel && completedCount > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progress to {nextLevel.name}</span>
                  <span>
                    {Math.min(100, Math.round(
                      ((points - orderedAchievements[completedCount - 1].pointsRequired) /
                      (nextLevel.pointsRequired - orderedAchievements[completedCount - 1].pointsRequired)) * 100
                    ))}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ 
                      width: `${Math.min(100, Math.round(
                        ((points - orderedAchievements[completedCount - 1].pointsRequired) /
                        (nextLevel.pointsRequired - orderedAchievements[completedCount - 1].pointsRequired)) * 100
                      ))}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default LearningAchievements;
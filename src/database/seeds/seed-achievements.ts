/**
 * Achievement Seed Data
 * 
 * Run this after running migrations:
 * ts-node -r tsconfig-paths/register src/database/seeds/seed-achievements.ts
 */

export const achievementsSeedData = [
  // Bronze Tier - Beginner Achievements
  {
    code: 'first_login',
    title: 'Welcome Aboard!',
    description: 'Log in for the first time',
    pointsReward: 10,
    tier: 'bronze',
    iconUrl: '/icons/achievements/first_login.png',
  },
  {
    code: 'first_level_complete',
    title: 'First Victory',
    description: 'Complete your first level',
    pointsReward: 25,
    tier: 'bronze',
    iconUrl: '/icons/achievements/first_victory.png',
  },
  {
    code: 'first_chapter_complete',
    title: 'Chapter Hero',
    description: 'Complete your first chapter',
    pointsReward: 50,
    tier: 'bronze',
    iconUrl: '/icons/achievements/chapter_hero.png',
  },
  {
    code: 'streak_3_days',
    title: 'Consistency Starter',
    description: 'Study for 3 days in a row',
    pointsReward: 30,
    tier: 'bronze',
    iconUrl: '/icons/achievements/streak_3.png',
  },
  {
    code: 'pronunciation_practice_10',
    title: 'Pronunciation Rookie',
    description: 'Practice pronunciation 10 times',
    pointsReward: 20,
    tier: 'bronze',
    iconUrl: '/icons/achievements/pronunciation_rookie.png',
  },

  // Silver Tier - Intermediate Achievements
  {
    code: 'perfect_score_level',
    title: 'Perfect Score',
    description: 'Get 100% on any level',
    pointsReward: 75,
    tier: 'silver',
    iconUrl: '/icons/achievements/perfect_score.png',
  },
  {
    code: 'streak_7_days',
    title: 'Weekly Warrior',
    description: 'Study for 7 days in a row',
    pointsReward: 100,
    tier: 'silver',
    iconUrl: '/icons/achievements/weekly_warrior.png',
  },
  {
    code: 'chapters_complete_5',
    title: 'Chapter Master',
    description: 'Complete 5 chapters',
    pointsReward: 150,
    tier: 'silver',
    iconUrl: '/icons/achievements/chapter_master.png',
  },
  {
    code: 'pronunciation_practice_50',
    title: 'Pronunciation Pro',
    description: 'Practice pronunciation 50 times',
    pointsReward: 80,
    tier: 'silver',
    iconUrl: '/icons/achievements/pronunciation_pro.png',
  },
  {
    code: 'points_1000',
    title: 'Point Collector',
    description: 'Earn 1,000 total points',
    pointsReward: 100,
    tier: 'silver',
    iconUrl: '/icons/achievements/point_collector.png',
  },

  // Gold Tier - Advanced Achievements
  {
    code: 'streak_30_days',
    title: 'Monthly Champion',
    description: 'Study for 30 days in a row',
    pointsReward: 300,
    tier: 'gold',
    iconUrl: '/icons/achievements/monthly_champion.png',
  },
  {
    code: 'perfect_scores_10',
    title: 'Perfectionist',
    description: 'Get 100% on 10 different levels',
    pointsReward: 250,
    tier: 'gold',
    iconUrl: '/icons/achievements/perfectionist.png',
  },
  {
    code: 'chapters_complete_20',
    title: 'Story Explorer',
    description: 'Complete 20 chapters',
    pointsReward: 400,
    tier: 'gold',
    iconUrl: '/icons/achievements/story_explorer.png',
  },
  {
    code: 'pronunciation_master_100',
    title: 'Pronunciation Master',
    description: 'Practice pronunciation 100 times with high scores',
    pointsReward: 200,
    tier: 'gold',
    iconUrl: '/icons/achievements/pronunciation_master.png',
  },
  {
    code: 'points_5000',
    title: 'Point Hoarder',
    description: 'Earn 5,000 total points',
    pointsReward: 300,
    tier: 'gold',
    iconUrl: '/icons/achievements/point_hoarder.png',
  },

  // Platinum Tier - Elite Achievements
  {
    code: 'streak_100_days',
    title: 'Legendary Streak',
    description: 'Study for 100 days in a row',
    pointsReward: 1000,
    tier: 'platinum',
    iconUrl: '/icons/achievements/legendary_streak.png',
  },
  {
    code: 'all_chapters_complete',
    title: 'Complete Mastery',
    description: 'Complete all available chapters',
    pointsReward: 1500,
    tier: 'platinum',
    iconUrl: '/icons/achievements/complete_mastery.png',
  },
  {
    code: 'perfect_scores_50',
    title: 'Ultimate Perfectionist',
    description: 'Get 100% on 50 different levels',
    pointsReward: 1000,
    tier: 'platinum',
    iconUrl: '/icons/achievements/ultimate_perfectionist.png',
  },
  {
    code: 'top_10_leaderboard',
    title: 'Top 10 Achiever',
    description: 'Reach top 10 on the all-time leaderboard',
    pointsReward: 800,
    tier: 'platinum',
    iconUrl: '/icons/achievements/top_10.png',
  },
  {
    code: 'points_20000',
    title: 'Point Legend',
    description: 'Earn 20,000 total points',
    pointsReward: 1200,
    tier: 'platinum',
    iconUrl: '/icons/achievements/point_legend.png',
  },
];

console.log('Achievement seed data created with', achievementsSeedData.length, 'achievements');
console.log('To seed: Import this file and insert into the achievements table');

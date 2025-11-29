/**
 * Lazy-loaded page components
 * These pages are loaded on-demand to reduce initial bundle size
 */

import { lazy } from 'react';

// Heavy pages - lazy load to reduce initial bundle
export const Adults = lazy(() => import('@/pages/adults/adults'));
export const MultiModePracticePage = lazy(() => import('@/pages/adults/MultiModePracticePage'));
export const PronunciationAnalyzerPage = lazy(() => import('@/pages/adults/PronunciationAnalyzerPage'));
export const VideoLessons = lazy(() => import('@/pages/adults/VideoLessons'));
export const VideoDetail = lazy(() => import('@/pages/adults/VideoDetail'));
export const Beginners = lazy(() => import('@/pages/adults/Beginners'));
export const Intermediates = lazy(() => import('@/pages/adults/Intermediates'));
export const Advanced = lazy(() => import('@/pages/adults/Advanced'));
export const QuickPracticeSession = lazy(() => import('@/pages/adults/QuickPracticeSession'));
export const TeenKidsPage = lazy(() => import('@/pages/TeenKids'));
export const YoungKidsPage = lazy(() => import('@/pages/YoungKids'));
export const VirtualAI = lazy(() => import('@/pages/VirtualAI'));
export const IeltsPte = lazy(() => import('@/pages/IeltsPte'));
export const Profile = lazy(() => import('@/pages/Profile'));
export const CertificatesPage = lazy(() => import('@/pages/Certificates'));
export const AllCertificatesPage = lazy(() => import('@/pages/AllCertificates'));

// Admin pages - lazy load (not needed on initial load)
export const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
export const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
export const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
export const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
export const AdminVideos = lazy(() => import('@/pages/admin/AdminVideos'));
export const AdminLessons = lazy(() => import('@/pages/admin/AdminLessons'));
export const AdminPractice = lazy(() => import('@/pages/admin/AdminPractice'));
export const AdminProgress = lazy(() => import('@/pages/admin/AdminProgress'));
export const AdminVocabulary = lazy(() => import('@/pages/admin/AdminVocabulary'));
export const AdminAchievements = lazy(() => import('@/pages/admin/AdminAchievements'));
export const AdminSurveys = lazy(() => import('@/pages/admin/AdminSurveys'));


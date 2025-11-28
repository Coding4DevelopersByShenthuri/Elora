import { useState, useEffect } from 'react';
import { Mail, Send, FileText, TrendingUp, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface EmailTemplate {
  id: number;
  title: string;
  description: string;
  template_type: string;
  subject_template: string;
  body_template: string;
  tips?: string[];
  common_phrases?: string[];
  example_email?: string;
  difficulty: string;
  usage_count: number;
}

interface EmailPracticeSession {
  id: number;
  template: EmailTemplate;
  subject: string;
  body: string;
  grammar_score: number;
  tone_score: number;
  clarity_score: number;
  overall_score: number;
  feedback: any;
  suggestions: string[];
  created_at: string;
}

interface BusinessEmailCoachProps {
  onClose: () => void;
}

export default function BusinessEmailCoach({ onClose }: BusinessEmailCoachProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<EmailPracticeSession[]>([]);
  const [feedback, setFeedback] = useState<EmailPracticeSession | null>(null);

  useEffect(() => {
    if (user) {
      loadTemplates();
      loadHistory();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getEmailTemplates();
      if (result.success && 'data' in result) {
        setTemplates(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const result = await AdultsAPI.getEmailPracticeHistory();
      if (result.success && 'data' in result) {
        setPracticeHistory(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleTemplateSelect = async (templateId: number) => {
    try {
      const result = await AdultsAPI.getEmailTemplateDetail(templateId);
      if (result.success && 'data' in result) {
        const template = result.data?.data;
        setSelectedTemplate(template);
        setEmailSubject(template.subject_template || '');
        setEmailBody(template.body_template || '');
        setFeedback(null);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !emailSubject.trim() || !emailBody.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await AdultsAPI.submitEmailPractice({
        template_id: selectedTemplate.id,
        subject: emailSubject,
        body: emailBody,
      });

      if (result.success && 'data' in result) {
        setFeedback(result.data?.data);
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const showCloseButton = onClose && typeof onClose === 'function';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Business Email Coach</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Short, focused exercises for busy professionals</p>
      </div>

      <Card className={cn(
        "bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl w-full flex flex-col dark:bg-slate-900/60 dark:border-emerald-500/30",
        showCloseButton ? "max-w-7xl max-h-[90vh]" : ""
      )}>
        {showCloseButton && (
          <CardHeader className="border-b border-primary/30 dark:border-emerald-500/30">
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground dark:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        )}

        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <Tabs defaultValue="practice" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full bg-card/60 backdrop-blur-xl border-b border-primary/30 rounded-none dark:bg-slate-800/50 dark:border-emerald-500/30">
              <TabsTrigger value="practice" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">Practice</TabsTrigger>
              <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">History</TabsTrigger>
            </TabsList>

          <TabsContent value="practice" className="flex-1 overflow-hidden flex flex-col p-6">
            <div className="max-w-6xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Template Selection */}
                <div className="lg:col-span-1 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Email Templates</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-muted-foreground dark:text-cyan-100/70 text-center py-8">Loading templates...</div>
                    ) : templates.length === 0 ? (
                      <div className="text-muted-foreground dark:text-cyan-100/70 text-center py-8">No templates available</div>
                    ) : (
                      templates.map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            'cursor-pointer transition-all border-primary/30 dark:border-emerald-500/30',
                            selectedTemplate?.id === template.id
                              ? 'bg-primary/20 border-primary/50 dark:bg-emerald-500/20 dark:border-emerald-400/50'
                              : 'bg-card/60 hover:bg-card/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/50'
                          )}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-foreground dark:text-white">{template.title}</h4>
                              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                                {template.template_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-cyan-100/70 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground dark:text-cyan-300/60">
                              <TrendingUp className="h-3 w-3" />
                              <span>{template.usage_count} uses</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* Email Editor */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  {selectedTemplate ? (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                          Write Your Email: {selectedTemplate.title}
                        </h3>
                        {selectedTemplate.tips && selectedTemplate.tips.length > 0 && (
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                            <p className="text-sm font-semibold text-primary dark:text-emerald-300 mb-2">Tips:</p>
                            <ul className="list-disc list-inside text-sm text-foreground dark:text-cyan-100/80 space-y-1">
                              {selectedTemplate.tips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 flex-1 flex flex-col">
                        <div>
                          <Label className="text-foreground dark:text-cyan-100/80 mb-2">Subject</Label>
                          <Input
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Email subject..."
                            className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800/50 dark:border-emerald-500/30 dark:text-white"
                          />
                        </div>

                        <div className="flex-1 flex flex-col">
                          <Label className="text-foreground dark:text-cyan-100/80 mb-2">Body</Label>
                          <Textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Write your email here..."
                            className="flex-1 bg-card/60 backdrop-blur-xl border-primary/30 text-foreground resize-none dark:bg-slate-800/50 dark:border-emerald-500/30 dark:text-white"
                          />
                        </div>

                        <Button
                          onClick={handleSubmit}
                          disabled={submitting || !emailSubject.trim() || !emailBody.trim()}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submitting ? 'Submitting...' : 'Submit for Feedback'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <FileText className="h-16 w-16 text-primary dark:text-emerald-300 mx-auto mb-4" />
                        <p className="text-muted-foreground dark:text-cyan-100/70">
                          Select an email template to start practicing
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Display */}
            {feedback && (
              <div className="max-w-6xl mx-auto w-full mt-4">
                <Card className="border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        AI Feedback
                      </h4>
                      <Button variant="ghost" size="icon" onClick={() => setFeedback(null)} className="text-foreground dark:text-white">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className={cn('text-2xl font-bold mb-1 text-foreground dark:text-white', getScoreColor(feedback.grammar_score))}>
                          {Math.round(feedback.grammar_score)}%
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Grammar</div>
                        <Progress value={feedback.grammar_score} className="h-2 mt-2 bg-muted dark:bg-slate-700/50" />
                      </div>
                      <div className="text-center">
                        <div className={cn('text-2xl font-bold mb-1 text-foreground dark:text-white', getScoreColor(feedback.tone_score))}>
                          {Math.round(feedback.tone_score)}%
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Tone</div>
                        <Progress value={feedback.tone_score} className="h-2 mt-2 bg-muted dark:bg-slate-700/50" />
                      </div>
                      <div className="text-center">
                        <div className={cn('text-2xl font-bold mb-1 text-foreground dark:text-white', getScoreColor(feedback.clarity_score))}>
                          {Math.round(feedback.clarity_score)}%
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Clarity</div>
                        <Progress value={feedback.clarity_score} className="h-2 mt-2 bg-muted dark:bg-slate-700/50" />
                      </div>
                      <div className="text-center">
                        <div className={cn('text-2xl font-bold mb-1 text-foreground dark:text-white', getScoreColor(feedback.overall_score))}>
                          {Math.round(feedback.overall_score)}%
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Overall</div>
                        <Progress value={feedback.overall_score} className="h-2 mt-2 bg-muted dark:bg-slate-700/50" />
                      </div>
                    </div>

                    {feedback.suggestions && feedback.suggestions.length > 0 && (
                      <div className="bg-card/50 rounded-lg p-4 dark:bg-slate-800/50">
                        <p className="text-sm font-semibold text-primary dark:text-emerald-300 mb-2">Suggestions:</p>
                        <ul className="list-disc list-inside text-sm text-foreground dark:text-cyan-100/80 space-y-1">
                          {feedback.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto w-full">
              <div className="space-y-3">
                {practiceHistory.length === 0 ? (
                  <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
                      <p className="text-muted-foreground dark:text-cyan-100/70">
                        No practice sessions yet. Submit an email to see your feedback history!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  practiceHistory.map((session) => (
                    <Card key={session.id} className="border-primary/30 bg-card/80 backdrop-blur-xl dark:border-emerald-500/30 dark:bg-slate-800/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground dark:text-white">{session.template.title}</h4>
                              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                                {session.template.template_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-2 line-clamp-1">
                              <strong>Subject:</strong> {session.subject}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={cn('text-xl font-bold text-foreground dark:text-white', getScoreColor(session.overall_score))}>
                              {Math.round(session.overall_score)}%
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-cyan-100/70">
                              {new Date(session.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground dark:text-cyan-100/60">
                          <span>Grammar: {Math.round(session.grammar_score)}%</span>
                          <span>Tone: {Math.round(session.tone_score)}%</span>
                          <span>Clarity: {Math.round(session.clarity_score)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}


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
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const showCloseButton = onClose && typeof onClose === 'function';
  
  return (
    <Card className={cn(
      "bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full flex flex-col",
      showCloseButton ? "max-w-5xl max-h-[90vh]" : ""
    )}>
      <CardHeader className="border-b border-purple-500/30">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            Business Email Coach
          </span>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <Tabs defaultValue="practice" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full bg-slate-800/50 border-b border-purple-500/30 rounded-none">
            <TabsTrigger value="practice" className="flex-1">Practice</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="flex-1 overflow-hidden flex flex-col p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Template Selection */}
              <div className="lg:col-span-1 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Email Templates</h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-cyan-100/70 text-center py-8">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="text-cyan-100/70 text-center py-8">No templates available</div>
                  ) : (
                    templates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          'cursor-pointer transition-all border-purple-500/30',
                          selectedTemplate?.id === template.id
                            ? 'bg-purple-500/20 border-purple-400/50'
                            : 'bg-slate-800/30 hover:bg-slate-800/50'
                        )}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{template.title}</h4>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                              {template.template_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-cyan-100/70 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-cyan-300/60">
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
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Write Your Email: {selectedTemplate.title}
                      </h3>
                      {selectedTemplate.tips && selectedTemplate.tips.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                          <p className="text-sm font-semibold text-blue-300 mb-2">Tips:</p>
                          <ul className="list-disc list-inside text-sm text-cyan-100/80 space-y-1">
                            {selectedTemplate.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col">
                      <div>
                        <Label className="text-cyan-100/80 mb-2">Subject</Label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email subject..."
                          className="bg-slate-800/50 border-purple-500/30 text-white"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <Label className="text-cyan-100/80 mb-2">Body</Label>
                        <Textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your email here..."
                          className="flex-1 bg-slate-800/50 border-purple-500/30 text-white resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !emailSubject.trim() || !emailBody.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Submitting...' : 'Submit for Feedback'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <FileText className="h-16 w-16 text-cyan-300/50 mx-auto mb-4" />
                      <p className="text-cyan-100/70">
                        Select an email template to start practicing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Display */}
            {feedback && (
              <Card className="mt-4 border-green-500/30 bg-green-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      AI Feedback
                    </h4>
                    <Button variant="ghost" size="icon" onClick={() => setFeedback(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className={cn('text-2xl font-bold mb-1', getScoreColor(feedback.grammar_score))}>
                        {Math.round(feedback.grammar_score)}%
                      </div>
                      <div className="text-xs text-cyan-100/70">Grammar</div>
                      <Progress value={feedback.grammar_score} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <div className={cn('text-2xl font-bold mb-1', getScoreColor(feedback.tone_score))}>
                        {Math.round(feedback.tone_score)}%
                      </div>
                      <div className="text-xs text-cyan-100/70">Tone</div>
                      <Progress value={feedback.tone_score} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <div className={cn('text-2xl font-bold mb-1', getScoreColor(feedback.clarity_score))}>
                        {Math.round(feedback.clarity_score)}%
                      </div>
                      <div className="text-xs text-cyan-100/70">Clarity</div>
                      <Progress value={feedback.clarity_score} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <div className={cn('text-2xl font-bold mb-1', getScoreColor(feedback.overall_score))}>
                        {Math.round(feedback.overall_score)}%
                      </div>
                      <div className="text-xs text-cyan-100/70">Overall</div>
                      <Progress value={feedback.overall_score} className="h-2 mt-2" />
                    </div>
                  </div>

                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-cyan-300 mb-2">Suggestions:</p>
                      <ul className="list-disc list-inside text-sm text-cyan-100/80 space-y-1">
                        {feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {practiceHistory.length === 0 ? (
                <div className="text-center py-8 text-cyan-100/70">
                  No practice sessions yet. Submit an email to see your feedback history!
                </div>
              ) : (
                practiceHistory.map((session) => (
                  <Card key={session.id} className="border-purple-500/30 bg-slate-800/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{session.template.title}</h4>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                              {session.template.template_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-cyan-100/70 mb-2 line-clamp-1">
                            <strong>Subject:</strong> {session.subject}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={cn('text-xl font-bold', getScoreColor(session.overall_score))}>
                            {Math.round(session.overall_score)}%
                          </div>
                          <div className="text-xs text-cyan-100/70">
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-cyan-100/60">
                        <span>Grammar: {Math.round(session.grammar_score)}%</span>
                        <span>Tone: {Math.round(session.tone_score)}%</span>
                        <span>Clarity: {Math.round(session.clarity_score)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


'use client'

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, MapPin, Scale, BookOpen, Users, FileText, Star, Trophy, User, Gavel, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Case } from '../data/mockCases';
import { Metadata } from 'next';
import Head from 'next/head';
import Script from 'next/script';

interface CaseDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CaseDetail({ params }: CaseDetailProps) {
  const { id } = use(params);
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/casevault/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Case not found');
          }
          throw new Error('Failed to fetch case details');
        }
        
        const data = await response.json();
        setCaseItem(data);
      } catch (err) {
        console.error('Error fetching case:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCase();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getLegalAreaColor = (area: string) => {
    const colors: { [key: string]: string } = {
      'Criminal': 'bg-red-100 text-red-800',
      'Civil': 'bg-blue-100 text-blue-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Constitutional': 'bg-green-100 text-green-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Labor': 'bg-yellow-100 text-yellow-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome: string) => {
    const colors: { [key: string]: string } = {
      'Won': 'bg-green-100 text-green-800',
      'Settled': 'bg-blue-100 text-blue-800',
      'Dismissed': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Appeal': 'bg-purple-100 text-purple-800'
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Case Header Skeleton */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Metadata Skeleton */}
              <div className="flex flex-wrap gap-6 text-sm">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>

            {/* Content Skeletons */}
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{error || 'Case Not Found'}</h1>
          <Link href="/casevault">
            <Button>Return to Explorer</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data for the case
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LegalCase",
    "name": caseItem.title,
    "identifier": caseItem.citation,
    "description": caseItem.shortSummary,
    "datePublished": caseItem.judgmentDate,
    "court": {
      "@type": "Court",
      "name": caseItem.court
    },
    "keywords": caseItem.tags.join(", "),
    "about": {
      "@type": "Thing",
      "name": caseItem.legalArea
    }
  };

  return (
    <>
      <Head>
        <title>{`${caseItem.title} | ${caseItem.citation} | CaseVault`}</title>
        <meta name="description" content={caseItem.shortSummary.substring(0, 160)} />
        <meta name="keywords" content={`${caseItem.legalArea}, ${caseItem.tags.join(', ')}, legal case, case law, ${caseItem.court}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${caseItem.title} | CaseVault`} />
        <meta property="og:description" content={caseItem.shortSummary.substring(0, 160)} />
        <meta property="og:url" content={`https://vikasgoyanka.in/casevault/${caseItem.id}`} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${caseItem.title} | CaseVault`} />
        <meta property="twitter:description" content={caseItem.shortSummary.substring(0, 160)} />
      </Head>

      <Script id="case-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className={`min-h-screen ${caseItem.isOwnCase ? 'bg-slate-900' : 'bg-background'}`}>
        {/* Header */}
        <header className={`border-b ${caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : 'bg-card'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/casevault">
                <Button variant="ghost" size="sm" className={caseItem.isOwnCase ? 'text-white hover:bg-slate-700' : ''}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Explorer
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <Link 
                  href="https://vikasgoyanka.in" 
                  target="_blank" 
                  className={`text-xs ${caseItem.isOwnCase ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-primary'} transition-colors flex items-center`}
                >
                  <span className="hidden md:inline">A project by</span>
                  <span className="font-semibold ml-1">Vikas Goyanka</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
                <div className="h-4 w-px bg-border mx-1 hidden md:block"></div>
                <div className="flex items-center space-x-2">
                  <Scale className={`h-6 w-6 ${caseItem.isOwnCase ? 'text-amber-400' : 'text-primary'}`} />
                  <span className={`font-semibold ${caseItem.isOwnCase ? 'text-white' : ''}`}>CaseVault</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Case Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-bold ${caseItem.isOwnCase ? 'text-white' : 'text-foreground'}`}>
                      {caseItem.title}
                    </h1>
                    {caseItem.isOwnCase && (
                      <Badge className="bg-amber-600 text-white">
                        <User className="h-3 w-3 mr-1" />
                        Litigated by Me
                      </Badge>
                    )}
                    {caseItem.isHighImpact && (
                      <Star className="h-6 w-6 text-amber-400 fill-current" />
                    )}
                  </div>
                  <p className={`text-lg font-mono ${caseItem.isOwnCase ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    {caseItem.citation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getLegalAreaColor(caseItem.legalArea)}`}>
                    {caseItem.legalArea}
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className={`flex flex-wrap gap-6 text-sm ${caseItem.isOwnCase ? 'text-gray-300' : 'text-muted-foreground'}`}>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {caseItem.court}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(caseItem.judgmentDate)}
                </div>
                <div className="flex items-center">
                  <Scale className="h-4 w-4 mr-2" />
                  {caseItem.stage}
                </div>
                {caseItem.isOwnCase && caseItem.outcome && (
                  <Badge className={`${getOutcomeColor(caseItem.outcome)}`}>
                    <Trophy className="h-3 w-3 mr-1" />
                    {caseItem.outcome}
                  </Badge>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {caseItem.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className={caseItem.isOwnCase ? 'bg-slate-700 text-gray-200' : ''}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Own Case Specific Content */}
            {caseItem.isOwnCase && (
              <div className="grid gap-6 mb-8">
                {/* Court Progression Timeline */}
                {caseItem.courtProgression && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Gavel className="h-5 w-5 mr-2 text-amber-400" />
                        Court Journey Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {caseItem.courtProgression.map((progression, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{progression.court}</h4>
                              <p className="text-sm text-gray-300 mb-1">{formatDate(progression.date)}</p>
                              <p className="text-sm text-gray-200 mb-2">{progression.orderSummary}</p>
                              <Badge className={`${getOutcomeColor(progression.outcome)} text-xs`}>
                                {progression.outcome}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* My Role & Client Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  {caseItem.myRole && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">My Role</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-200">{caseItem.myRole}</p>
                      </CardContent>
                    </Card>
                  )}

                  {caseItem.clientTestimony && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Client Background</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-200">{caseItem.clientTestimony}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Personal Commentary */}
                {caseItem.personalCommentary && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Personal Commentary & Learnings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-2">Challenges</h4>
                        <p className="text-gray-200">{caseItem.personalCommentary.challenges}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-2">Key Learnings</h4>
                        <p className="text-gray-200">{caseItem.personalCommentary.learnings}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-2">Turning Point</h4>
                        <p className="text-gray-200">{caseItem.personalCommentary.turningPoint}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Case Content */}
            <div className="grid gap-6">
              {/* Summary */}
              <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${caseItem.isOwnCase ? 'text-white' : ''}`}>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Case Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`leading-relaxed ${caseItem.isOwnCase ? 'text-gray-200' : 'text-foreground'}`}>
                    {caseItem.shortSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Facts, Issues, Held */}
              <div className="grid md:grid-cols-1 gap-6">
                <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                  <CardHeader>
                    <CardTitle className={caseItem.isOwnCase ? 'text-white' : ''}>Facts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`leading-relaxed ${caseItem.isOwnCase ? 'text-gray-200' : 'text-foreground'}`}>
                      {caseItem.facts}
                    </p>
                  </CardContent>
                </Card>

                <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                  <CardHeader>
                    <CardTitle className={caseItem.isOwnCase ? 'text-white' : ''}>Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`leading-relaxed ${caseItem.isOwnCase ? 'text-gray-200' : 'text-foreground'}`}>
                      {caseItem.issues}
                    </p>
                  </CardContent>
                </Card>

                <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                  <CardHeader>
                    <CardTitle className={caseItem.isOwnCase ? 'text-white' : ''}>Held</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`leading-relaxed ${caseItem.isOwnCase ? 'text-gray-200' : 'text-foreground'}`}>
                      {caseItem.held}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Legal Principles */}
              <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <CardTitle className={caseItem.isOwnCase ? 'text-white' : ''}>Legal Principles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {caseItem.legalPrinciples.map((principle, index) => (
                      <li key={index} className={caseItem.isOwnCase ? 'text-gray-200' : 'text-foreground'}>
                        {principle}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Related Cases */}
              {caseItem.relatedCases.length > 0 && (
                <Card className={caseItem.isOwnCase ? 'bg-slate-800 border-slate-700' : ''}>
                  <CardHeader>
                    <CardTitle className={caseItem.isOwnCase ? 'text-white' : ''}>Related Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {caseItem.relatedCases.map((relatedCase, index) => (
                        <li key={index} className={`cursor-pointer hover:underline ${caseItem.isOwnCase ? 'text-amber-400 hover:text-amber-300' : 'text-primary'}`}>
                          {relatedCase}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
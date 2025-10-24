"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ExternalLink, Search, Sparkles, Shield, Zap, Target, Eye, Lock, AlertTriangle, Database, Code, FileText, Globe, Github, Linkedin } from "lucide-react"

interface DorkCategory {
  title: string
  dorks: string[]
  icon: React.ReactNode
  description: string
  color: string
}

const dorkCategories: DorkCategory[] = [
  {
    title: "PHP Parameter Endpoints",
    dorks: ["site:{domain} ext:php inurl:?"],
    icon: <Code className="h-4 w-4" />,
    description: "Discover PHP endpoints with parameters",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  {
    title: "API Surface Mapping",
    dorks: ["site:{domain} inurl:api | site:*/rest | site:*/v1 | site:*/v2 | site:*/v3"],
    icon: <Globe className="h-4 w-4" />,
    description: "Map API endpoints and versions",
    color: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  {
    title: "Sensitive File Discovery",
    dorks: ['site:"{domain}" ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:~ | ext:git | ext:svn | ext:htpasswd | ext:htaccess | ext:json'],
    icon: <FileText className="h-4 w-4" />,
    description: "Find configuration and sensitive files",
    color: "bg-red-500/10 text-red-600 border-red-500/20"
  },
  {
    title: "Critical URL Tokens",
    dorks: ["inurl:conf | inurl:env | inurl:cgi | inurl:bin | inurl:etc | inurl:root | inurl:sql | inurl:backup | inurl:admin | inurl:php site:{domain}"],
    icon: <Target className="h-4 w-4" />,
    description: "Locate important URL patterns",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  {
    title: "Error Pages & Traces",
    dorks: ['inurl:"error" | intitle:"exception" | intitle:"failure" | intitle:"server at" | inurl:exception | "database error" | "SQL syntax" | "undefined index" | "unhandled exception" | "stack trace" site:{domain}'],
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Find error pages and stack traces",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  },
  {
    title: "XSS Parameters",
    dorks: ["inurl:q= | inurl:s= | inurl:search= | inurl:query= | inurl:keyword= | inurl:lang= inurl:& site:{domain}"],
    icon: <Zap className="h-4 w-4" />,
    description: "Identify potential XSS vectors",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
  },
  {
    title: "Redirect Parameters",
    dorks: ["inurl:url= | inurl:return= | inurl:next= | inurl:redirect= | inurl:redir= | inurl:ret= | inurl:r2= | inurl:page= inurl:& inurl:http site:{domain}"],
    icon: <ExternalLink className="h-4 w-4" />,
    description: "Find redirect parameter vulnerabilities",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
  },
  {
    title: "SQL Injection Parameters",
    dorks: ["inurl:id= | inurl:pid= | inurl:category= | inurl:cat= | inurl:action= | inurl:sid= | inurl:dir= inurl:& site:{domain}"],
    icon: <Database className="h-4 w-4" />,
    description: "Common SQLi parameter patterns",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20"
  },
  {
    title: "SSRF Parameters",
    dorks: ["inurl:http | inurl:url= | inurl:path= | inurl:dest= | inurl:html= | inurl:data= | inurl:domain= | inurl:page= inurl:& site:{domain}"],
    icon: <Shield className="h-4 w-4" />,
    description: "Server-Side Request Forgery vectors",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
  },
  {
    title: "File Inclusion Candidates",
    dorks: ["inurl:include | inurl:dir | inurl:detail= | inurl:file= | inurl:folder= | inurl:inc= | inurl:locate= | inurl:doc= | inurl:conf= inurl:& site:{domain}"],
    icon: <FileText className="h-4 w-4" />,
    description: "Local and remote file inclusion",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20"
  },
  {
    title: "Command Execution",
    dorks: ["inurl:cmd | inurl:exec= | inurl:query= | inurl:code= | inurl:do= | inurl:run= | inurl:read= | inurl:ping= inurl:& site:{domain}"],
    icon: <Zap className="h-4 w-4" />,
    description: "Remote command execution parameters",
    color: "bg-red-500/10 text-red-600 border-red-500/20"
  },
  {
    title: "File Upload Discovery",
    dorks: ['site:{domain} intext:"choose file" | intext:"select file" | intext:"upload PDF"'],
    icon: <FileText className="h-4 w-4" />,
    description: "Find file upload functionality",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  {
    title: "API Documentation",
    dorks: ['inurl:apidocs | inurl:api-docs | inurl:swagger | inurl:api-explorer | inurl:redoc | inurl:openapi | intitle:"Swagger UI" site:"{domain}"'],
    icon: <Code className="h-4 w-4" />,
    description: "API docs and Swagger endpoints",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  {
    title: "Authentication Endpoints",
    dorks: ["inurl:login | inurl:signin | intitle:login | intitle:signin | inurl:secure site:{domain}"],
    icon: <Lock className="h-4 w-4" />,
    description: "Login and authentication pages",
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20"
  },
  {
    title: "Test & Staging Sites",
    dorks: ["inurl:test | inurl:env | inurl:dev | inurl:staging | inurl:sandbox | inurl:debug | inurl:temp | inurl:internal | inurl:demo site:{domain}"],
    icon: <Eye className="h-4 w-4" />,
    description: "Development and testing environments",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  {
    title: "Confidential Documents",
    dorks: ['site:{domain} ext:txt | ext:pdf | ext:xml | ext:xls | ext:xlsx | ext:ppt | ext:pptx | ext:doc | ext:docx intext:"confidential" | intext:"Not for Public Release" | intext:"internal use only" | intext:"do not distribute"'],
    icon: <FileText className="h-4 w-4" />,
    description: "Sensitive document discovery",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20"
  },
  {
    title: "Personal Data Parameters",
    dorks: ["inurl:email= | inurl:phone= | inurl:name= | inurl:user= inurl:& site:{domain}"],
    icon: <Shield className="h-4 w-4" />,
    description: "URLs containing personal information",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20"
  },
  {
    title: "AEM Content Paths",
    dorks: ["inurl:/content/usergenerated | inurl:/content/dam | inurl:/jcr:content | inurl:/libs/granite | inurl:/etc/clientlibs | inurl:/content/geometrixx | inurl:/bin/wcm | inurl:/crx/de site:{domain}"],
    icon: <Globe className="h-4 w-4" />,
    description: "Adobe Experience Manager paths",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20"
  },
  {
    title: "Vulnerability Reports",
    dorks: ['site:openbugbounty.org inurl:reports intext:"{domain}"'],
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Public vulnerability disclosures",
    color: "bg-red-500/10 text-red-600 border-red-500/20"
  },
  {
    title: "Community Mentions",
    dorks: ['site:groups.google.com "{domain}"'],
    icon: <Globe className="h-4 w-4" />,
    description: "Google Groups discussions",
    color: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  {
    title: "Code Snippet Sites",
    dorks: [
      'site:pastebin.com "{domain}"',
      'site:jsfiddle.net "{domain}"',
      'site:codebeautify.org "{domain}"',
      'site:codepen.io "{domain}"',
    ],
    icon: <Code className="h-4 w-4" />,
    description: "Paste sites and code repositories",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  {
    title: "Cloud Storage Buckets",
    dorks: [
      'site:s3.amazonaws.com "{domain}"',
      'site:blob.core.windows.net "{domain}"',
      'site:googleapis.com "{domain}"',
      'site:drive.google.com "{domain}"',
      'site:dev.azure.com "{domain}"',
      'site:onedrive.live.com "{domain}"',
      'site:digitaloceanspaces.com "{domain}"',
      'site:sharepoint.com "{domain}"',
      'site:s3-external-1.amazonaws.com "{domain}"',
      'site:s3.dualstack.us-east-1.amazonaws.com "{domain}"',
      'site:dropbox.com/s "{domain}"',
      'site:docs.google.com inurl:"/d/" "{domain}"',
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Cloud storage and bucket discovery",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
  },
  {
    title: "Package Repositories",
    dorks: ['site:jfrog.io "{domain}"'],
    icon: <Code className="h-4 w-4" />,
    description: "Artifactory and package repos",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  {
    title: "Firebase References",
    dorks: ['site:firebaseio.com "{domain}"'],
    icon: <Database className="h-4 w-4" />,
    description: "Firebase database references",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  },
  {
    title: "Bug Bounty Programs",
    dorks: [
      'intext:"submit your vulnerability" intitle:"bug bounty"',
      'intitle:"security.txt" inurl:.well-known',
      'site:hackerone.com "{domain}"',
      'site:bugcrowd.com "{domain}"',
      'site:intigriti.com "{domain}"',
      'site:yeswehack.com "{domain}"',
      '"responsible disclosure" site:{domain}',
    ],
    icon: <Shield className="h-4 w-4" />,
    description: "Bug bounty and disclosure programs",
    color: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  {
    title: "Exposed Credentials",
    dorks: [
      'filetype:sql "password" site:{domain}',
      'filetype:env "DB_PASSWORD" site:{domain}',
      'site:github.com "{domain}" "API_KEY"',
      'site:github.com "{domain}" "SECRET_KEY"',
      'site:github.com "{domain}" "access_token"',
      'filetype:log "password" site:{domain}',
      "ext:pwd site:{domain}",
    ],
    icon: <Lock className="h-4 w-4" />,
    description: "Exposed passwords and secrets",
    color: "bg-red-500/10 text-red-600 border-red-500/20"
  },
  {
    title: "Configuration Secrets",
    dorks: [
      "inurl:config filetype:xml site:{domain}",
      'filetype:yml "database" "password" site:{domain}',
      'ext:properties "password" site:{domain}',
      'ext:ini "password" site:{domain}',
      'ext:conf "password" site:{domain}',
      'ext:cnf "password" site:{domain}',
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Configuration files with secrets",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
  },
  {
    title: "Backup Archives",
    dorks: [
      'intitle:"index of" "backup" site:{domain}',
      "filetype:bak site:{domain}",
      "filetype:old site:{domain}",
      "filetype:backup site:{domain}",
      "ext:sql site:{domain}",
      "ext:dump site:{domain}",
      "ext:tar.gz site:{domain}",
      "ext:zip site:{domain}",
      'inurl:"backup" site:{domain}',
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Backup files and archives",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
  },
  {
    title: "Sensitive Documents",
    dorks: [
      'intitle:"index of" "nda.pdf" site:{domain}',
      'filetype:pdf "confidential" site:{domain}',
      'filetype:pdf "internal use only" site:{domain}',
      'ext:doc "confidential" site:{domain}',
      'ext:docx "confidential" site:{domain}',
      'filetype:xls "confidential" site:{domain}',
      'filetype:xlsx "confidential" site:{domain}',
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Publicly indexed sensitive docs",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20"
  },
  {
    title: "GitHub Leaks",
    dorks: [
      'site:github.com "{domain}" "password"',
      'site:github.com "{domain}" "api_key"',
      'site:github.com "{domain}" "secret"',
      'site:github.com "{domain}" "aws_access_key_id"',
      'site:github.com "{domain}" "connectionString"',
      'site:github.com "{domain}" "private_key"',
      'site:github.com "{domain}" "token"',
      'site:github.com "{domain}" "credentials"',
    ],
    icon: <Github className="h-4 w-4" />,
    description: "GitHub repository leaks",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20"
  },
]

export function GoogleDorksGenerator() {
  const [domain, setDomain] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const replaceDomain = (dork: string, inputDomain: string) => {
    if (!inputDomain) return dork
    
    // Split domains by comma and clean up spaces
    const domains = inputDomain.split(',').map(d => d.trim()).filter(d => d.length > 0)
    
    if (domains.length === 1) {
      // Single domain - replace normally
      return dork.replace(/{domain}/g, domains[0])
    } else {
      // Multiple domains - create domain1 | domain2 format (without site: prefix)
      const domainList = domains.join(' | ')
      
      // Check if the dork already has site: prefix
      if (dork.includes('site:{domain}')) {
        // Replace site:{domain} with site:domain1 | site:domain2
        const siteQueries = domains.map(domain => `site:${domain}`).join(' | ')
        return dork.replace(/site:\{domain\}/g, siteQueries)
      } else {
        // Replace {domain} with just the domain list
        return dork.replace(/{domain}/g, domainList)
      }
    }
  }

  const copyToClipboard = async (text: string, index: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const generateGoogleSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`
  }

  const openAllQueries = (dorks: string[]) => {
    // Open each dork individually in separate tabs
    dorks.forEach((dork) => {
      const processedDork = replaceDomain(dork, domain)
      const url = generateGoogleSearchUrl(processedDork)
      window.open(url, "_blank")
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 shadow-lg">
            <Sparkles className="h-5 w-5 text-cyan-400 animate-spin" />
            <span className="text-sm font-semibold text-white">Advanced Security Research Tool</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight">
            Google Dorks
            <br />
            <span className="text-4xl md:text-6xl">Explorer</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover vulnerabilities, exposed data, and security misconfigurations with 
            <span className="text-cyan-400 font-semibold"> advanced search queries</span> and 
            <span className="text-purple-400 font-semibold"> automated reconnaissance</span>
          </p>

          {/* Author credits */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-3 text-gray-400">
              <span>Created by</span>
              <a 
                href="https://github.com/xFraylin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all hover:scale-105"
              >
                <Github className="h-4 w-4" />
                <span className="font-semibold text-white">xFraylin</span>
              </a>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-3 text-gray-400">
              <span>Credits to</span>
              <a 
                href="https://www.exploit-db.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all hover:scale-105 font-semibold text-white"
              >
                ExploitDB
              </a>
            </div>
          </div>

          {/* Domain input */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  type="text"
                  placeholder="example.com, target.com, *.domain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full pl-14 pr-6 py-6 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-2xl"
                />
              </div>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              Enter single or multiple domains separated by commas • Supports wildcards and subdomains
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dorkCategories.map((category, categoryIndex) => (
            <Card 
              key={categoryIndex}
              className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${category.color} border`}>
                    {category.icon}
                    <span className="text-xs font-semibold">{category.title.split(':')[0]}</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {category.dorks.length}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg font-bold mb-2">
                  {category.title}
                </CardTitle>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {category.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {category.dorks.length > 1 && !category.dorks.some(dork => dork.includes(' | ')) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAllQueries(category.dorks)}
                    className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white transition-all"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open All Queries
                  </Button>
                ) : null}

                <div className="space-y-2">
                  {category.dorks.map((dork, dorkIndex) => {
                    const processedDork = replaceDomain(dork, domain)
                    const uniqueKey = `${categoryIndex}-${dorkIndex}`
                    const isCopied = copiedIndex === uniqueKey

                    return (
                      <div key={dorkIndex} className="group/dork relative">
                        <a
                          href={generateGoogleSearchUrl(processedDork)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm font-mono text-gray-300 hover:text-white transition-all hover:scale-[1.02] break-all"
                        >
                          {processedDork}
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/dork:opacity-100 transition-all hover:bg-white/20 rounded-lg"
                          onClick={() => copyToClipboard(processedDork, uniqueKey)}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span className="text-white font-semibold">Happy hunting! Remember to hack responsibly.</span>
            <Shield className="h-5 w-5 text-green-400" />
          </div>
          
          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-center gap-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <h3 className="text-lg font-bold text-red-400">Important Disclaimer</h3>
              </div>
              <p className="text-red-300 text-sm leading-relaxed">
                ⚠️ <strong>For educational and authorized security research only.</strong> The developer is not responsible for misuse. 
                This tool is intended for legitimate security testing, penetration testing, and authorized vulnerability assessments only. 
                Users are responsible for ensuring they have proper authorization before conducting any security research activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

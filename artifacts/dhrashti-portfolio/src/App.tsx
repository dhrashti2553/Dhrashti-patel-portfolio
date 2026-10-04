import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown, ArrowUp, Award, BookOpen, BriefcaseBusiness, Check, ChevronDown,
  ChevronUp, Clipboard, Download, ExternalLink, FileText, FlaskConical,
  FolderOpen, GraduationCap, Mail, MapPin, Menu, Moon, Phone, Send,
  ShieldCheck, Sun, Users, Wrench, X,
} from 'lucide-react';
import { portfolio, sections } from '@/data/portfolio';

type AuditLine = { time: string; message: string; id: number };
type Project = (typeof portfolio.projects)[number];

function CountStat({ value, label, index }: { value: string; label: string; index: number }) {
  const [shown, setShown] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? value : '0');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }
    const target = Number(value);
    const precision = value.includes('.') ? value.split('.')[1].length : 0;
    const steps = 26;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setShown((Math.min(target, target * step / steps)).toFixed(precision));
      if (step >= steps) window.clearInterval(timer);
    }, 35 + index * 18);
    return () => window.clearInterval(timer);
  }, [value, index]);
  return <div className="stat-card" data-testid={`stat-${index + 1}`}><div className="stat-value">{shown}</div><div className="stat-label">{label}</div></div>;
}

const categoryIcons: Record<string, typeof ShieldCheck> = {
  Regulatory: ShieldCheck,
  'Systems & Tools': Wrench,
  'Quality & GxP': Award,
  'Scientific & Lab': FlaskConical,
  Professional: Users,
};

function App() {
  const shouldReduceMotion = useReducedMotion();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('dp-theme');
    return stored ? stored === 'night' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [progress, setProgress] = useState(0);
  const [auditExpanded, setAuditExpanded] = useState(() => window.innerWidth > 640);
  const [audit, setAudit] = useState<AuditLine[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<string[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState('');
  const [received, setReceived] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState('');
  const [introVisible, setIntroVisible] = useState(() => {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !sessionStorage.getItem('dp-intro-seen');
  });
  const lastFocus = useRef<HTMLElement | null>(null);
  const projectCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dp-theme', dark ? 'night' : 'clean');
  }, [dark]);

  useEffect(() => {
    if (!introVisible) return;
    const timer = window.setTimeout(() => {
      setIntroVisible(false);
      sessionStorage.setItem('dp-intro-seen', '1');
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [introVisible]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setTitleIndex((value) => (value + 1) % portfolio.titleRotations.length);
    }, 3100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const phrase = portfolio.titleRotations[titleIndex];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedTitle(phrase);
      return;
    }
    setTypedTitle('');
    let position = 0;
    const timer = window.setInterval(() => {
      position += 1;
      setTypedTitle(phrase.slice(0, position));
      if (position >= phrase.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [titleIndex]);

  useEffect(() => {
    const sectionsToReveal = document.querySelectorAll<HTMLElement>('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    sectionsToReveal.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
      document.documentElement.classList.toggle('cursor-over-control', Boolean((event.target as HTMLElement)?.closest?.('a,button,[role="button"],input,textarea')));
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const addAudit = useCallback((message: string) => {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((part) => String(part).padStart(2, '0')).join(':');
    setAudit((lines) => [...lines, { time, message, id: Date.now() + Math.random() }].slice(-5));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const targets = sections.map((section) => document.getElementById(section.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          const section = sections.find((item) => item.id === entry.target.id);
          if (section) addAudit(`Reviewer accessed Section ${section.number}: ${section.label}`);
        }
      });
    }, { rootMargin: '-22% 0px -62% 0px', threshold: 0 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [addAudit]);

  useEffect(() => {
    if (!project) return;
    lastFocus.current = document.activeElement as HTMLElement;
    projectCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProject(null);
      if (event.key === 'Tab') {
        const modal = document.querySelector<HTMLElement>('[role="dialog"]');
        const focusable = modal?.querySelectorAll<HTMLElement>('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      lastFocus.current?.focus();
    };
  }, [project]);

  useEffect(() => {
    if (!menuOpen) return;
    menuCloseRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('[data-testid="mobile-navigation"]');
        const focusable = dialog?.querySelectorAll<HTMLElement>('a,button');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onMenuKeyDown);
    return () => {
      document.removeEventListener('keydown', onMenuKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const allSkills = useMemo(
    () => portfolio.skillGroups.flatMap((group) => group.skills.map(([name, context]) => ({ name, context, category: group.category }))),
    [],
  );
  const visibleSkills = filter === 'All' ? allSkills : allSkills.filter((skill) => skill.category === filter);

  const downloadResume = () => addAudit('Reviewer downloaded Resume v2026.1');
  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const showToast = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`${label} copied`);
    } catch {
      setToast('Clipboard unavailable — select and copy the contact detail');
    }
  };
  const openProject = (item: Project) => {
    setProject(item);
    addAudit(`Reviewer opened DOC ${item.id}: ${item.title}`);
  };

  const header = (number: string, label: string, id: string) => (
    <div className="section-heading">
      <div>
        <div className="eyebrow mono">MODULE {number} · CONTROLLED RECORD</div>
        <h2 className="section-title" id={`${id}-title`}>{label}</h2>
      </div>
      <span className="status">EFFECTIVE</span>
    </div>
  );

  return (
    <div className="app-shell" data-testid="portfolio-app">
      <div className="progress-line" style={{ ['--progress' as string]: `${progress}%` }} aria-hidden="true" data-testid="scroll-progress" />
      {introVisible && (
        <div className="intro-screen" aria-label="Compiling dossier">
          <div className="intro-content">
            <div className="intro-mark">DP</div>
            <div className="intro-title">Compiling dossier…</div>
            <div className="intro-sub">DOCUMENT CONTROL · DP-RA-001</div>
            <div className="intro-track"><div className="intro-fill" /></div>
          </div>
        </div>
      )}

      <header className="topbar">
        <nav className="nav-inner" aria-label="Primary navigation">
          <a className="brand" href="#cover" onClick={() => goTo('cover')} aria-label="Dhrashti Patel, return to cover">
            <span className="brand-mark" aria-hidden="true">DP</span><span className="brand-name">Dhrashti Patel</span>
          </a>
          <div className="nav-links">
            {sections.map((item) => (
              <a key={item.id} className={activeSection === item.id ? 'active' : ''} href={`#${item.id}`} onClick={() => addAudit(`Reviewer accessed Section ${item.number}: ${item.label}`)}>
                {item.number} {item.label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <div className="theme-control">
              <span className="theme-copy">{dark ? 'NIGHT REVIEW' : 'CLEAN ROOM'}</span>
              <button className="theme-switch" type="button" role="switch" aria-checked={dark} aria-label="Toggle Clean Room / Night Review theme" onClick={() => setDark(!dark)} data-testid="theme-toggle">
                <span aria-hidden="true" />
              </button>
              {dark ? <Moon size={13} aria-hidden="true" /> : <Sun size={13} aria-hidden="true" />}
            </div>
            <a className="btn btn-primary resume-nav" href={portfolio.resumePath} download onClick={downloadResume} data-testid="resume-download-nav"><Download /> Resume</a>
          </div>
          <button className="menu-button" type="button" aria-label="Open table of contents" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} data-testid="mobile-menu-open"><Menu size={19} /></button>
        </nav>
      </header>

      <main>
        <section className="hero container" id="cover" aria-labelledby="cover-title">
          <div className="hero-grid">
            <div>
              <div className="eyebrow mono">SUBMISSION COVER LETTER | DOC ID: DP-RA-001</div>
              <h1 id="cover-title">{portfolio.name}</h1>
              <div className="typing-line" aria-live="polite" data-testid="professional-title">{typedTitle}<span className="cursor" aria-hidden="true" /></div>
              <p className="hero-copy">{portfolio.tagline}</p>
              <div className="location"><MapPin aria-hidden="true" />{portfolio.location}</div>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => goTo('summary')} data-testid="view-dossier"><BookOpen /> View My Dossier</button>
                <a className="btn btn-outline" href={portfolio.resumePath} download onClick={downloadResume} data-testid="resume-download-hero"><Download /> Download Resume</a>
              </div>
            </div>
            <div className="portrait-stage" aria-label="Dhrashti Patel profile monogram placeholder">
              <div className="portrait-frame">
                <div className="monogram" role="img" aria-label="DP monogram placeholder; no profile photograph supplied">DP</div>
              </div>
              <motion.span
                className="stamp"
                aria-label="Approved stamp"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.45, rotate: -12 }}
                animate={{ opacity: 0.86, scale: 1, rotate: -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.72, delay: shouldReduceMotion ? 0 : 0.35, type: 'spring', bounce: 0.25 }}
              >APPROVED</motion.span>
              <div className="portrait-note">PERSONNEL RECORD · DP-001</div>
            </div>
          </div>
          <div className="stats" aria-label="Professional highlights">
            {portfolio.stats.map((stat, i) => <CountStat key={stat.label} value={stat.value} label={stat.label} index={i} />)}
          </div>
        </section>

        <section className="section container" id="summary" aria-labelledby="summary-title">
          {header('2.0', 'Professional Summary', 'summary')}
          <div className="doc-strip"><span>DOC ID: DP-RA-002</span><span>VERSION 2.1</span><span>MODULE 2</span><span className="status">APPROVED</span></div>
          <div className="document-card summary-card">
            <div className="summary-text"><strong>Regulatory affairs, made legible.</strong><br />{portfolio.summary}</div>
            <div className="competencies">
              {portfolio.competencies.map((item, i) => {
                const Icon = [FileText, FolderOpen, BookOpen, ShieldCheck][i];
                return <div className="competency" key={item}><span className="competency-icon"><Icon /></span>{item}</div>;
              })}
            </div>
          </div>
        </section>

        <section className="section container" id="education" aria-labelledby="education-title">
          {header('3.0', 'Education', 'education')}
          <div className="doc-strip"><span>DOC ID: DP-RA-003</span><span>ACADEMIC RECORD</span><span>2 CREDENTIALS</span><span className="status">VERIFIED</span></div>
          <div className="education-grid">
            {portfolio.education.map((item) => <article className="education-card" key={item.degree}>
              <span className={`status ${item.inProgress ? 'amber' : ''}`}>{item.status}</span>
              <div className="seal"><GraduationCap /></div>
              <h3>{item.degree}</h3>
              <p className="serif" style={{ color: 'var(--ink)', fontSize: 16 }}>{item.institution}</p>
              <p>{item.location}</p>
              <p>{item.completion} <span aria-hidden="true">·</span> GPA: {item.gpa}</p>
            </article>)}
          </div>
        </section>

        <section className="section container" id="experience" aria-labelledby="experience-title">
          {header('4.0', 'Professional Experience', 'experience')}
          <div className="doc-strip"><span>DOC ID: DP-RA-004</span><span>VERSION 2.1</span><span>CONTROLLED EXPERIENCE RECORDS</span><span className="status">EFFECTIVE</span></div>
          <div className="experience-list" style={{ marginTop: 17 }}>
            {portfolio.experience.map((role, index) => {
              const expanded = expandedRecords.includes(role.id);
              return <motion.article
                layout={!shouldReduceMotion}
                className="experience-card"
                key={role.id}
                data-testid={`experience-${role.id}`}
                whileHover={shouldReduceMotion ? undefined : { rotateX: 2, rotateY: index % 2 === 0 ? -2 : 2, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <span className="timeline-node" aria-hidden="true" />
                <div className="experience-content">
                  <div className="exp-meta"><span>DOC ID: {role.id}</span><span>·</span><span>VERSION 1.0</span><span>·</span><span>{role.dates}</span></div>
                  <div className="exp-head">
                    <div><h3>{role.company}</h3><div className="exp-role">{role.role}</div><div className="exp-location">{role.location} <span aria-hidden="true">·</span> {role.dates}</div></div>
                    <span className={`status ${index === 0 ? '' : 'amber'}`}>{role.status}</span>
                  </div>
                  <motion.ul layout={!shouldReduceMotion} className="bullet-list">
                    {(expanded ? role.bullets : role.bullets.slice(0, 2)).map((bullet) => <motion.li
                      key={bullet}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >{bullet}</motion.li>)}
                  </motion.ul>
                  <button className="record-toggle" type="button" aria-expanded={expanded} onClick={() => setExpandedRecords((ids) => expanded ? ids.filter((id) => id !== role.id) : [...ids, role.id])} data-testid={`experience-toggle-${role.id}`}>
                    {expanded ? <>Close Full Record <ChevronUp size={13} /></> : <>View Full Record <ChevronDown size={13} /></>}
                  </button>
                  <div className="tag-row">{role.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  {role.agencies && <div className="agency-row" aria-label="Regulatory agencies analyzed">{role.agencies.map((agency) => <span className="agency" key={agency}>{agency}</span>)}</div>}
                </div>
              </motion.article>;
            })}
          </div>
        </section>

        <section className="section container" id="projects" aria-labelledby="projects-title">
          {header('5.0', 'Submission Packages', 'projects')}
          <div className="doc-strip"><span>DOC ID: DP-RA-005</span><span>4 CONTROLLED PROJECTS</span><span>SUBMISSION LIFECYCLE</span><span className="status">COMPILED</span></div>
          <div className="projects-grid" style={{ marginTop: 17 }}>
            {portfolio.projects.map((item) => <button className="project-card" key={item.id} type="button" onClick={() => openProject(item)} aria-haspopup="dialog" data-testid={`project-${item.id}`}>
              <span className="folder-tab">{item.id}</span>
              <span className="framework">{item.framework}</span>
              <h3>{item.title}</h3>
              <span className="project-teaser">{item.teaser}</span>
              <span className="lifecycle" aria-label="Lifecycle status: drafted, reviewed, compiled, submitted">
                {['Drafted', 'Reviewed', 'Compiled', 'Submitted'].map((step, index) => <span className="life-step" key={step}>
                  <motion.span
                    className="life-dot"
                    initial={shouldReduceMotion ? false : { opacity: 0.3, scale: 0.65 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.35, delay: shouldReduceMotion ? 0 : index * 0.1, type: 'spring', bounce: 0.3 }}
                  ><Check /></motion.span>{step}
                </span>)}
              </span>
            </button>)}
          </div>
        </section>

        <section className="section container" id="skills" aria-labelledby="skills-title">
          {header('6.0', 'Compliance Matrix', 'skills')}
          <div className="doc-strip"><span>DOC ID: DP-RA-006</span><span>SKILL INDEX</span><span>{allSkills.length} ITEMS</span><span className="status">CURRENT</span></div>
          <div className="skills-panel" style={{ marginTop: 17 }}>
            <div className="filter-tabs" role="tablist" aria-label="Filter skills by category">
              {['All', ...portfolio.skillGroups.map((group) => group.category)].map((category) => <button className={`filter-tab ${filter === category ? 'selected' : ''}`} type="button" role="tab" aria-selected={filter === category} key={category} onClick={() => setFilter(category)} data-testid={`skill-filter-${category.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>{category}</button>)}
            </div>
            <div className="skill-grid" role="tabpanel" aria-live="polite">
              {visibleSkills.map((skill, index) => {
                const Icon = categoryIcons[skill.category] ?? ShieldCheck;
                return <div className="skill-chip" key={skill.name} tabIndex={0} title={skill.context} style={{ animationDelay: `${index * 18}ms` }} data-testid="skill-chip"><Icon aria-hidden="true" />{skill.name}<span className="tooltip" role="tooltip">{skill.context}</span></div>;
              })}
            </div>
          </div>
        </section>

        <section className="section container" id="contact" aria-labelledby="contact-title">
          {header('7.0', 'Submit Your Inquiry', 'contact')}
          <div className="doc-strip"><span>DOC ID: DP-RA-007</span><span>CONTACT / CORRESPONDENCE</span><span>REVISION 2026.1</span><span className="status">OPEN</span></div>
          <div className="contact-intro" style={{ marginTop: 23 }}>
            <div><h2 className="section-title" id="contact-inquiry-title">Let’s Work Together</h2><p>{portfolio.contactAvailability}</p></div>
            <div className="eyebrow mono">CORRESPONDENCE PREFERRED · EMAIL</div>
          </div>
          <div className="contact-grid">
            <div className="contact-details">
              <div className="contact-item"><span className="contact-icon"><Mail /></span><div className="contact-info"><div className="contact-label">Email</div><a className="contact-value" href={`mailto:${portfolio.email}`}>{portfolio.email}</a></div><button className="copy-btn" aria-label="Copy email address" onClick={() => showToast(portfolio.email, 'Email address')} data-testid="copy-email"><Clipboard /></button></div>
              <div className="contact-item"><span className="contact-icon"><Phone /></span><div className="contact-info"><div className="contact-label">Phone</div><a className="contact-value" href={`tel:${portfolio.phone.replace(/[^\d+]/g, '')}`}>{portfolio.phone}</a></div><button className="copy-btn" aria-label="Copy phone number" onClick={() => showToast(portfolio.phone, 'Phone number')} data-testid="copy-phone"><Clipboard /></button></div>
              <div className="contact-item"><span className="contact-icon"><ExternalLink /></span><div className="contact-info"><div className="contact-label">LinkedIn</div>{portfolio.linkedinUrl ? <a className="contact-value" href={portfolio.linkedinUrl} target="_blank" rel="noreferrer">Open LinkedIn profile</a> : <span className="unavailable" title="The supplied brief contains a placeholder, not a usable profile URL.">{portfolio.linkedinPlaceholder} · unavailable</span>}</div></div>
              <div className="contact-item"><span className="contact-icon"><MapPin /></span><div className="contact-info"><div className="contact-label">Location</div><span className="contact-value">{portfolio.location}</span></div></div>
            </div>
            <form className="contact-form" action={`mailto:${portfolio.email}`} method="post" encType="text/plain" onSubmit={() => setReceived(true)} data-testid="contact-form">
              <h3>Compose correspondence</h3>
              <div className="form-grid">
                <div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" name="Name" required autoComplete="name" placeholder="Your name" data-testid="contact-name" /></div>
                <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" name="Email" type="email" required autoComplete="email" placeholder="you@company.com" data-testid="contact-email" /></div>
                <div className="field full"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="Message" required placeholder="Your message" data-testid="contact-message" /></div>
              </div>
              <button className="btn btn-primary" type="submit" data-testid="contact-submit"><Send /> Submit for Review</button>
              {received && <motion.span
                className="stamp received-stamp"
                role="status"
                aria-label="Message received"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.35, rotate: -12 }}
                animate={{ opacity: 0.86, scale: 1, rotate: -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, type: 'spring', bounce: 0.2 }}
              >RECEIVED</motion.span>}
            </form>
          </div>
          <div className="resume-actions">
            <a className="btn btn-primary" href={portfolio.resumePath} download onClick={downloadResume} data-testid="resume-download-contact"><Download /> Download Resume (PDF)</a>
            <a className="btn btn-outline" href={portfolio.resumePath} target="_blank" rel="noreferrer" onClick={downloadResume} data-testid="resume-view"><FileText /> View Resume</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 Dhrashti Patel · {portfolio.footerStatus} · Last Revised: {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}</span>
          <div className="footer-links">
            <a href={`mailto:${portfolio.email}`} aria-label="Email Dhrashti Patel"><Mail /></a>
            {portfolio.linkedinUrl ? <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"><ExternalLink /></a> : <span aria-label="LinkedIn profile unavailable" title="LinkedIn URL not supplied"><ExternalLink /></span>}
            <button type="button" onClick={() => goTo('cover')}>Back to Cover <ArrowUp /></button>
          </div>
        </div>
      </footer>

      {menuOpen && <div className="mobile-overlay" role="dialog" aria-modal="true" aria-label="Dossier table of contents" data-testid="mobile-navigation">
        <div className="mobile-menu-head"><a className="brand" href="#cover" onClick={() => goTo('cover')}><span className="brand-mark">DP</span><span className="brand-name">Dhrashti Patel</span></a><button className="mobile-menu-close" type="button" onClick={() => setMenuOpen(false)} ref={menuCloseRef} aria-label="Close navigation"><X /></button></div>
        <p className="toc-label">DOSSIER CONTENTS · CONTROLLED INDEX</p>
        {sections.map((item) => <a className="toc-link" key={item.id} href={`#${item.id}`} onClick={() => goTo(item.id)} data-testid={`mobile-nav-${item.id}`}><span className="toc-number">{item.number}</span><span>{item.label}</span><span className="toc-leader" /><ArrowDown size={13} /></a>)}
        <a className="btn btn-primary mobile-download" href={portfolio.resumePath} download onClick={downloadResume}><Download /> Download Resume</a>
      </div>}

      {project && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProject(null); }} data-testid="project-modal-backdrop">
        <motion.article
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          aria-describedby="project-modal-description"
          data-testid="project-modal"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          <div className="modal-top">
            <div><div className="eyebrow mono">SUBMISSION PACKAGE · {project.id}</div><h2 id="project-modal-title">{project.title}</h2></div>
            <button className="modal-close" type="button" onClick={() => setProject(null)} ref={projectCloseRef} aria-label="Close project details" data-testid="project-modal-close"><X /></button>
          </div>
          <div className="modal-body" id="project-modal-description">
            <div className="tag-row" style={{ marginTop: 0 }}><span className="status">{project.framework}</span><span className="status">SUBMITTED</span></div>
            <p>{project.teaser}</p>
            <ul>{project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            <div className="modal-tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </div>
        </motion.article>
      </div>}

      <div className="audit-dock" data-testid="audit-trail" aria-label="Audit trail panel" hidden={!auditExpanded}>
        <div className="audit-head"><span className="audit-title">AUDIT TRAIL · 21 CFR PART 11 STYLE</span><button className="audit-toggle" type="button" onClick={() => setAuditExpanded(false)} aria-label="Collapse audit trail">−</button></div>
        <ul className="audit-items" aria-live="polite">
          {audit.length ? audit.slice(-5).map((line) => <li key={line.id}><time>{line.time}</time><span>{line.message}</span></li>) : <li><time>--:--:--</time><span>Reviewer session initialized</span></li>}
        </ul>
      </div>
      {!auditExpanded && <button className="audit-pill" type="button" onClick={() => setAuditExpanded(true)} data-testid="audit-trail-open"><span className="pulse" />Audit Trail</button>}
      {toast && <div className="toast" role="status" data-testid="toast">{toast}</div>}
      <div className="custom-cursor" aria-hidden="true" />
    </div>
  );
}

export default App;
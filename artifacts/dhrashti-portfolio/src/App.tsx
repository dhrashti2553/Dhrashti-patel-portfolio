import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Moon,
  Music2,
  PenLine,
  ShieldCheck,
  Sun,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { portfolio, sections } from "@/data/portfolio";

type Project = (typeof portfolio.projects)[number];

function CountStat({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const [shown, setShown] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? value : "0",
  );
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    const target = Number(value);
    const precision = value.includes(".") ? value.split(".")[1].length : 0;
    const duration = 1000 + index * 110;
    let start = 0;
    let lastPaint = 0;
    let frame = 0;
    const animate = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (now - lastPaint >= 32 || progress === 1) {
        setShown((target * eased).toFixed(precision));
        lastPaint = now;
      }
      if (progress < 1) frame = window.requestAnimationFrame(animate);
      else setShown(value);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value, index]);
  return (
    <div className="stat-card card-hover" data-testid={`stat-${index + 1}`}>
      <div className="stat-value">{shown}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const greetings = [
  { word: "Hello", language: "English" },
  { word: "Hola", language: "Spanish" },
  { word: "Bonjour", language: "French" },
  { word: "Ciao", language: "Italian" },
  { word: "Namaste", language: "Hindi" },
];

const categoryIcons: Record<string, typeof ShieldCheck> = {
  Regulatory: ShieldCheck,
  "Systems & Tools": Wrench,
  "Clinical Research Documentation": Award,
  "Scientific & Lab": FlaskConical,
  Professional: Users,
};

function App() {
  const shouldReduceMotion = useReducedMotion();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("dp-theme");
    return stored
      ? stored === "night"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("cover");
  const [progress, setProgress] = useState(0);
  const [expandedRecords, setExpandedRecords] = useState<string[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");
  const [titleIndex, setTitleIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [introVisible, setIntroVisible] = useState(() => {
    return (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !sessionStorage.getItem("dp-intro-seen")
    );
  });
  const lastFocus = useRef<HTMLElement | null>(null);
  const projectCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dp-theme", dark ? "night" : "clean");
  }, [dark]);

  useEffect(() => {
    if (!introVisible) return;
    const timer = window.setTimeout(() => {
      setIntroVisible(false);
      sessionStorage.setItem("dp-intro-seen", "1");
    }, 340);
    return () => window.clearTimeout(timer);
  }, [introVisible]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setTitleIndex((value) => (value + 1) % portfolio.titleRotations.length);
    }, 3100);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setGreetingIndex((value) => (value + 1) % greetings.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const phrase = portfolio.titleRotations[titleIndex];
    if (shouldReduceMotion) {
      setTypedTitle(phrase);
      return;
    }
    setTypedTitle("");
    let position = 0;
    const timer = window.setInterval(() => {
      position += 1;
      setTypedTitle(phrase.slice(0, position));
      if (position >= phrase.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [titleIndex, shouldReduceMotion]);

  useEffect(() => {
    const sectionsToReveal = document.querySelectorAll<HTMLElement>(".section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    sectionsToReveal.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
        frame = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: 0 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!project) return;
    lastFocus.current = document.activeElement as HTMLElement;
    projectCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProject(null);
      if (event.key === "Tab") {
        const modal = document.querySelector<HTMLElement>('[role="dialog"]');
        const focusable = modal?.querySelectorAll<HTMLElement>(
          'button,[href],input,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastFocus.current?.focus();
    };
  }, [project]);

  useEffect(() => {
    if (!menuOpen) return;
    menuCloseRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>(
          '[data-testid="mobile-navigation"]',
        );
        const focusable = dialog?.querySelectorAll<HTMLElement>("a,button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onMenuKeyDown);
    return () => {
      document.removeEventListener("keydown", onMenuKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const allSkills = useMemo(
    () =>
      portfolio.skillGroups.flatMap((group) =>
        group.skills.map(([name, context]) => ({
          name,
          context,
          category: group.category,
        })),
      ),
    [],
  );
  const visibleSkills =
    filter === "All"
      ? allSkills
      : allSkills.filter((skill) => skill.category === filter);

  const goTo = (id: string) => {
    setMenuOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  };
  const openProject = (item: Project) => {
    setProject(item);
  };
  const greeting = greetings[greetingIndex];

  const header = (number: string, label: string, id: string) => (
    <div className="section-heading">
      <div>
        <div className="eyebrow mono">SECTION {number}</div>
        <h2 className="section-title" id={`${id}-title`}>
          {label}
        </h2>
      </div>
      <span className="status">EFFECTIVE</span>
    </div>
  );

  return (
    <div
      className="app-shell"
      data-greeting-theme={greetingIndex}
      data-testid="portfolio-app"
    >
      <div
        className="progress-line"
        style={{ ["--progress" as string]: `${progress}%` }}
        aria-hidden="true"
        data-testid="scroll-progress"
      />
      {introVisible && (
        <div className="intro-screen" aria-label="Compiling dossier">
          <div className="intro-content">
            <div className="intro-mark">DP</div>
            <div className="intro-title">Dhrashti Patel</div>
            <div className="intro-sub">
              REGULATORY AFFAIRS · MEDICAL WRITING
            </div>
            <div className="intro-track">
              <div className="intro-fill" />
            </div>
          </div>
        </div>
      )}

      <header className="topbar">
        <nav className="nav-inner" aria-label="Primary navigation">
          <a
            className="brand"
            href="#cover"
            onClick={() => goTo("cover")}
            aria-label="Dhrashti Patel, return to cover"
          >
            <span className="brand-mark" aria-hidden="true">
              DP
            </span>
            <span className="brand-name">Dhrashti Patel</span>
          </a>
          <div className="nav-links">
            {sections.map((item) => (
              <a
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                href={`#${item.id}`}
              >
                {item.number} {item.label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <div className="theme-control">
              <span className="theme-copy">
                {dark ? "DARK MODE" : "LIGHT MODE"}
              </span>
              <button
                className="theme-switch"
                type="button"
                role="switch"
                aria-checked={dark}
                aria-label="Toggle light and dark mode"
                onClick={() => setDark(!dark)}
                data-testid="theme-toggle"
              >
                <span aria-hidden="true" />
              </button>
              {dark ? (
                <Moon size={13} aria-hidden="true" />
              ) : (
                <Sun size={13} aria-hidden="true" />
              )}
            </div>
            <a
              className="btn btn-primary resume-nav"
              href={portfolio.resumePath}
              download
              data-testid="resume-download-nav"
            >
              <Download /> Resume
            </a>
          </div>
          <button
            className="menu-button"
            type="button"
            aria-label="Open table of contents"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            data-testid="mobile-menu-open"
          >
            <Menu size={19} />
          </button>
        </nav>
      </header>

      <main>
        <section
          className="hero container"
          id="cover"
          aria-labelledby="cover-title"
        >
          <div className="hero-grid">
            <div>
              <div
                className="greeting-row"
                aria-label={`Hello in ${greeting.language}`}
                aria-live="off"
              >
                <span className="greeting-spark" aria-hidden="true">
                  ✳
                </span>
                <motion.span
                  className="greeting-word"
                  key={greeting.word}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {greeting.word}
                </motion.span>
                <span className="greeting-language">{greeting.language}</span>
              </div>
              <div className="eyebrow mono">
                REGULATORY AFFAIRS · MEDICAL WRITING · CLINICAL RESEARCH
                DOCUMENTATION
              </div>
              <h1 id="cover-title">{portfolio.name}</h1>
              <div
                className="typing-line"
                aria-live="polite"
                data-testid="professional-title"
              >
                {typedTitle}
                <span className="cursor" aria-hidden="true" />
              </div>
              <p className="hero-copy">{portfolio.tagline}</p>
              <div className="location">
                <MapPin aria-hidden="true" />
                {portfolio.location}
              </div>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => goTo("summary")}
                  data-testid="view-dossier"
                >
                  <BookOpen /> View My Journey
                </button>
                <a
                  className="btn btn-outline"
                  href={portfolio.resumePath}
                  download
                  data-testid="resume-download-hero"
                >
                  <Download /> Download Resume
                </a>
              </div>
            </div>
            <div
              className="portrait-stage"
              aria-label="Portrait of Dhrashti Patel"
            >
              <div className="portrait-frame">
                <img
                  className="portrait-image"
                  src="/dhrashti-profile.jpg"
                  alt="Dhrashti Patel smiling in a black blazer"
                />
              </div>
              <div className="portrait-note">DHRASHTI PATEL · 2026</div>
            </div>
          </div>
          <div className="stats" aria-label="Professional highlights">
            {portfolio.stats.map((stat, i) => (
              <CountStat
                key={stat.label}
                value={stat.value}
                label={stat.label}
                index={i}
              />
            ))}
          </div>
        </section>

        <section
          className="section container"
          id="summary"
          aria-labelledby="summary-title"
        >
          {header("2.0", "Professional Summary", "summary")}
          <div className="doc-strip">
            <span>DOC ID: DP-RA-002</span>
            <span>VERSION 2.1</span>
            <span>MODULE 2</span>
            <span className="status">APPROVED</span>
          </div>
          <div className="document-card summary-card card-hover">
            <div className="summary-text">
              <strong>{portfolio.summary.lead}</strong>
              {portfolio.summary.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="summary-education">
                {portfolio.summary.educationLine}
              </p>
            </div>
            <div className="competencies">
              <div className="core-focus-label">Core Focus</div>
              {portfolio.competencies.map((item, i) => {
                const Icon = [FileText, FolderOpen, BookOpen, ShieldCheck][i];
                return (
                  <div className="competency" key={item.title}>
                    <span className="competency-icon">
                      <Icon />
                    </span>
                    <strong>{item.title}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="section container"
          id="education"
          aria-labelledby="education-title"
        >
          {header("3.0", "Education", "education")}
          <div className="doc-strip">
            <span>DOC ID: DP-RA-003</span>
            <span>ACADEMIC RECORD</span>
            <span>2 CREDENTIALS</span>
            <span className="status">VERIFIED</span>
          </div>
          <div className="education-grid">
            {portfolio.education.map((item) => (
              <article className="education-card card-hover" key={item.degree}>
                <span className={`status ${item.inProgress ? "amber" : ""}`}>
                  {item.status}
                </span>
                <div className="seal">
                  <GraduationCap />
                </div>
                <h3>{item.degree}</h3>
                <p
                  className="serif"
                  style={{ color: "var(--ink)", fontSize: 16 }}
                >
                  {item.institution}
                </p>
                <p>{item.location}</p>
                <p>
                  {item.completion} <span aria-hidden="true">·</span> GPA:{" "}
                  {item.gpa}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section container"
          id="experience"
          aria-labelledby="experience-title"
        >
          {header("4.0", "Professional Experience", "experience")}
          <div className="doc-strip">
            <span>DOC ID: DP-RA-004</span>
            <span>VERSION 2.1</span>
            <span>CONTROLLED EXPERIENCE RECORDS</span>
            <span className="status">EFFECTIVE</span>
          </div>
          <div className="experience-list" style={{ marginTop: 17 }}>
            {portfolio.experience.map((role, index) => {
              const expanded = expandedRecords.includes(role.id);
              return (
                <motion.article
                  layout={!shouldReduceMotion}
                  className="experience-card card-hover"
                  key={role.id}
                  data-testid={`experience-${role.id}`}
                >
                  <span className="timeline-node" aria-hidden="true" />
                  <div className="experience-content">
                    <div className="exp-meta">
                      <span>DOC ID: {role.id}</span>
                      <span>·</span>
                      <span>VERSION 1.0</span>
                      <span>·</span>
                      <span>{role.dates}</span>
                    </div>
                    <div className="exp-head">
                      <div>
                        <h3>{role.company}</h3>
                        <div className="exp-role">{role.role}</div>
                        <div className="exp-location">
                          {role.location} <span aria-hidden="true">·</span>{" "}
                          {role.dates}
                        </div>
                      </div>
                      <span className={`status ${index === 0 ? "" : "amber"}`}>
                        {role.status}
                      </span>
                    </div>
                    <motion.ul
                      layout={!shouldReduceMotion}
                      className="bullet-list"
                    >
                      {(expanded ? role.bullets : role.bullets.slice(0, 2)).map(
                        (bullet) => (
                          <motion.li
                            key={bullet}
                            initial={
                              shouldReduceMotion ? false : { opacity: 0, y: 5 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: shouldReduceMotion ? 0 : 0.2,
                            }}
                          >
                            {bullet}
                          </motion.li>
                        ),
                      )}
                    </motion.ul>
                    <button
                      className="record-toggle"
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedRecords((ids) =>
                          expanded
                            ? ids.filter((id) => id !== role.id)
                            : [...ids, role.id],
                        )
                      }
                      data-testid={`experience-toggle-${role.id}`}
                    >
                      {expanded ? (
                        <>
                          Close Full Record <ChevronUp size={13} />
                        </>
                      ) : (
                        <>
                          View Full Record <ChevronDown size={13} />
                        </>
                      )}
                    </button>
                    <div className="tag-row">
                      {role.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {role.agencies && (
                      <div
                        className="agency-row"
                        aria-label="Regulatory agencies analyzed"
                      >
                        {role.agencies.map((agency) => (
                          <span className="agency" key={agency}>
                            {agency}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section
          className="section container"
          id="projects"
          aria-labelledby="projects-title"
        >
          {header("5.0", "Academic Regulatory Projects", "projects")}
          <div className="doc-strip">
            <span>DOC ID: DP-RA-005</span>
            <span>NORTHEASTERN UNIVERSITY · REGULATORY AFFAIRS</span>
            <span>ACADEMIC PROJECTS</span>
            <span className="status">COMPLETED</span>
          </div>
          <div className="projects-grid" style={{ marginTop: 17 }}>
            {portfolio.projects.map((item) => (
              <button
                className="project-card card-hover"
                key={item.id}
                type="button"
                onClick={() => openProject(item)}
                aria-haspopup="dialog"
                data-testid={`project-${item.id}`}
              >
                <span className="folder-tab">{item.id}</span>
                <span className="framework">{item.framework}</span>
                <h3>{item.title}</h3>
                <span className="project-teaser">{item.teaser}</span>
                <span
                  className="lifecycle"
                  aria-label="Academic project status: drafted, reviewed, compiled, completed"
                >
                  {["Drafted", "Reviewed", "Compiled", "Completed"].map(
                    (step, index) => (
                      <span className="life-step" key={step}>
                        <motion.span
                          className="life-dot"
                          initial={
                            shouldReduceMotion
                              ? false
                              : { opacity: 0.3, scale: 0.65 }
                          }
                          whileInView={
                            shouldReduceMotion
                              ? undefined
                              : { opacity: 1, scale: 1 }
                          }
                          viewport={{ once: true, amount: 0.7 }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.35,
                            delay: shouldReduceMotion ? 0 : index * 0.1,
                            type: "spring",
                            bounce: 0.3,
                          }}
                        >
                          <Check />
                        </motion.span>
                        {step}
                      </span>
                    ),
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="section container"
          id="skills"
          aria-labelledby="skills-title"
        >
          {header("6.0", "Compliance Matrix", "skills")}
          <div className="doc-strip">
            <span>DOC ID: DP-RA-006</span>
            <span>SKILL INDEX</span>
            <span>{allSkills.length} ITEMS</span>
            <span className="status">CURRENT</span>
          </div>
          <div className="skills-panel card-hover" style={{ marginTop: 17 }}>
            <div
              className="filter-tabs"
              role="tablist"
              aria-label="Filter skills by category"
            >
              {[
                "All",
                ...portfolio.skillGroups.map((group) => group.category),
              ].map((category) => (
                <button
                  className={`filter-tab ${filter === category ? "selected" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={filter === category}
                  key={category}
                  onClick={() => setFilter(category)}
                  data-testid={`skill-filter-${category.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="skill-grid" role="tabpanel" aria-live="polite">
              {visibleSkills.map((skill, index) => {
                const Icon = categoryIcons[skill.category] ?? ShieldCheck;
                return (
                  <div
                    className="skill-chip"
                    key={skill.name}
                    tabIndex={0}
                    title={skill.context}
                    style={{ animationDelay: `${index * 18}ms` }}
                    data-testid="skill-chip"
                  >
                    <Icon aria-hidden="true" />
                    {skill.name}
                    <span className="tooltip" role="tooltip">
                      {skill.context}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="section container"
          id="hobbies"
          aria-labelledby="hobbies-title"
        >
          {header("7.0", "Beyond Work", "hobbies")}
          <p className="hobbies-intro">
            The things I make time for beyond work: words, movement, and a good
            book.
          </p>
          <div className="hobby-grid">
            {portfolio.hobbies.map((hobby, index) => {
              const Icon =
                hobby.id === "writing"
                  ? PenLine
                  : hobby.id === "dancing"
                    ? Music2
                    : BookOpen;
              return (
                <article className="hobby-card card-hover" key={hobby.id}>
                  <div className="hobby-card-top">
                    <span className="hobby-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="hobby-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="eyebrow mono">{hobby.label}</div>
                  <h3>{hobby.title}</h3>
                  <p>{hobby.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="section container"
          id="contact"
          aria-labelledby="contact-title"
        >
          {header("8.0", "Get in Touch", "contact")}
          <div className="contact-panel">
            <div className="contact-copy">
              <div className="eyebrow mono">OPEN TO NEW OPPORTUNITIES</div>
              <h2 className="section-title" id="contact-inquiry-title">
                Let’s create something beautiful together.
              </h2>
              <p>{portfolio.contactAvailability}</p>
              <a className="btn btn-primary" href={`mailto:${portfolio.email}`}>
                <Mail /> Say hello
              </a>
            </div>
            <div className="contact-links">
              <a
                className="contact-link card-hover"
                href={`mailto:${portfolio.email}`}
              >
                <span className="contact-icon">
                  <Mail />
                </span>
                <span>
                  <span className="contact-label">Email</span>
                  <strong>{portfolio.email}</strong>
                </span>
                <ExternalLink aria-hidden="true" />
              </a>
              {portfolio.linkedinUrl && (
                <a
                  className="contact-link card-hover"
                  href={portfolio.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-icon">
                    <ExternalLink />
                  </span>
                  <span>
                    <span className="contact-label">LinkedIn</span>
                    <strong>Connect with Dhrashti</strong>
                  </span>
                  <ArrowUp aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <div className="resume-actions">
            <a
              className="btn btn-outline"
              href={portfolio.resumePath}
              download
              data-testid="resume-download-contact"
            >
              <Download /> Download Resume (PDF)
            </a>
            <a
              className="btn btn-outline"
              href={portfolio.resumePath}
              target="_blank"
              rel="noreferrer"
              data-testid="resume-view"
            >
              <FileText /> View Resume
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>
            © 2026 Dhrashti Patel · {portfolio.footerStatus} · Last Revised:{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </span>
          <div className="footer-links">
            <a
              href={`mailto:${portfolio.email}`}
              aria-label="Email Dhrashti Patel"
            >
              <Mail />
            </a>
            {portfolio.linkedinUrl ? (
              <a
                href={portfolio.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
              >
                <ExternalLink />
              </a>
            ) : (
              <span
                aria-label="LinkedIn profile unavailable"
                title="LinkedIn URL not supplied"
              >
                <ExternalLink />
              </span>
            )}
            <button type="button" onClick={() => goTo("cover")}>
              Back to Cover <ArrowUp />
            </button>
          </div>
        </div>
      </footer>

      {menuOpen && (
        <div
          className="mobile-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio table of contents"
          data-testid="mobile-navigation"
        >
          <div className="mobile-menu-head">
            <a className="brand" href="#cover" onClick={() => goTo("cover")}>
              <span className="brand-mark">DP</span>
              <span className="brand-name">Dhrashti Patel</span>
            </a>
            <button
              className="mobile-menu-close"
              type="button"
              onClick={() => setMenuOpen(false)}
              ref={menuCloseRef}
              aria-label="Close navigation"
            >
              <X />
            </button>
          </div>
          <p className="toc-label">PORTFOLIO CONTENTS</p>
          {sections.map((item) => (
            <a
              className="toc-link"
              key={item.id}
              href={`#${item.id}`}
              onClick={() => goTo(item.id)}
              data-testid={`mobile-nav-${item.id}`}
            >
              <span className="toc-number">{item.number}</span>
              <span>{item.label}</span>
              <span className="toc-leader" />
              <ArrowDown size={13} />
            </a>
          ))}
          <a
            className="btn btn-primary mobile-download"
            href={portfolio.resumePath}
            download
          >
            <Download /> Download Resume
          </a>
        </div>
      )}

      {project && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProject(null);
          }}
          data-testid="project-modal-backdrop"
        >
          <motion.article
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            aria-describedby="project-modal-description"
            data-testid="project-modal"
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <div className="modal-top">
              <div>
                <div className="eyebrow mono">
                  ACADEMIC PROJECT · {project.id}
                </div>
                <h2 id="project-modal-title">{project.title}</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setProject(null)}
                ref={projectCloseRef}
                aria-label="Close project details"
                data-testid="project-modal-close"
              >
                <X />
              </button>
            </div>
            <div className="modal-body" id="project-modal-description">
              <div className="tag-row" style={{ marginTop: 0 }}>
                <span className="status">{project.framework}</span>
                <span className="status">COMPLETED</span>
              </div>
              <p>{project.teaser}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <div className="modal-tags">
                {project.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      )}
    </div>
  );
}

export default App;

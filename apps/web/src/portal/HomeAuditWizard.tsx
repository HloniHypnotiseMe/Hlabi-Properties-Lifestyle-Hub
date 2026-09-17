import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Home, ShieldCheck, Wrench } from 'lucide-react';
import type { AuditArea, ConditionGrade, HomeAuditFinding, Priority } from '../domain/property';
import { createHomeAudit } from '../api/homeownerApi';
import './audit.css';

interface HomeAuditWizardProps {
  propertyId: string;
  propertyName: string;
  userId: string;
  onComplete: (findings: HomeAuditFinding[]) => void;
  onCancel: () => void;
}

interface AreaQuestion {
  area: AuditArea;
  label: string;
  prompt: string;
  options: Array<{ grade: ConditionGrade; label: string; description: string }>;
}

const areas: AreaQuestion[] = [
  { area: 'roof', label: 'Roof & waterproofing', prompt: 'What best describes the roof today?', options: [
    { grade: 'GREEN', label: 'Good condition', description: 'No visible leaks or major concerns.' },
    { grade: 'AMBER', label: 'Needs attention', description: 'Minor wear, age-related issues or a repair is needed.' },
    { grade: 'RED', label: 'Urgent concern', description: 'Active leaks, major damage or a safety concern.' },
  ] },
  { area: 'structure', label: 'Structure', prompt: 'How does the visible structure look?', options: [
    { grade: 'GREEN', label: 'No obvious concern', description: 'No visible cracks or movement requiring attention.' },
    { grade: 'AMBER', label: 'Needs inspection', description: 'Cracks, movement or ageing that should be checked.' },
    { grade: 'RED', label: 'Urgent concern', description: 'Significant cracking, movement or structural warning signs.' },
  ] },
  { area: 'electrical', label: 'Electrical', prompt: 'What is the current electrical condition?', options: [
    { grade: 'GREEN', label: 'Appears sound', description: 'No obvious faults or exposed wiring.' },
    { grade: 'AMBER', label: 'Review recommended', description: 'Older installation, minor faults or uncertain compliance.' },
    { grade: 'RED', label: 'Safety concern', description: 'Exposed wiring, repeated faults or an apparent hazard.' },
  ] },
  { area: 'plumbing', label: 'Plumbing', prompt: 'How is the plumbing performing?', options: [
    { grade: 'GREEN', label: 'Working well', description: 'No obvious leaks, pressure or drainage problems.' },
    { grade: 'AMBER', label: 'Some maintenance', description: 'Minor leaks, ageing fittings or intermittent issues.' },
    { grade: 'RED', label: 'Urgent repair', description: 'Major leak, flooding or serious drainage problem.' },
  ] },
  { area: 'exterior', label: 'Exterior & paint', prompt: 'How is the exterior holding up?', options: [
    { grade: 'GREEN', label: 'Well maintained', description: 'Exterior finishes are generally sound.' },
    { grade: 'AMBER', label: 'Renewal due', description: 'Paint, sealant, walls or finishes need maintenance.' },
    { grade: 'RED', label: 'Major deterioration', description: 'Water damage, decay or significant external defects.' },
  ] },
  { area: 'interior', label: 'Interior', prompt: 'How is the interior condition?', options: [
    { grade: 'GREEN', label: 'Good', description: 'Normal wear with no major maintenance concerns.' },
    { grade: 'AMBER', label: 'Refresh needed', description: 'Repairs, repainting, flooring or fixtures are due.' },
    { grade: 'RED', label: 'Major work', description: 'Significant damage or habitability concerns are present.' },
  ] },
  { area: 'security', label: 'Security', prompt: 'How secure is the property?', options: [
    { grade: 'GREEN', label: 'Good', description: 'Doors, locks, gates and visible security measures are sound.' },
    { grade: 'AMBER', label: 'Upgrade recommended', description: 'Some locks, lighting, access or security measures need attention.' },
    { grade: 'RED', label: 'Security risk', description: 'Broken access controls or significant security vulnerabilities.' },
  ] },
  { area: 'grounds', label: 'Garden & grounds', prompt: 'How are the grounds maintained?', options: [
    { grade: 'GREEN', label: 'Maintained', description: 'Drainage, landscaping and boundaries are generally sound.' },
    { grade: 'AMBER', label: 'Maintenance due', description: 'Trees, drainage, paving, fencing or landscaping need work.' },
    { grade: 'RED', label: 'Urgent issue', description: 'A major drainage, boundary, tree or access problem needs attention.' },
  ] },
  { area: 'compliance', label: 'Documents & compliance', prompt: 'How complete are your property records?', options: [
    { grade: 'GREEN', label: 'Up to date', description: 'Key property documents are available and organised.' },
    { grade: 'AMBER', label: 'Some gaps', description: 'Some certificates, plans or records need to be located or updated.' },
    { grade: 'RED', label: 'Significant gaps', description: 'Important property records are missing or require professional review.' },
  ] },
];

const gradeWeight: Record<ConditionGrade, number> = { GREEN: 100, AMBER: 65, RED: 30 };

export default function HomeAuditWizard({ propertyId, propertyName, userId, onComplete, onCancel }: HomeAuditWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<AuditArea, ConditionGrade>>({} as Record<AuditArea, ConditionGrade>);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const current = areas[step];
  const answered = Object.keys(answers).length;
  const score = useMemo(() => answered ? Math.round(Object.values(answers).reduce((sum, grade) => sum + gradeWeight[grade], 0) / answered) : 0, [answers, answered]);

  const select = (grade: ConditionGrade) => {
    setSaveError(null);
    setAnswers((previous) => ({ ...previous, [current.area]: grade }));
  };

  const finish = async () => {
    const findings: HomeAuditFinding[] = areas.map((area, index) => {
      const grade = answers[area.area] ?? 'AMBER';
      const priority: Priority = grade === 'RED' ? 'URGENT' : grade === 'AMBER' ? 'MEDIUM' : 'LOW';
      return {
        id: `audit-finding-${index + 1}`,
        area: area.area,
        title: area.label,
        description: area.options.find((option) => option.grade === grade)?.description ?? '',
        grade,
        priority,
        recommendedAction: grade === 'GREEN' ? 'Keep under routine review.' : grade === 'AMBER' ? 'Plan maintenance and consider a verified supplier inspection.' : 'Arrange professional inspection or repair promptly.',
        verified: false,
      };
    });

    setSaving(true);
    setSaveError(null);
    try {
      await createHomeAudit(propertyId, findings, userId);
      onComplete(findings);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We could not save the audit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="audit-shell">
      <header className="audit-header">
        <button className="audit-back" onClick={onCancel} disabled={saving}><ArrowLeft size={16} /> Back to property hub</button>
        <div className="audit-brand"><span className="audit-mark">H</span><span>HLABI <small>HOME AUDIT</small></span></div>
        <span className="audit-progress">{step + 1} / {areas.length}</span>
      </header>

      <section className="audit-progress-bar"><span style={{ width: `${((step + 1) / areas.length) * 100}%` }} /></section>

      <section className="audit-content">
        <div className="audit-context"><ClipboardCheck size={18} /><span>Digital Home Audit</span><b>{propertyName}</b></div>
        <p className="audit-eyebrow">AREA {step + 1} OF {areas.length}</p>
        <h1>{current.label}</h1>
        <p className="audit-question">{current.prompt}</p>

        <div className="audit-options">
          {current.options.map((option) => (
            <button key={option.grade} className={`audit-option ${answers[current.area] === option.grade ? 'selected' : ''}`} onClick={() => select(option.grade)} disabled={saving}>
              <span className={`audit-dot ${option.grade.toLowerCase()}`} />
              <span><strong>{option.label}</strong><small>{option.description}</small></span>
              {answers[current.area] === option.grade && <CheckCircle2 size={20} />}
            </button>
          ))}
        </div>

        <div className="audit-note"><ShieldCheck size={18} /><span>This is a preliminary homeowner self-assessment. It does not replace a professional inspection, compliance assessment or insurance underwriting decision.</span></div>
        {saveError && <div className="audit-note"><Wrench size={18} /><span>Could not save your audit: {saveError}. Check the connection and try again.</span></div>}

        <footer className="audit-footer">
          <span><Home size={16} /> {answered} of {areas.length} areas assessed</span>
          {step < areas.length - 1 ? <button className="audit-next" disabled={!answers[current.area] || saving} onClick={() => setStep((value) => value + 1)}>Next area <ArrowRight size={17} /></button> : <button className="audit-next" disabled={answered !== areas.length || saving} onClick={() => void finish}>{saving ? 'Saving audit…' : 'Complete audit'} <Wrench size={17} /></button>}
        </footer>
      </section>

      {answered > 0 && <aside className="audit-score"><span>LIVE HEALTH INDICATOR</span><strong>{score}%</strong><small>Preliminary only · based on your answers</small></aside>}
    </main>
  );
}

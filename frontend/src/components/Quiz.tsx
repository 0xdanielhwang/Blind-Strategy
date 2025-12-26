import type { Answers } from './GameApp';
import '../styles/Quiz.css';

type Props = {
  answers: Answers;
  onChange: (answers: Answers) => void;
  disabled?: boolean;
};

type Option = { value: 1 | 2 | 3 | 4; label: string };
type Question = { id: keyof Answers; title: string; options: Option[] };

const questions: Question[] = [
  {
    id: 'q1',
    title: 'Question 1: What is your first move in a new market?',
    options: [
      { value: 1, label: 'Study competitors and identify gaps' },
      { value: 2, label: 'Launch quickly and iterate with users' },
      { value: 3, label: 'Build partnerships before shipping' },
      { value: 4, label: 'Wait for clear regulation and standards' },
    ],
  },
  {
    id: 'q2',
    title: 'Question 2: How do you manage risk under uncertainty?',
    options: [
      { value: 1, label: 'Diversify and cap downside exposure' },
      { value: 2, label: 'Place a concentrated bet with conviction' },
      { value: 3, label: 'Use small experiments to gather signal' },
      { value: 4, label: 'Avoid action until probabilities improve' },
    ],
  },
  {
    id: 'q3',
    title: 'Question 3: Which tactic best protects your edge?',
    options: [
      { value: 1, label: 'Speed: ship and adapt faster than others' },
      { value: 2, label: 'Secrecy: keep execution details private' },
      { value: 3, label: 'Community: align incentives and ownership' },
      { value: 4, label: 'Brand: win trust and mindshare early' },
    ],
  },
  {
    id: 'q4',
    title: 'Question 4: What is your decision rule when data conflicts?',
    options: [
      { value: 1, label: 'Prioritize recent evidence and update quickly' },
      { value: 2, label: 'Trust the model and wait for convergence' },
      { value: 3, label: 'Follow the strongest leading indicator' },
      { value: 4, label: 'Use a vote among independent reviewers' },
    ],
  },
];

export function Quiz({ answers, onChange, disabled }: Props) {
  return (
    <div className="quiz">
      {questions.map((q) => (
        <div key={q.id} className="question">
          <h3 className="question-title">{q.title}</h3>
          <div className="options">
            {q.options.map((opt) => (
              <label key={opt.value} className={`option ${disabled ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt.value}
                  checked={answers[q.id] === opt.value}
                  disabled={disabled}
                  onChange={() => onChange({ ...answers, [q.id]: opt.value })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CosmicButton } from '../components/CosmicButton'
import { RuneText } from '../components/RuneText'
import { GlyphPanel } from '../components/GlyphPanel'

export type TrialResult = {
  trial: 'good' | 'evil' | 'self'
  questionIndex: number
  answerIndex: number
  tags: string[]
}

const TRIAL_QUESTIONS = {
  good: [
    {
      question: "A village is starving. You have enough food for one family. Who do you save?",
      answers: [
        { text: "The family with the most children", tags: ["Sacrifice", "Mercy"] },
        { text: "The family of skilled warriors who can protect others", tags: ["Order", "Justice"] },
        { text: "The family that has suffered the most loss", tags: ["Mercy", "Compassion"] },
        { text: "The family most loyal to their community", tags: ["Loyalty", "Order"] }
      ]
    },
    {
      question: "You witness a powerful cultivator abusing their strength against the weak. What do you do?",
      answers: [
        { text: "Confront them directly, regardless of the risk", tags: ["Justice", "Courage"] },
        { text: "Report them to the proper authorities", tags: ["Order", "Loyalty"] },
        { text: "Help the victims and teach them to defend themselves", tags: ["Mercy", "Empowerment"] },
        { text: "Use your own strength to stop them permanently", tags: ["Justice", "Power"] }
      ]
    },
    {
      question: "Your Path requires sacrifice of something precious. What do you offer?",
      answers: [
        { text: "Your memories of loved ones", tags: ["Sacrifice", "Memory"] },
        { text: "Your physical strength and health", tags: ["Sacrifice", "Strength"] },
        { text: "Your connection to mortal concerns", tags: ["Sacrifice", "Transcendence"] },
        { text: "Your sense of self and identity", tags: ["Sacrifice", "Identity"] }
      ]
    },
    {
      question: "A friend betrays you for personal gain. How do you respond?",
      answers: [
        { text: "Forgive them and help them understand their mistake", tags: ["Mercy", "Compassion"] },
        { text: "Sever ties completely and move forward alone", tags: ["Justice", "Independence"] },
        { text: "Confront them and demand restitution", tags: ["Justice", "Confrontation"] },
        { text: "Use this as a lesson for both of us", tags: ["Wisdom", "Growth"] }
      ]
    },
    {
      question: "The greater good requires you to harm an innocent. What do you choose?",
      answers: [
        { text: "I cannot harm the innocent, no matter the cost", tags: ["Mercy", "Morality"] },
        { text: "I find another way that saves everyone", tags: ["Creativity", "Compassion"] },
        { text: "I accept the necessary evil for the greater good", tags: ["Sacrifice", "Duty"] },
        { text: "I become the necessary evil myself", tags: ["Power", "Responsibility"] }
      ]
    }
  ],
  evil: [
    {
      question: "Power is within your grasp, but it requires embracing darkness. What tempts you most?",
      answers: [
        { text: "The strength to crush any opposition", tags: ["Power", "Destruction"] },
        { text: "Knowledge forbidden to mortals", tags: ["Knowledge", "Ambition"] },
        { text: "Immortality through any means", tags: ["Survival", "Ambition"] },
        { text: "Freedom from all constraints", tags: ["Chaos", "Freedom"] }
      ]
    },
    {
      question: "You discover a way to extend your life by taking from others. Do you?",
      answers: [
        { text: "Yes, survival justifies any means", tags: ["Survival", "Power"] },
        { text: "Only from those who deserve it", tags: ["Justice", "Power"] },
        { text: "No, I find another path to longevity", tags: ["Morality", "Wisdom"] },
        { text: "I take only what they willingly give", tags: ["Manipulation", "Control"] }
      ]
    },
    {
      question: "Betrayal offers great reward. When would you betray another?",
      answers: [
        { text: "When they betray me first", tags: ["Justice", "Retaliation"] },
        { text: "When the reward outweighs the cost", tags: ["Ambition", "Calculation"] },
        { text: "Never, loyalty is absolute", tags: ["Loyalty", "Honor"] },
        { text: "When it serves a greater purpose", tags: ["Sacrifice", "Strategy"] }
      ]
    },
    {
      question: "You can gain immense power by consuming the essence of others. What do you consume?",
      answers: [
        { text: "Their life force, their very being", tags: ["Power", "Destruction"] },
        { text: "Their knowledge and memories", tags: ["Knowledge", "Ambition"] },
        { text: "Their emotions and passions", tags: ["Manipulation", "Control"] },
        { text: "Their potential and future possibilities", tags: ["Ambition", "Theft"] }
      ]
    },
    {
      question: "Darkness offers you a bargain: power for your morality. Do you accept?",
      answers: [
        { text: "Yes, morality is a weakness to be shed", tags: ["Power", "Transformation"] },
        { text: "I negotiate better terms", tags: ["Cunning", "Ambition"] },
        { text: "No, I find power on my own terms", tags: ["Independence", "Strength"] },
        { text: "I accept but maintain my core principles", tags: ["Balance", "Wisdom"] }
      ]
    }
  ],
  self: [
    {
      question: "What drives you more than anything else?",
      answers: [
        { text: "The pursuit of ultimate truth", tags: ["Truth", "Philosophy"] },
        { text: "Connection with others on a deep level", tags: ["Connection", "Empathy"] },
        { text: "Mastery over myself and my destiny", tags: ["Control", "Ambition"] },
        { text: "The beauty and mystery of existence", tags: ["Wonder", "Spirituality"] }
      ]
    },
    {
      question: "When faced with the unknown, you feel:",
      answers: [
        { text: "Excited by the possibilities", tags: ["Curiosity", "Adventure"] },
        { text: "Anxious about what might be lost", tags: ["Caution", "Security"] },
        { text: "Determined to understand and control it", tags: ["Control", "Knowledge"] },
        { text: "A deep sense of belonging", tags: ["Unity", "Spirituality"] }
      ]
    },
    {
      question: "Your greatest fear is:",
      answers: [
        { text: "Becoming irrelevant or forgotten", tags: ["Legacy", "Identity"] },
        { text: "Losing those I care about", tags: ["Connection", "Vulnerability"] },
        { text: "Failing to reach my potential", tags: ["Ambition", "Failure"] },
        { text: "Discovering the universe has no meaning", tags: ["Meaning", "Existentialism"] }
      ]
    },
    {
      question: "What aspect of yourself do you value most?",
      answers: [
        { text: "My capacity for growth and change", tags: ["Growth", "Adaptability"] },
        { text: "My unique perspective on the world", tags: ["Individuality", "Creativity"] },
        { text: "My strength and resilience", tags: ["Strength", "Endurance"] },
        { text: "My ability to understand others", tags: ["Empathy", "Wisdom"] }
      ]
    },
    {
      question: "In solitude, you find:",
      answers: [
        { text: "Peace and clarity of thought", tags: ["Contemplation", "Wisdom"] },
        { text: "Restlessness and desire for connection", tags: ["Connection", "Sociability"] },
        { text: "Creative energy and inspiration", tags: ["Creativity", "Independence"] },
        { text: "The weight of existence", tags: ["Existentialism", "Depth"] }
      ]
    }
  ]
}

const TRIAL_INFO = {
  good: {
    title: "Trial of Good",
    description: "What principles guide your compassion and justice?",
    color: "var(--gold-primary)",
    bgColor: "rgba(201, 168, 76, 0.1)"
  },
  evil: {
    title: "Trial of Evil",
    description: "What darkness tempts you, and how do you resist?",
    color: "var(--blood-red)",
    bgColor: "rgba(139, 26, 26, 0.1)"
  },
  self: {
    title: "Trial of Self",
    description: "What defines your core being and drives your Path?",
    color: "var(--spirit-blue)",
    bgColor: "rgba(26, 58, 107, 0.1)"
  }
}

export function TrialsScreen() {
  const [currentTrial, setCurrentTrial] = useState<'good' | 'evil' | 'self'>('good')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [results, setResults] = useState<TrialResult[]>([])
  const [showTransition, setShowTransition] = useState(false)
  const navigate = useNavigate()

  const currentQuestions = TRIAL_QUESTIONS[currentTrial]
  const question = currentQuestions[currentQuestion]
  const trialInfo = TRIAL_INFO[currentTrial]

  const handleAnswer = (answerIndex: number) => {
    const newResult: TrialResult = {
      trial: currentTrial,
      questionIndex: currentQuestion,
      answerIndex,
      tags: question.answers[answerIndex].tags
    }

    setResults(prev => [...prev, newResult])

    // Move to next question or trial
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Trial complete
      setShowTransition(true)
      setTimeout(() => {
        if (currentTrial === 'good') {
          setCurrentTrial('evil')
          setCurrentQuestion(0)
        } else if (currentTrial === 'evil') {
          setCurrentTrial('self')
          setCurrentQuestion(0)
        } else {
          // All trials complete
          navigate('/path-generation', { state: { trialResults: [...results, newResult] } })
        }
        setShowTransition(false)
      }, 2000)
    }
  }

  return (
    <motion.div
      className="screen screen-trials"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {showTransition ? (
          <motion.div
            key="transition"
            className="trial-transition"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <RuneText text={`Trial of ${currentTrial === 'good' ? 'Good' : currentTrial === 'evil' ? 'Evil' : 'Self'} Complete`} />
            <div className="transition-particles" />
          </motion.div>
        ) : (
          <motion.div
            key={`${currentTrial}-${currentQuestion}`}
            className="trial-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="trial-header" style={{ backgroundColor: trialInfo.bgColor }}>
              <h1 className="trial-title" style={{ color: trialInfo.color }}>
                {trialInfo.title}
              </h1>
              <p className="trial-description">{trialInfo.description}</p>
              <div className="trial-progress">
                Question {currentQuestion + 1} of {currentQuestions.length}
              </div>
            </div>

            <GlyphPanel title={`Question ${currentQuestion + 1}`}>
              <div className="question-content">
                <RuneText text={question.question} />
                <div className="answers-grid">
                  {question.answers.map((answer, index) => (
                    <CosmicButton
                      key={index}
                      className="answer-button"
                      onClick={() => handleAnswer(index)}
                      style={{ width: '100%' }}
                    >
                      <span className="answer-text">{answer.text}</span>
                    </CosmicButton>
                  ))}
                </div>
              </div>
            </GlyphPanel>

            <div className="trial-footer">
              <div className="trial-progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%`,
                    backgroundColor: trialInfo.color
                  }}
                />
              </div>
              <p className="trial-instruction">
                Choose the answer that resonates most deeply with you.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
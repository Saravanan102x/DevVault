import React, { useState } from 'react'
import {
  HelpCircle,
  Lightbulb,
  Quote,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DailyQuestion {
  id: string
  title: string
  category: string
  targetLevel: 'SDE 1' | 'SDE 2' | 'SDE 1 / SDE 2'
  question: string
  explanation: string
  keyTakeaway: string
  codeSnippet?: string
}

interface DailyTip {
  id: string
  title: string
  domain: string
  targetLevel: 'SDE 1' | 'SDE 2' | 'SDE 1 / SDE 2'
  content: string
  actionableStep: string
}

interface DevQuote {
  id: string
  quote: string
  author: string
  role: string
  context: string
}

const QUESTIONS: DailyQuestion[] = [
  {
    id: 'q1',
    title: 'HashMap Internals & Collision Resolution',
    category: 'Core Java & Collections',
    targetLevel: 'SDE 1 / SDE 2',
    question: 'How does HashMap work internally in Java 8+, and why does it convert linked list buckets into Red-Black trees?',
    explanation:
      'Java HashMap uses an array of Node<K,V> buckets. When put(key, value) is invoked, it computes hash = (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16) and index = (n - 1) & hash. If collisions occur, entries were traditionally stored in a linked list (O(n) search). Starting in Java 8, when a bucket reaches TREEIFY_THRESHOLD (8 entries) and table capacity is at least 64, the bin is converted into a balanced Red-Black Tree (TreeNode), lowering worst-case search time from O(n) to O(log n). If items decrease to 6 (UNTREEIFY_THRESHOLD), it reverts back to a linked list.',
    keyTakeaway: 'The bitwise index masking (n - 1) & hash requires the capacity to always be a power of 2. Treeification prevents hash collision denial-of-service degradation.',
    codeSnippet: `// Java 8+ HashMap bucket treeify condition:
if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
    treeifyBin(tab, hash);`,
  },
  {
    id: 'q2',
    title: 'Spring Boot: @Transactional Self-Invocation Bypass',
    category: 'Spring Boot & Microservices',
    targetLevel: 'SDE 2',
    question: 'Why does calling a @Transactional method from another method inside the same Spring @Service class fail to start a database transaction?',
    explanation:
      'Spring manages declarative transactions via AOP Dynamic Proxies (CGLIB or JDK Dynamic Proxies). When an external bean calls orderService.createOrder(), the call hits the proxy, which begins a transaction, calls the target method, and commits/rollbacks. However, when methodA() calls this.methodB() within the same class, the call bypasses the proxy and executes directly on the raw instance target. Hence, @Transactional on methodB() is never intercepted.',
    keyTakeaway: 'Self-invocation bypasses Spring AOP proxies. To fix, either move methodB() to a separate service bean, or inject the bean into itself via @Lazy / ObjectProvider.',
  },
  {
    id: 'q3',
    title: 'equals() and hashCode() Contract',
    category: 'Core Java Fundamentals',
    targetLevel: 'SDE 1',
    question: 'Why must you override hashCode() whenever you override equals() in Java? What happens if you fail to do so?',
    explanation:
      'The Java Object contract specifies: If two objects are equal according to equals(Object), they MUST produce the exact same integer hashCode(). If you override equals() but forget hashCode(), two objects with identical business values will return different memory-based hash codes. When stored in a HashMap or HashSet, they will be routed to different buckets, causing map.get(key) to return null even though an equal key exists!',
    keyTakeaway: 'Violating the equals/hashCode contract silently breaks HashMap, HashSet, and Hashtable lookups.',
    codeSnippet: `@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Employee e)) return false;
    return id == e.id && Objects.equals(name, e.name);
}

@Override
public int hashCode() {
    return Objects.hash(id, name);
}`,
  },
  {
    id: 'q4',
    title: 'REST API Idempotency & HTTP Methods',
    category: 'REST API Design & Web',
    targetLevel: 'SDE 1 / SDE 2',
    question: 'Which standard HTTP methods are idempotent, and how do you achieve idempotency for non-idempotent POST payment requests?',
    explanation:
      'An HTTP method is idempotent if executing it multiple times produces the exact same server side-effect as executing it once. GET, PUT, DELETE, and HEAD are idempotent; POST and PATCH are not. For financial transactions (like creating a payment via POST), the client generates a unique UUID (Idempotency-Key header). The backend saves this key in Redis/DB with a distributed lock. If network retries resend the POST, the server detects the key, skips re-charging, and returns the cached response.',
    keyTakeaway: 'Idempotency keys prevent duplicate payments caused by client retries, network timeouts, or double-clicking submit buttons.',
  },
  {
    id: 'q5',
    title: 'Java Memory Model: volatile & Happens-Before',
    category: 'Concurrency & Multithreading',
    targetLevel: 'SDE 2',
    question: 'What guarantees does the volatile keyword provide in Java, and why is volatile int counter; counter++ NOT thread-safe?',
    explanation:
      'volatile provides two guarantees: 1) Visibility: writes to a volatile variable are immediately flushed to main memory and subsequent reads invalidate CPU L1/L2 cache, reading fresh from memory. 2) Ordering: prevents instruction reordering via memory barriers (StoreStore, LoadLoad). However, counter++ is a composite operation consisting of three separate bytecode instructions: getfield, iadd, and putfield. Since volatile does not provide atomicity, two threads can read the same value concurrently and race on write.',
    keyTakeaway: 'volatile guarantees visibility and ordering, but NOT atomicity. Use AtomicInteger or synchronized locks for compound read-modify-write operations.',
  },
]

const ARCHITECTURE_TIPS: DailyTip[] = [
  {
    id: 't1',
    title: 'Preventing Database Connection Pool Starvation',
    domain: 'Database & HikariCP',
    targetLevel: 'SDE 2',
    content:
      'Never invoke slow third-party external HTTP REST APIs or perform heavy computation while holding an active relational database transaction. HikariCP connection pools typically have 10-20 connections. A downstream 3-second delay on a payment API will exhaust the entire pool within 20 concurrent requests, triggering 500 ConnectionTimeout exceptions across completely unrelated endpoints.',
    actionableStep:
      'Fetch required data first, close or omit the transaction before calling external microservices, and only open @Transactional for the final write phase.',
  },
  {
    id: 't2',
    title: 'Cache Stampede Mitigation (Cache Aside)',
    domain: 'Distributed Systems & Caching',
    targetLevel: 'SDE 2',
    content:
      'When high-traffic cache keys expire, hundreds of concurrent threads may query the cache simultaneously, find a miss, and execute the identical heavy SQL query on the database concurrently—crashing the database in a thundering herd event.',
    actionableStep:
      'Implement probabilistic early expiration (XFetch algorithm) or employ a distributed mutex lock (Redisson lock) so only one thread recomputes the cache while others wait briefly.',
  },
  {
    id: 't3',
    title: 'Circuit Breaker Pattern with Resilience4j',
    domain: 'Microservices Resilience',
    targetLevel: 'SDE 1 / SDE 2',
    content:
      'When a downstream dependency suffers degraded latency or failures, failing fast via a Circuit Breaker prevents cascading resource depletion. When failure rates surpass a threshold (e.g. 50%), the breaker transitions to OPEN, immediately returning cached fallback responses without waiting on socket timeouts.',
    actionableStep:
      'Configure slidingWindowType: COUNT_BASED, minimumNumberOfCalls: 10, and provide a clear, deterministic fallback method returning graceful degraded state.',
  },
]

const DEV_QUOTES: DevQuote[] = [
  {
    id: 'dq1',
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    role: 'Turing Award Laureate & Computer Scientist',
    context: 'Core philosophy for distributed systems and clean modular code design.',
  },
  {
    id: 'dq2',
    quote: 'First do it, then do it right, then do it better.',
    author: 'Addy Osmani',
    role: 'Engineering Leader & Author',
    context: 'Iterative refinement: Build a correct foundation first, profile before optimizing.',
  },
  {
    id: 'dq3',
    quote: 'Controlling complexity is the essence of computer programming.',
    author: 'Brian Kernighan',
    role: 'Co-creator of AWK & The C Programming Language',
    context: 'On writing readable, maintainable software systems.',
  },
]

export const DailyDevHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'question' | 'tip' | 'quote'>('question')
  const [questionIdx, setQuestionIdx] = useState(0)
  const [tipIdx, setTipIdx] = useState(0)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentQ = QUESTIONS[questionIdx]
  const currentT = ARCHITECTURE_TIPS[tipIdx]
  const currentQuote = DEV_QUOTES[quoteIdx]

  const nextQuestion = () => {
    setShowAnswer(false)
    setQuestionIdx((prev) => (prev + 1) % QUESTIONS.length)
  }

  const nextTip = () => {
    setTipIdx((prev) => (prev + 1) % ARCHITECTURE_TIPS.length)
  }

  const nextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % DEV_QUOTES.length)
  }

  const copySnippet = (snippet?: string) => {
    if (!snippet) return
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Snippet copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="dev-card p-4 sm:p-5">
      {/* Top Bar with Tab Selection */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0] dark:border-[#262838] flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('question')
              setShowAnswer(false)
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors font-medium flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'question'
                ? 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6]'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
            <span>Daily Technical Question</span>
          </button>

          <button
            onClick={() => setActiveTab('tip')}
            className={`px-2.5 py-1 text-xs rounded transition-colors font-medium flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tip'
                ? 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6]'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
            <span>Architecture Note</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`px-2.5 py-1 text-xs rounded transition-colors font-medium flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quote'
                ? 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6]'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#777B8A]" />
            <span>Reflection</span>
          </button>
        </div>

        <button
          onClick={
            activeTab === 'question'
              ? nextQuestion
              : activeTab === 'tip'
              ? nextTip
              : nextQuote
          }
          className="text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] flex items-center gap-1 transition-colors cursor-pointer"
          title="Cycle to next entry"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="text-[11px]">Next</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-3.5">
        {activeTab === 'question' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#6C5CE7] dark:text-[#8C7CFF] uppercase tracking-wider font-medium">
                {currentQ.category}
              </span>
              <span className="text-[#B0B4C3] text-[11px]">•</span>
              <span className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">
                Target: {currentQ.targetLevel}
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg text-[#20212A] dark:text-[#F1F2F6] font-normal leading-snug">
              {currentQ.question}
            </h3>

            {/* Answer Disclosure */}
            <div className="pt-1">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                  <span>Reveal Analysis</span>
                </button>
              ) : (
                <div className="space-y-3 rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] p-4 text-xs leading-relaxed animate-in fade-in duration-120">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E9EAF0] dark:border-[#262838]">
                    <span className="text-[11px] font-medium text-[#6C5CE7] dark:text-[#8C7CFF] uppercase tracking-wider">
                      Technical Breakdown
                    </span>
                    <button
                      onClick={() => setShowAnswer(false)}
                      className="text-[11px] text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3 h-3" /> Hide
                    </button>
                  </div>

                  <p className="text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">
                    {currentQ.explanation}
                  </p>

                  {currentQ.codeSnippet && (
                    <div className="relative">
                      <pre className="p-3 rounded bg-[#F0EDFF] dark:bg-[#1E202E] border border-[#E9EAF0] dark:border-[#262838] text-xs font-mono text-[#20212A] dark:text-[#F1F2F6] overflow-x-auto">
                        <code>{currentQ.codeSnippet}</code>
                      </pre>
                      <button
                        onClick={() => copySnippet(currentQ.codeSnippet)}
                        className="absolute right-2 top-2 p-1 text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6]"
                        title="Copy code"
                      >
                        {copied ? <Check className="w-3 h-3 text-[#6C5CE7]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  <div className="p-2.5 rounded bg-[#F5F6FA] dark:bg-[#1A1C28] border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF] text-[11.5px] text-[#20212A] dark:text-[#F1F2F6]">
                    <span className="font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] block mb-0.5">Key Principle:</span>
                    {currentQ.keyTakeaway}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tip' && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#6C5CE7] dark:text-[#8C7CFF] uppercase tracking-wider font-medium">
                {currentT.domain}
              </span>
              <span className="text-[#B0B4C3] text-[11px]">•</span>
              <span className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">
                Target: {currentT.targetLevel}
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg text-[#20212A] dark:text-[#F1F2F6] font-normal">
              {currentT.title}
            </h3>

            <p className="text-xs text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">
              {currentT.content}
            </p>

            <div className="p-3 rounded bg-[#F8F9FC] dark:bg-[#14151F] border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF] text-xs text-[#20212A] dark:text-[#F1F2F6]">
              <span className="font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] block mb-0.5">Implementation Advice:</span>
              {currentT.actionableStep}
            </div>
          </div>
        )}

        {activeTab === 'quote' && (
          <div className="space-y-3 py-1">
            <blockquote className="font-serif text-base sm:text-lg italic text-[#20212A] dark:text-[#F1F2F6] leading-relaxed pl-3 border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF]">
              "{currentQuote.quote}"
            </blockquote>

            <div className="flex items-center justify-between pt-2 border-t border-[#E9EAF0] dark:border-[#262838] text-xs">
              <div>
                <span className="font-medium text-[#20212A] dark:text-[#F1F2F6] block">
                  {currentQuote.author}
                </span>
                <span className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">
                  {currentQuote.role}
                </span>
              </div>
              <span className="text-[11px] text-[#B0B4C3] italic hidden sm:block">
                {currentQuote.context}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

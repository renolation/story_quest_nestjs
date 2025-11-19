# Story Quest - Core Domain Features

## 📋 Document Overview

This document describes the **core domain features** of Story Quest across all three platforms:
- **Mobile App** (Flutter): Student-facing learning experience
- **Web Dashboard** (React): Multi-role admin panel for management
- **Backend API** (NestJS): Server-side business logic and data management

**Purpose**: Provide a unified view of business features without implementation details.

---

## 🎯 System Overview

### Vision
Story Quest is an AI-powered English learning platform for Vietnamese students (grades 3-5, ages 8-11) that transforms curriculum-based learning into engaging interactive stories.

### Core Value Propositions
1. **Personalized Learning**: AI-generated stories tailored to student level and interests
2. **Curriculum Alignment**: 100% aligned with Vietnamese education standards
3. **Multi-Modal Learning**: Reading, listening, speaking, and writing practice
4. **Progress Tracking**: Real-time analytics for students, teachers, and parents
5. **Gamification**: Rewards, achievements, and competitive elements
6. **Multi-Role Management**: Comprehensive tools for agencies, centers, teachers, and reviewers

---

## 👥 User Roles & Personas

### Student (Mobile Only)
**Primary User**: Vietnamese children aged 8-11 in grades 3-5

**Characteristics**:
- Limited English proficiency (beginner to intermediate)
- Rural area background (primary target)
- Motivated by games and stories
- Needs parental guidance
- Requires child-safe environment

**Needs**:
- Fun, engaging learning experience
- Clear progress visibility
- Instant feedback on performance
- Safe, age-appropriate content
- Offline access to lessons

---

### Teacher (Web Dashboard Only)
**Primary User**: English teachers at learning centers

**Characteristics**:
- Manages multiple classes and students
- Creates and customizes curriculum content
- Monitors student progress
- Provides personalized feedback
- Limited technical expertise

**Needs**:
- Easy content creation tools
- Student progress monitoring
- Note-taking for individual students
- Homework assignment and tracking
- Communication with parents
- Performance analytics

---

### Center Admin (Web Dashboard Only)
**Primary User**: Learning center owners/administrators

**Characteristics**:
- Manages multiple branches
- Oversees teachers and classes
- Focuses on business metrics
- Budget-conscious
- Wants growth insights

**Needs**:
- Multi-branch management
- Teacher and class scheduling
- Student enrollment tracking
- Financial reporting (subscriptions, giftcodes)
- Analytics and insights
- Read-only student data access

---

### Reviewer (Web Dashboard Only)
**Primary User**: Content moderators and quality assurance specialists

**Characteristics**:
- Reviews teacher-created content
- Ensures quality and appropriateness
- Subject matter expert
- Detail-oriented
- Supports teachers via chat

**Needs**:
- Content review queue
- Approval/rejection workflow
- Commenting and feedback tools
- Chat support for teachers
- Review history tracking
- Quality metrics

---

### Agency (Web Dashboard Only)
**Primary User**: Super administrators and platform owners

**Characteristics**:
- Oversees entire platform
- Manages multiple centers
- Handles system-wide content
- Strategic decision-maker
- Technical oversight

**Needs**:
- System-wide analytics
- Center management and approval
- Content marketplace management
- Study abroad portal management
- User management across all roles
- Platform health monitoring

---

## 📚 Core Learning Features

### 1. Curriculum Structure

#### Hierarchical Organization
The curriculum follows a four-level hierarchy:

**Chapter** → **Unit** → **Level** → **Questions**

**Chapter**:
- Top-level organizational unit
- Represents major themes (e.g., "My Family", "At School")
- Contains multiple units
- Has ordering for sequential learning
- Tracks completion progress

**Unit**:
- Sub-topic within a chapter
- Focuses on specific learning objectives
- Contains multiple levels of increasing difficulty
- Includes vocabulary sets and grammar structures
- Tracks student mastery

**Level**:
- Individual learning session or lesson
- Contains 5-15 interactive questions
- Has time limits and passing scores
- Includes various question types
- Provides immediate feedback
- Can be retaken for improvement

**Question**:
- Individual learning interaction
- Four main types (detailed below)
- Awards points based on difficulty
- Tracks correctness and time spent
- Includes multimedia (images, audio)

---

### 2. Question Types

#### Fill in the Blank
**Purpose**: Test vocabulary and grammar understanding

**Mechanics**:
- Sentence or passage with missing words
- Student types the correct word(s)
- Multiple blanks possible
- Case-insensitive matching
- Partial credit available

**Example**: "I ___ to school every day." (Answer: go/walk)

---

#### Talk to Speech Compare (Pronunciation)
**Purpose**: Practice speaking and pronunciation

**Mechanics**:
- Student hears native speaker pronunciation
- Student records their own pronunciation
- AI compares and scores similarity
- Visual waveform feedback
- Confidence threshold scoring
- Allows multiple attempts

**Scoring Levels**:
- Excellent (90-100%): Native-like pronunciation
- Good (70-89%): Understandable with minor errors
- Try Again (50-69%): Needs improvement
- Practice More (<50%): Significant errors

---

#### Sort Words (Sentence Construction)
**Purpose**: Build grammar and sentence structure skills

**Mechanics**:
- Scrambled words presented to student
- Student drags and drops to correct order
- Can include punctuation
- Validates word order and grammar
- Immediate visual feedback

**Example**: [school / to / I / go] → "I go to school"

---

#### Select Right Answer (Multiple Choice)
**Purpose**: Comprehension and recall testing

**Mechanics**:
- Question with 2-4 answer options
- Single correct answer
- May include images or audio
- Randomized option order
- Explanation after selection

**Example**:
Q: "What color is the sky?"
Options: Blue, Green, Red, Yellow

---

### 3. AI Story Generation

#### Personalized Narratives
**Purpose**: Engage students through custom-generated stories

**Story Parameters**:
- **Genre**: Mystery, Fairy Tale, Mythology, Daily Life
- **Difficulty**: Matches student's current level
- **Length**: 200-400 words for age group
- **Vocabulary**: Incorporates target words from curriculum
- **Grammar Focus**: Emphasizes specific structures
- **Student Role**: Student becomes character in story

**Generation Process**:
1. AI analyzes student's learning progress
2. Selects appropriate vocabulary and grammar
3. Generates age-appropriate narrative
4. Embeds learning objectives naturally
5. Creates comprehension questions
6. Generates image prompts for illustrations

**Content Safety**:
- Automatic content moderation
- Age-appropriate themes
- Culturally sensitive for Vietnamese context
- No violence or inappropriate content
- Manual review option available

---

### 4. Progress Tracking

#### Student Progress Metrics

**Chapter-Level Progress**:
- Total units in chapter
- Completed units count
- Average score across all units
- Time spent on chapter
- Completion percentage

**Unit-Level Progress**:
- Total levels in unit
- Completed levels count
- Average score across all levels
- Mastery status
- Time investment

**Level-Level Progress**:
- Attempt history
- Best score achieved
- Time spent per attempt
- Question-by-question performance
- Stars earned (1-3 based on score)

**Overall Progress**:
- Total learning time
- Chapters completed
- Current streak (consecutive days)
- Achievement badges earned
- Leaderboard ranking

---

#### Vocabulary Mastery Tracking

**Word States**:
- **New**: First encounter
- **Learning**: Seen 1-3 times
- **Practicing**: Seen 4-7 times, 50%+ correct
- **Mastered**: Seen 8+ times, 80%+ correct

**Metrics per Word**:
- Total exposures
- Correct usage count
- Pronunciation attempts and scores
- Last practiced date
- Context examples

**Spaced Repetition**:
- Words resurface based on mastery level
- Struggling words appear more frequently
- Mastered words reviewed periodically
- Adaptive difficulty adjustment

---

### 5. Gamification & Rewards

#### Achievement System

**Achievement Categories**:
- **Story Explorer**: Complete X stories
- **Word Master**: Master X vocabulary words
- **Pronunciation Pro**: Perfect pronunciation scores
- **Consistent Learner**: Daily streak milestones
- **Fast Learner**: Complete levels quickly
- **Perfect Score**: 100% on quizzes
- **Team Player**: Participate in collaborative features

**Badge Tiers**:
- Bronze: Basic milestone
- Silver: Intermediate achievement
- Gold: Advanced accomplishment
- Platinum: Exceptional performance

---

#### Points & Stars System

**Stars**:
- 1 star: 50-69% score
- 2 stars: 70-89% score
- 3 stars: 90-100% score
- Collected per level
- Used to unlock content

**Points**:
- Earned for all activities
- Question difficulty multiplier
- Bonus for first-time completion
- Streak bonuses
- Used for leaderboard ranking

**Leaderboards**:
- Class leaderboard
- Center leaderboard
- National leaderboard
- Weekly/monthly resets
- Age-appropriate competition

---

#### Reward Mechanisms

**Unlockables**:
- Avatar customizations
- Story genre unlocks
- Advanced level access
- Special badges
- Certificate downloads

**Celebrations**:
- Confetti animations on achievements
- Character dances on level completion
- Sound effects for milestones
- Progress bar fills
- Notification badges

---

## 🎨 Content Management Features

### 1. Content Creation (Teachers)

#### Curriculum Content Creation

**Chapter Creation**:
- Title and description
- Learning objectives
- Order sequencing
- Visibility settings
- Cover image upload
- Estimated duration

**Unit Creation**:
- Associated chapter
- Learning goals
- Vocabulary list (10-20 words)
- Grammar structures
- Phonics patterns
- Language functions
- Order within chapter

**Level Creation**:
- Associated unit
- Difficulty setting
- Time limit (optional)
- Passing score threshold
- Question composition
- Point allocation
- Retry settings

**Question Creation**:
- Question type selection
- Question text/prompt
- Answer options (for MCQ)
- Correct answer(s)
- Point value
- Multimedia attachment
- Hints (optional)

---

#### Content Templates

**Pre-built Templates**:
- Common question patterns
- Standard unit structures
- Chapter frameworks
- Assessment blueprints

**Custom Templates**:
- Save custom question formats
- Reusable unit structures
- Branded chapter layouts
- Organization-specific standards

---

### 2. Content Review (Reviewers)

#### Review Queue Management

**Queue Filters**:
- Content type (chapter/unit/level/question)
- Submission date
- Creator (teacher)
- Priority level
- Status (pending/in-review/approved/rejected)

**Review Actions**:
- Approve with no changes
- Approve with suggestions
- Request revisions (with feedback)
- Reject (with detailed reasons)
- Flag for escalation

**Review Criteria**:
- Curriculum alignment
- Age appropriateness
- Grammar and spelling accuracy
- Difficulty level matching
- Question quality
- Content safety

---

#### Feedback & Communication

**Comment System**:
- Inline comments on specific content
- General feedback notes
- Suggestion attachments
- Version history tracking

**Chat Support**:
- Real-time messaging with teachers
- Question clarification
- Best practices sharing
- Technical assistance

**Review Reports**:
- Approval/rejection statistics
- Common issues identified
- Quality trends over time
- Reviewer performance metrics

---

### 3. Content Marketplace (Agency)

#### Marketplace Overview

**Purpose**: Centralized hub for sharing high-quality content across centers

**Content Types**:
- Complete chapters
- Unit collections
- Level packs
- Question banks
- Story templates
- Assessment sets

**Content Attributes**:
- Creator information
- Quality rating (1-5 stars)
- Usage statistics
- Price (free/paid)
- Grade level
- Difficulty
- Subject tags
- Preview availability

---

#### Publishing Workflow

**Submission Process**:
1. Center/teacher creates content
2. Internal review (center level)
3. Submission to marketplace
4. Agency review and approval
5. Publication to marketplace
6. Availability to all centers

**Monetization Options**:
- Free public content
- Premium paid content
- Subscription bundles
- Center-exclusive content
- Revenue sharing models

---

#### Discovery & Adoption

**Search & Filter**:
- Keyword search
- Grade level filter
- Subject/theme filter
- Difficulty range
- Price range
- Rating threshold
- Most popular
- Recently added

**Preview & Trial**:
- Sample questions visible
- Video walkthroughs
- User reviews and ratings
- Usage statistics
- Try before purchase (limited)

**Adoption Tracking**:
- Download counts
- Active user statistics
- Completion rates
- Average scores
- Teacher feedback
- Student engagement metrics

---

## 🎓 Teaching & Management Features

### 1. Class Management (Centers)

#### Class Organization

**Class Attributes**:
- Class name and code
- Grade level
- Branch location
- Assigned teacher
- Student roster (max capacity)
- Schedule (days/times)
- Curriculum assignment
- Status (active/inactive)

**Class Operations**:
- Create new classes
- Edit class details
- Assign/reassign teachers
- Set enrollment limits
- Archive completed classes
- Duplicate class structure

---

#### Student Enrollment

**Enrollment Process**:
- Student registration via mobile app
- Manual enrollment by center
- Giftcode redemption
- Class assignment
- Parent notification
- Welcome materials

**Transfer Management**:
- Move students between classes
- Transfer between branches
- Change teacher assignment
- Progress preservation
- Communication tracking

---

### 2. Teacher Tools

#### Student Notes

**Note-Taking Features**:
- Private teacher notes
- Observation categories:
  - Struggling areas
  - Excellent performance
  - Behavioral observations
  - Learning style notes
  - Parent communication log

**Note Attributes**:
- Date and timestamp
- Student association
- Note type/category
- Tags for organization
- Visibility (private/shared)
- Follow-up reminders

---

#### Homework Management

**Assignment Creation**:
- Select levels or chapters
- Set due dates
- Point value assignment
- Instructions and guidelines
- Difficulty customization
- Group vs. individual

**Assignment Tracking**:
- Submission status
- Completion percentage
- Average scores
- Time spent analytics
- Late submission tracking
- Auto-grading for objective questions

**Feedback Delivery**:
- Automated score reports
- Written feedback comments
- Audio feedback recordings
- Suggestion for improvement
- Reassignment for practice

---

### 3. Analytics & Reporting

#### Student Analytics (Teachers & Centers)

**Individual Student Reports**:
- Overall progress percentage
- Chapter/unit completion
- Average scores by topic
- Time spent learning
- Strength and weakness analysis
- Vocabulary mastery counts
- Pronunciation scores
- Attendance/engagement trends

**Class Analytics**:
- Class average scores
- Completion rates
- Top performers
- Students needing attention
- Comparative performance
- Progress over time graphs

---

#### Center Analytics (Center Admins)

**Business Metrics**:
- Total enrolled students
- Active vs. inactive students
- Class utilization rates
- Teacher workload distribution
- Revenue from subscriptions
- Giftcode usage statistics
- Student retention rates
- Growth trends

**Operational Insights**:
- Branch comparison
- Teacher performance ratings
- Content usage patterns
- Peak usage times
- Resource allocation needs
- Capacity planning data

---

#### Agency Analytics (Super Admin)

**Platform-Wide Metrics**:
- Total users (all roles)
- Active centers and branches
- System-wide engagement
- Content creation volume
- Marketplace transactions
- API usage statistics
- Performance benchmarks
- Geographic distribution

**Quality Metrics**:
- Content approval rates
- Average review time
- Student satisfaction scores
- Teacher adoption rates
- System uptime
- Error rates
- Support ticket volume

---

## 💳 Subscription & Monetization Features

### 1. Subscription Tiers

#### Free Trial
**Duration**: 14 days

**Features**:
- Access to first chapter only
- All question types available
- Basic progress tracking
- Limited AI story generation (3 stories)
- No ads
- Single device

**Target**: New users, trial period

---

#### Basic Subscription
**Price**: 50,000 VND/month (~$2 USD)

**Features**:
- Access to all curriculum content
- Unlimited AI story generation
- Full progress tracking
- Offline mode
- 2 device limit
- Basic analytics
- Email support

**Target**: Individual students, budget-conscious families

---

#### Premium Subscription
**Price**: 100,000 VND/month (~$4 USD)

**Features**:
- All Basic features
- Advanced analytics and reports
- Personalized learning paths
- Priority AI story generation
- Advanced pronunciation feedback
- 5 device limit
- Parent dashboard access
- Priority support
- Downloadable certificates

**Target**: Engaged families, serious learners

---

#### Center/School License
**Price**: Custom (per student/month)

**Features**:
- All Premium features
- Multi-user management
- Teacher dashboard access
- Custom curriculum creation
- Bulk student accounts
- Administrative controls
- Advanced reporting
- API access (optional)
- Dedicated account manager
- SLA guarantees

**Target**: Learning centers, schools, institutions

---

### 2. In-App Purchases (IAP)

#### Verification System

**Purchase Flow**:
1. Student initiates purchase in mobile app
2. App Store/Play Store processes payment
3. Receipt sent to backend for verification
4. Backend validates with Apple/Google APIs
5. Subscription activated in database
6. Confirmation sent to user
7. Access granted immediately

**Security Measures**:
- Receipt validation against official APIs
- Fraud detection algorithms
- Duplicate purchase prevention
- Refund handling
- Subscription renewal tracking

---

#### Subscription States

**Active States**:
- Trial: Within trial period
- Active: Paid and current
- Grace Period: Payment issue, temporary access
- On Hold: Suspended by user
- Paused: Temporarily stopped

**Inactive States**:
- Expired: Subscription ended
- Cancelled: User terminated
- Refunded: Payment reversed
- Suspended: Admin action

---

### 3. Giftcode System (Centers)

#### Giftcode Creation

**Giftcode Types**:
- **Trial Code**: 7-30 day trial access
- **Discount Code**: Percentage or fixed discount
- **Full Access Code**: Free subscription period

**Code Attributes**:
- Unique code string
- Expiration date
- Maximum usage count
- Assigned to specific class/grade (optional)
- Creator (center admin)
- Discount value or duration
- Status (active/expired/used up)

**Generation Options**:
- Single code
- Bulk code generation
- Custom code patterns
- Auto-expiration rules

---

#### Giftcode Management

**Distribution**:
- Email distribution
- Print-ready PDF
- QR code generation
- CSV export for records
- SMS sending (optional)

**Tracking**:
- Redemption count
- Redemption dates
- User who redeemed
- Remaining uses
- Expiration alerts
- Usage analytics

**Restrictions**:
- One code per user enforcement
- Device fingerprinting
- Grade level validation
- Geographic restrictions (optional)
- Combination rules (stackable/non-stackable)

---

## 🌍 Study Abroad Portal (Agency Feature)

### 1. Program Management

#### Study Abroad Programs

**Program Attributes**:
- Program name and description
- Destination country
- Partner institutions
- Duration (weeks/months/years)
- Age/grade eligibility
- English proficiency requirements
- Cost breakdown
- Available dates
- Application deadlines
- Capacity limits

**Program Types**:
- Short-term camps (2-4 weeks)
- Semester exchange (3-6 months)
- Full academic year
- Summer programs
- Language immersion
- Cultural exchange
- University preparation

---

#### Program Discovery

**Search & Filter**:
- Destination country
- Program duration
- Age/grade level
- Cost range
- Start dates
- Language requirements
- Subject focus
- Scholarship availability

**Program Details**:
- Photo galleries
- Video tours
- Daily schedules
- Accommodation info
- Meal plans
- Activities and excursions
- Academic curriculum
- Testimonials from alumni

---

### 2. AI-Powered Recommendations

#### Personalized Matching

**Recommendation Factors**:
- Student's English proficiency level
- Academic performance history
- Age and grade level
- Learning goals and interests
- Family budget considerations
- Previous travel experience
- Personality assessment
- Career aspirations

**AI Analysis**:
- Natural language processing of student profile
- Matching algorithm based on multiple factors
- Success prediction modeling
- Risk assessment (homesickness, culture shock)
- Alternative program suggestions
- Scholarship eligibility prediction

---

#### Student Readiness Assessment

**Assessment Components**:
- English language proficiency test
- Cultural awareness quiz
- Independence and maturity evaluation
- Academic preparedness
- Health and physical readiness
- Social skills assessment

**Readiness Report**:
- Overall readiness score
- Strengths and weaknesses
- Recommended preparation actions
- Timeline to readiness
- Resource recommendations
- Counselor notes

---

### 3. Application Workflow

#### Application Process

**Application Stages**:
1. **Inquiry**: Student expresses interest
2. **Profile Creation**: Complete student profile
3. **Readiness Assessment**: AI evaluation
4. **Program Selection**: Choose 1-3 programs
5. **Document Preparation**: Gather required materials
6. **Application Submission**: Submit to agency
7. **Agency Review**: Initial screening
8. **Partner Institution Review**: Final decision
9. **Acceptance/Rejection**: Notification
10. **Pre-Departure Preparation**: Orientation and logistics

**Required Documents**:
- Application form
- Student essay/statement
- Academic transcripts
- English proficiency certificate
- Passport copy
- Health records
- Parent consent forms
- Financial documentation
- Reference letters (2-3)
- Passport-sized photos

---

#### Application Tracking

**Student Dashboard**:
- Application status for each program
- Document checklist
- Pending action items
- Deadline reminders
- Communication history
- Interview scheduling
- Payment tracking

**Agency Dashboard**:
- All applications overview
- Stage-wise filtering
- Review queue
- Assignment to counselors
- Communication logs
- Document verification status
- Approval workflow

---

### 4. Communication & Support

#### Counselor Assignment

**Assignment Logic**:
- Geographic expertise
- Language skills
- Workload balancing
- Student age specialization
- Success rate history

**Counselor Responsibilities**:
- Application review
- Document verification
- Interview coordination
- Recommendation writing
- Student guidance
- Parent communication
- Partner liaison

---

#### Communication Tools

**Messaging System**:
- In-app messaging
- Email integration
- Video call scheduling
- Document sharing
- Notification system
- Chat history preservation

**Support Resources**:
- FAQ library
- Video tutorials
- Application guides
- Checklist templates
- Sample essays
- Interview preparation
- Pre-departure guides
- Emergency contacts

---

### 5. Post-Application Services

#### Pre-Departure Preparation

**Orientation Programs**:
- Cultural orientation sessions
- Language preparation workshops
- Travel logistics training
- Health and safety briefings
- Homesickness management
- Communication expectations
- Emergency procedures

**Logistics Support**:
- Visa application assistance
- Flight booking guidance
- Airport pickup coordination
- Accommodation arrangements
- Insurance procurement
- Currency exchange information
- Packing lists

---

#### Ongoing Support (During Program)

**Check-in System**:
- Weekly check-in calls
- Progress monitoring
- Issue escalation
- Emergency support 24/7
- Parent updates
- Academic progress tracking
- Host family communication

**Issue Resolution**:
- Homesickness counseling
- Academic difficulties
- Cultural adjustment support
- Conflict mediation
- Health issues
- Early return protocols

---

## 🔔 Notification & Communication Features

### 1. Push Notifications (Mobile)

#### Student Notifications

**Learning Reminders**:
- Daily learning streak reminders
- Incomplete homework alerts
- New chapter unlocked
- Achievement earned
- Friend activity (if social features enabled)

**Progress Updates**:
- Weekly progress summary
- Milestone achievements
- Level completion congratulations
- Score improvements
- Vocabulary mastery notifications

**Engagement Prompts**:
- "You haven't learned today" reminders
- New story available
- Challenge from classmate
- Leaderboard position change
- Teacher feedback received

---

### 2. Email Notifications (All Users)

#### Parent Notifications

**Weekly Reports**:
- Learning time summary
- Topics covered
- Scores and achievements
- Areas of strength
- Areas needing attention
- Teacher notes (if any)

**Important Alerts**:
- Subscription expiration warning
- Payment issues
- Child safety concerns
- Progress concerns from teacher
- Major achievements

---

#### Teacher Notifications

**Class Activity**:
- New student enrollment
- Student completed homework
- Low performance alerts
- Review requests for content
- Message from parents

**Administrative**:
- Content approved/rejected
- Schedule changes
- Center announcements
- Training opportunities

---

#### Center Notifications

**Business Alerts**:
- New student registrations
- Subscription renewals/cancellations
- Low class enrollment warnings
- Teacher availability changes
- Revenue milestones

**Operational**:
- System maintenance notices
- Feature updates
- Policy changes
- Marketplace updates

---

## 🔒 Safety & Privacy Features

### 1. Child Safety (COPPA Compliance)

#### Data Minimization

**Collected Data**:
- Username (not real name required)
- Email (parent's email)
- Age/grade level
- Learning progress
- Audio recordings (temporary only)

**Not Collected**:
- Precise location
- Photos of child
- Contact information
- Browsing history outside app
- Social media data

---

#### Parental Controls

**Consent Requirements**:
- Parental email verification
- Terms acceptance by parent
- Data collection consent
- Third-party sharing opt-in
- Marketing communication preferences

**Parent Dashboard**:
- View all child activity
- Control screen time limits
- Manage privacy settings
- Export child's data
- Request data deletion
- Communication preferences

---

### 2. Content Moderation

#### Automated Filters

**AI Content Moderation**:
- Profanity detection
- Inappropriate theme filtering
- Violence/adult content blocking
- Cultural sensitivity checks
- Age-appropriateness validation

**Pre-Publication Review**:
- All AI-generated stories reviewed
- Teacher-created content flagged if suspicious
- Automated scoring for quality
- Escalation to human reviewers

---

#### Manual Review Queue

**Reviewer Workflows**:
- Flagged content review
- User-reported content
- Random quality checks
- New teacher content (first submissions)
- High-risk content categories

**Review Actions**:
- Approve
- Approve with edits
- Reject and notify
- Ban user (severe cases)
- Report to authorities (illegal content)

---

### 3. Data Privacy & Security

#### Data Protection

**Encryption**:
- End-to-end encryption for communication
- At-rest database encryption
- TLS/SSL for data in transit
- Encrypted backups
- Secure audio storage

**Access Controls**:
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) for admin
- Session timeout enforcement
- IP allowlisting (optional for centers)
- Audit logging of all access

---

#### Privacy Rights

**GDPR/CCPA Compliance**:
- Right to access data
- Right to data portability
- Right to be forgotten
- Right to rectification
- Right to restrict processing
- Data breach notification (72 hours)

**Data Retention**:
- Active user data: Indefinite (until account deletion)
- Audio recordings: 24 hours maximum
- Deleted account data: 30 days in backup, then purged
- Anonymized analytics: Retained indefinitely

---

## 🌐 Accessibility Features

### 1. Language Support

#### Localization

**Supported Languages**:
- Vietnamese (primary UI language)
- English (learning content + UI option)

**Localized Elements**:
- All UI text and labels
- Error messages
- Help documentation
- Email communications
- Tutorial videos
- Terms and policies

---

### 2. Accessibility Standards

#### Visual Accessibility

**Features**:
- Adjustable font sizes (3 levels)
- High contrast mode
- Colorblind-friendly palettes
- Screen reader support (ARIA labels)
- Text-to-speech for all content
- Dyslexia-friendly font option

---

#### Auditory Accessibility

**Features**:
- Visual captions for all audio
- Adjustable playback speed
- Volume controls
- Visual alerts (in addition to audio)
- Haptic feedback option

---

#### Motor Accessibility

**Features**:
- Large touch targets (min 48x48dp)
- Swipe gesture alternatives (button options)
- Voice control support
- Adjustable interaction timeouts
- One-handed mode

---

## 📱 Offline Mode Features

### 1. Content Download (Mobile)

#### Offline Access

**Downloadable Content**:
- Complete chapters (all units/levels)
- Individual units
- Vocabulary flashcards
- Audio files for pronunciation
- Story collections
- Progress data (synced when online)

**Storage Management**:
- View downloaded content size
- Delete downloaded content
- Auto-download settings
- Wi-Fi only download option
- Storage limit warnings

---

### 2. Offline Functionality

#### Available Features Offline

**Learning Activities**:
- Complete downloaded levels
- Practice vocabulary flashcards
- Read downloaded stories
- Record pronunciations (synced later)
- Review past progress

**Sync Behavior**:
- Queue actions when offline
- Auto-sync when connection restored
- Conflict resolution (latest action wins)
- Partial sync indicators
- Manual sync trigger

---

## 🎮 Social & Collaborative Features (Future)

### 1. Friend System (Phase 2)

#### Friend Connections

**Friend Discovery**:
- Classmate auto-suggestions
- QR code friend add
- Username search (parental approval required)
- Center-wide friend network

**Friend Activities**:
- View friend progress (anonymized)
- Send encouragement messages (pre-approved templates)
- Challenge friends to levels
- Collaborative story mode
- Study group creation

---

### 2. Parent-Child Features (Phase 2)

#### Co-Learning Mode

**Shared Activities**:
- Parent can join child's session
- Read stories together
- Practice pronunciation together
- Review progress together
- Celebrate achievements together

**Parent Involvement**:
- Weekly reading challenges
- Family leaderboard
- Parent tips and guides
- Conversation starters based on lessons

---

## 🚀 Future Enhancement Ideas (Roadmap)

### Phase 2 Features (6-12 months)
- Multiplayer story mode
- AR vocabulary learning
- Voice chat with AI characters
- Video stories with real actors
- Live tutoring integration
- Advanced analytics with ML insights

### Phase 3 Features (12-24 months)
- Student story creation tools
- Peer-to-peer learning marketplace
- Integration with school LMS systems
- Expanded language support (other Asian languages)
- VR immersive learning experiences
- Blockchain-based achievement certificates

---

## 📊 Success Metrics (KPIs)

### Educational KPIs
- **Vocabulary Mastery**: 80% of practiced words mastered
- **Pronunciation Improvement**: 70% accuracy gain over 30 days
- **Listening Comprehension**: 70-80% improvement
- **Level Completion Rate**: >60% of started levels completed
- **Daily Active Users (DAU)**: >40% of enrolled students
- **Average Session Duration**: >15 minutes

### Business KPIs
- **Student Retention (D7)**: >40%
- **Student Retention (D30)**: >20%
- **Conversion Rate (Trial to Paid)**: >15%
- **Center Adoption Rate**: >30 centers in year 1
- **Teacher Satisfaction**: >4.0/5.0 rating
- **Parent Satisfaction**: >4.5/5.0 rating

### Technical KPIs
- **App Crash Rate**: <1%
- **API Uptime**: >99.9%
- **Average Response Time**: <200ms
- **Offline Mode Success**: 100% core features work offline

---

## 📝 Glossary of Terms

**Chapter**: Top-level curriculum unit containing multiple units
**Unit**: Sub-topic within a chapter containing multiple levels
**Level**: Individual learning session with questions
**Question**: Single interactive learning activity
**Attempt**: One instance of a student trying to complete a level
**Mastery**: Level of proficiency with vocabulary (new/learning/mastered)
**Streak**: Consecutive days of learning activity
**Achievement**: Milestone reward for specific accomplishment
**Badge**: Visual representation of achievement
**Leaderboard**: Ranking system for competitive motivation
**Giftcode**: Promotional code for subscription access
**Marketplace**: Content sharing platform for curriculum
**Study Abroad Portal**: Program discovery and application platform
**IAP**: In-App Purchase (mobile subscription)
**COPPA**: Children's Online Privacy Protection Act
**RBAC**: Role-Based Access Control
**DAU**: Daily Active Users
**MAU**: Monthly Active Users
**LMS**: Learning Management System

---

**Document Version**: 1.0
**Last Updated**: 2025-01-19
**Status**: ✅ Complete

**Maintained By**: Product Team
**Related Documents**:
- `claude.md` (Backend Implementation)
- `claude-react.md` (Web Dashboard Implementation)
- `claude-flutter.md` (Mobile App Implementation)

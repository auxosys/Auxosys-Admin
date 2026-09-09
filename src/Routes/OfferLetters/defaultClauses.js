export const buildCompensationClauseContent = (offerType, ctcAmount, currency = "INR") => {
  const numAmount = parseFloat(ctcAmount);
  const isPaid = !isNaN(numAmount) && numAmount > 0;

  if (offerType === "Internship") {
    if (isPaid) {
      return `<p><ul><li><b>Monthly Stipend:</b> You shall be entitled to a fixed stipend of <b>${currency} ${ctcAmount}</b> per month for the duration of the internship, payable every month, subject to satisfactory performance and completion of assigned responsibilities.</li><li><b>Performance-Based Incentives:</b> The Intern may be eligible for performance-based incentives or bonuses at the sole discretion of the Company based on your contribution to the project(s), strategy, and overall impact. Such incentives are discretionary and not guaranteed.</li><li><b>Payment Cycle:</b> The stipend shall be credited to your designated bank account within the first 10 working days of the following month, subject to the timely submission of work logs, attendance, and performance reports.</li><li><b>Deductions:</b> The Company reserves the right to withhold or deduct stipend payments in the following circumstances:<ul><li>Absenteeism without approval or documentation.</li><li>Failure to meet assigned deadlines or deliverables.</li><li>Breach of confidentiality or misconduct.</li><li>Non-compliance with internal policies or legal obligations.</li></ul></li><li><b>Tax Implications:</b> All payments are subject to applicable statutory deductions, including, but not limited to, TDS (Tax Deducted at Source) as per prevailing laws of the Republic of India. You are responsible for fulfilling your individual income tax obligations.</li><li><b>Final Settlement:</b> Upon successful completion of your tenure, and only after fulfilling all exit formalities, including return of assets and documentation, the Company will process your final dues, including any approved pending stipends, performance incentives, or certificates.</li></ul></p>`;
    } else {
      return `<p><ul><li><b>Monthly Stipend:</b> This internship is unpaid. The Intern shall not be entitled to a fixed monthly stipend or salary during the internship period.</li><li><b>Performance-Based Incentives:</b> The Intern may be eligible for performance-based incentives or bonuses at the sole discretion of the Company based on your contribution to the project(s), strategy, and overall impact. Such incentives are discretionary and not guaranteed.</li><li><b>Tax Implications:</b> Any performance-based incentives or bonus payments, if awarded, are subject to applicable statutory deductions, including TDS as per prevailing laws of the Republic of India. You are responsible for fulfilling your individual income tax obligations.</li><li><b>Final Settlement:</b> Upon successful completion of your tenure, and only after fulfilling all exit formalities, including return of assets and documentation, the Company will process your exit clearance, issue your internship completion certificate, and disburse any approved performance incentives.</li></ul></p>`;
    }
  } else {
    const compText = isPaid
      ? `You shall be entitled to an annual CTC of <b>${currency} ${ctcAmount}</b>, payable in accordance with the Company's standard payroll cycle, subject to satisfactory performance and completion of assigned responsibilities.`
      : `You shall not be entitled to any fixed compensation or CTC for the duration of the employment, subject to satisfactory performance and completion of assigned responsibilities.`;

    return `<p><ul><li><b>Compensation:</b> ${compText}</li><li><b>Bonus/Incentives:</b> You may be eligible for additional bonuses or performance-based incentives, which will be solely determined by the Company based on your contribution to the project(s), strategy, and overall impact. These payments, if any, are discretionary and not guaranteed.</li><li><b>Payment Cycle:</b> The salary shall be credited to your designated bank account within the first 10 working days of the following month, subject to the timely submission of work logs, attendance, and performance reports.</li><li><b>Deductions:</b> The Company reserves the right to withhold or deduct payments in the following circumstances:<ul><li>Absenteeism without approval or documentation.</li><li>Failure to meet assigned deadlines or deliverables.</li><li>Breach of confidentiality or misconduct.</li><li>Non-compliance with internal policies or legal obligations.</li></ul></li><li><b>Tax Implications:</b> All payments are subject to applicable statutory deductions, including, but not limited to, TDS (Tax Deducted at Source) as per prevailing laws of the Republic of India. You are responsible for fulfilling your individual income tax obligations.</li><li><b>Final Settlement:</b> Upon successful completion of your tenure, and only after fulfilling all exit formalities, including return of assets and documentation, the Company will process your final dues, including any approved pending salary, bonuses, or certificates.</li></ul></p>`;
  }
};

export const FULL_TIME_CLAUSES = [
  {
    id: "compensation",
    title: "Compensation and Payment Terms",
    content: buildCompensationClauseContent("Full-Time", "600000", "INR"),
    isActive: true,
    required: true
  },
  {
    id: "nature_of_engagement",
    title: "Nature and Scope of Engagement",
    content: `<p>Your engagement with AUXOSYS ("the Company") is offered in the form of full-time employment, as specified in this agreement. This engagement is intended to provide you with professional opportunities and development within the Company's operational framework.</p><p>It is expressly understood and agreed that this engagement is for full-time employment subject to the terms and conditions set forth in this agreement.</p><p>During the course of your employment, you will be assigned to work closely with designated internal teams, project managers, and other key personnel, contributing actively to ongoing projects, tasks, and operational functions. You are expected to perform your duties diligently, following assigned responsibilities with professionalism and due care.</p><p>Your role requires strict adherence to all Company policies, including, but not limited to, confidentiality, data protection, intellectual property rights, and professional discipline. You shall exercise the highest level of integrity in handling sensitive and proprietary information and will be responsible for safeguarding all confidential materials and data entrusted to you during the tenure of your engagement.</p><p>The Company reserves the right to modify your assignments, roles, or responsibilities as per business needs and project requirements. Your continued engagement is contingent upon satisfactory performance and compliance with all applicable Company policies and ethical standards.</p><p>Furthermore, you acknowledge that your employment is subject to periodic review and may be terminated by either party in accordance with the terms and conditions set forth in this agreement.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "professional_behaviour",
    title: "Professional Behaviour and Ethical Conduct",
    content: `<p>At AUXOSYS, we hold professionalism and ethical conduct as fundamental pillars that uphold our corporate culture and foster a respectful and productive work environment. As an employee, you are expected to consistently demonstrate the highest standards of professional behaviour throughout your engagement with the Company. This includes, but is not limited to, the following key expectations:</p><ul><li><b>Punctuality and Attendance:</b> You are required to be punctual in reporting to work or attending virtual meetings and complete assigned work within the stipulated time frames. Regular attendance and adherence to scheduled work hours reflect your commitment and respect for the organisation and your colleagues.</li><li><b>Discipline:</b> Maintain self-discipline at all times in your conduct and work ethic. This encompasses following all Company policies, refraining from any form of misconduct, and abiding by directions issued by your supervisors or management personnel.</li><li><b>Mutual Respect and Teamwork:</b> Foster an environment of mutual respect, cooperation, and collaboration with colleagues, supervisors, and clients. Discrimination, bullying, harassment (whether verbal, physical, sexual, or psychological), or any form of disrespectful behaviour is strictly prohibited and will be regarded as a severe violation of this Code.</li><li><b>Adherence to Instructions:</b> You must diligently follow all lawful instructions and guidelines provided by authorised personnel. Failure to comply with instructions may impact project outcomes and the Company's reputation.</li><li><b>Responsiveness and Communication:</b> Maintain prompt, clear, and professional communication both internally and externally. Timely updates on work progress, addressing queries, and participating actively in discussions are essential responsibilities.</li><li><b>Integrity and Honesty:</b> Demonstrate honesty and transparency in all your dealings. Any form of dishonesty, including falsification of information, misrepresentation, or withholding critical information, will be treated as a serious breach of trust.</li><li><b>Confidentiality:</b> Safeguard all confidential and proprietary information of the Company, clients, and partners. Unauthorised disclosure, sharing, or misuse of confidential data is a violation of Company policy and applicable law.</li><li><b>Use of Company Resources:</b> Utilise all Company resources, including physical assets, digital tools, and information, responsibly and solely for official purposes. Misuse or misappropriation of Company property will result in strict disciplinary action.</li></ul><p><b>Consequences of Violations</b><br>Any form of unprofessional behaviour or violation of the Code of Conduct will be considered gross misconduct. Such misconduct includes, but is not limited to:<ul><li>Harassment or abuse (verbal, physical, or sexual).</li><li>Discrimination based on gender, caste, religion, ethnicity, disability, sexual orientation, or any other protected category.</li><li>Intentionally disrupting work or causing conflicts within the team.</li><li>Spreading rumours or false information damaging to the Company's reputation.</li><li>Breach of confidentiality or data protection policies.</li><li>Any conduct that adversely affects the Company's image or goodwill.</li></ul></p><p><b>Disciplinary Actions and Legal Recourse</b><br>The Company reserves the right to take strict and immediate disciplinary action against any employee found guilty of misconduct, including but not limited to:<ul><li>Formal written warnings and counselling.</li><li>Suspension from duties without pay.</li><li>Termination of employment without notice or severance benefits.</li><li>Reporting to legal authorities and filing complaints under relevant laws.</li><li>Initiation of civil or criminal proceedings for damages or offences committed.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "confidentiality_obligations",
    title: "Code of Conduct and Confidentiality Obligations",
    content: `<p>As a valued member of the AUXOSYS team, you are entrusted with access to sensitive and proprietary information essential to the Company's operations, competitive standing, and client relationships. Upholding strict confidentiality and complying with the Company's Code of Conduct are fundamental responsibilities throughout your employment tenure.</p><p><b>Confidential Information Defined</b><br>Confidential information includes, but is not limited to, the following:<ul><li>Proprietary business data, including financial records, marketing strategies, project plans, product designs, software code, technical documentation, and operational procedures.</li><li>Client and vendor information, including contracts, pricing, negotiation details, and communications.</li><li>Internal reports, meeting minutes, organisational charts, and employee records.</li><li>Any information marked as "confidential," "restricted," or designated by the Company to be sensitive.</li><li>Information disclosed orally, visually, or electronically during the course of your engagement.</li></ul></p><p><b>Non-Disclosure and Non-Use Obligations</b><br>You agree and undertake to:<ul><li>Maintain the strict confidentiality of all such information during and after your employment with AUXOSYS.</li><li>Refrain from disclosing, sharing, publishing, distributing, or disseminating confidential information to any third party, including family members, friends, or external organisations, without prior written authorisation from the Company.</li><li>Not to use confidential information for personal gain, competitive advantage, or any purpose unrelated to your duties at the Company.</li><li>Ensure that all physical and electronic materials containing confidential information are securely stored and access is restricted to authorised personnel only.</li></ul></p><p><b>Restrictions on Copying and Transmission</b><ul><li>You shall not copy, reproduce, transmit, or store any confidential or proprietary data outside of approved Company platforms or devices.</li><li>The use of personal devices for storing Company data without explicit approval is strictly prohibited.</li><li>Any transmission of confidential information over electronic communication channels must comply with Company IT policies and encryption standards.</li></ul></p><p><b>Reporting of Security Breaches</b><ul><li>You are obligated to immediately report any actual or suspected unauthorised access, data breaches, or disclosure of confidential information to your supervisor or the Company's designated compliance officer.</li><li>Failure to report such incidents will be treated as a serious violation and may result in disciplinary action.</li></ul></p><p><b>Legal Implications of Breach</b><ul><li>Any breach of confidentiality obligations will be regarded as both a criminal and civil offence under applicable Indian laws, including but not limited to the Information Technology Act, 2000 (IT Act), which penalises unauthorised access, disclosure, and misuse of electronic data.</li><li>The Company reserves the right to initiate immediate legal proceedings against individuals who violate these obligations, which may include filing police complaints, civil lawsuits for damages, and seeking injunctive relief.</li><li>You acknowledge that unauthorised disclosure or misuse of confidential information may cause irreparable harm to the Company, justifying such legal action.</li></ul></p><p><b>Return of Company Property</b><ul><li>Upon termination or conclusion of your employment, you shall immediately return all documents, materials, electronic devices, and any other property belonging to the Company.</li><li>You shall not retain any copies, notes, or extracts of confidential information in any form.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "asset_usage",
    title: "Digital and Physical Asset Usage",
    content: `<p>As part of your employment with AUXOSYS ("the Company"), you may be granted access to various digital and physical assets essential to the performance of your duties. These assets include, but are not limited to, Company computer systems, software applications, databases, proprietary tools, communication platforms (such as email, instant messaging, and collaboration software), intellectual property, physical equipment, and documentation.</p><p><b>Authorised Use of Company Assets</b><ul><li>Access to the Company's digital and physical assets is extended solely for the purpose of fulfilling your assigned responsibilities and contributing to the Company's business objectives.</li><li>You are required to use these assets strictly for official, project-related activities.</li><li>Personal use of Company systems, software, or physical resources is expressly prohibited unless specifically authorised in writing by the management.</li></ul></p><p><b>Access Controls and Security</b><ul><li>You must comply with all security protocols established by the Company, including but not limited to password protection, two-factor authentication, and restricted access levels.</li><li>Sharing login credentials or access rights with unauthorised persons is strictly forbidden.</li><li>You are responsible for safeguarding your access credentials and ensuring that no unauthorised individual gains access to Company systems or physical resources through your account.</li></ul></p><p><b>Data Handling and Protection</b><ul><li>Any data accessed, processed, or stored using Company assets remains the sole property of the Company and must be handled in accordance with Company policies and applicable data protection laws.</li><li>You must not extract, copy, transfer, delete, or manipulate any Company data, documents, software code, or intellectual property without explicit prior authorisation from your supervisor or the Company's designated authority.</li><li>Unauthorised use or dissemination of such data, whether for personal benefit, third-party sharing, or competitive advantage, will be considered a grave violation of Company policy.</li></ul></p><p><b>Prohibited Activities</b><br>The following actions are strictly prohibited and constitute misconduct:<ul><li>Using Company digital or physical assets for personal projects, financial gain, or any activity unrelated to Company business.</li><li>Installing unauthorised software or hardware on Company systems or networks.</li><li>Attempting to bypass or undermine the Company's security controls or monitoring systems.</li><li>Engaging in any form of cyber-attack, data theft, intellectual property infringement, or sabotage.</li><li>Downloading, storing, or distributing illegal, offensive, or inappropriate content via Company resources.</li></ul></p><p><b>Monitoring and Compliance</b><ul><li>The Company reserves the right to monitor and audit the use of its digital and physical assets to ensure compliance with all policies and legal requirements.</li><li>You acknowledge that any use of Company assets may be subject to inspection and investigation without prior notice, consistent with applicable laws and regulations.</li></ul></p><p><b>Consequences of Misuse</b><ul><li>Any violation of the asset usage policies outlined above will result in immediate disciplinary action, which may include suspension, termination of your employment, and forfeiture of any benefits.</li><li>The Company will initiate legal proceedings against individuals responsible for data theft, unauthorised disclosure, intellectual property violation, or any breach of contractual terms relating to asset usage. Such proceedings may include civil litigation, criminal prosecution, and reporting to law enforcement agencies.</li><li>In the case of intellectual property infringement, the Company will vigorously protect its rights under applicable intellectual property laws, including but not limited to copyright, patent, and trade secret laws.</li></ul></p><p><b>Return of Assets</b><ul><li>Upon completion or termination of your employment, you are required to return all Company-issued physical assets, including laptops, mobile devices, access cards, documents, and any other materials provided during your tenure.</li><li>All digital access, including user accounts and permissions, will be revoked at the end of your engagement.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "offer_acceptance",
    title: "Offer Acceptance and Non-Compliance",
    content: `<p><b>Acceptance of Offer</b><br>Upon receiving this offer, you are required to formally acknowledge and accept the terms and conditions outlined herein by signing and returning a copy of this letter within the stipulated acceptance period. Acceptance of this offer constitutes your commitment to join AUXOSYS ("the Company") on the mutually agreed date and to comply fully with all Company policies and procedures.</p><p><b>Obligations Upon Acceptance</b><br>Once you have accepted the offer:<ul><li>You are required to report for duty on the agreed start date without fail.</li><li>You must maintain regular communication with the Company during the onboarding process and thereafter, promptly responding to any official communication.</li><li>You are expected to engage professionally with the Company's representatives to facilitate a smooth onboarding and integration into your assigned role.</li></ul></p><p><b>Definition of Non-Compliance and Absconding</b><br>Non-compliance will be considered under the following circumstances:<ul><li>Failure to join on the agreed start date without prior notice or approval from the Company.</li><li>Failure to respond to communications, including emails, phone calls, or messages, from the Company within a reasonable timeframe.</li><li>Deliberate avoidance of communication or attempts to evade joining the Company despite having accepted the offer.</li><li>Unauthorised absconding or unexplained absence for a continuous period beyond what is permitted by Company policies.</li></ul></p><p><b>Consequences of Non-Compliance</b><br>In the event of any non-compliance as described above, the Company reserves the right to take the following actions:<ul><li><b>Cancellation of the Employment Offer:</b> The Company may immediately revoke your offer of employment, rendering it null and void.</li><li><b>Legal Action for Misconduct:</b> The Company may initiate appropriate legal proceedings to recover damages or seek remedies for any loss or reputational harm caused by non-compliance or absconding.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "voluntary_exit",
    title: "Voluntary Exit and Notice Requirement",
    content: `<p><b>Voluntary Termination of Engagement</b><br>Should you, at any time during your full-time employment with AUXOSYS ("the Company"), decide to voluntarily terminate your engagement, it is mandatory that you comply with the Company's formal exit procedure as outlined below. This ensures a smooth transition, maintains professional decorum, and safeguards the Company's operational integrity.</p><p><b>Mandatory Notice Period</b><ul><li>You are required to submit a written notice of resignation or exit addressed to your immediate supervisor or the Human Resources department.</li><li>This notice must be provided at least 30 calendar days prior to your intended last working day, allowing the Company sufficient time for project handovers, knowledge transfer, and administrative processing.</li><li>The written notice should clearly specify your intended last working day and reasons for exit.</li></ul></p><p><b>Consequences of Non-Compliance</b><br>Failure to serve the mandatory notice period or abrupt departure without prior notice shall be considered a material breach of contract. Actions may include:<ul><li><b>Legal Action:</b> The Company reserves the right to initiate legal proceedings for breach of contract to seek damages.</li><li><b>Withholding of Benefits:</b> Any pending salary payments, experience letters, or relief certificates will be held until completion of exit formalities.</li></ul></p><p><b>Exit Formalities</b><ul><li>Compliance with the notice period requires active cooperation in handing over responsibilities, returning Company property, and completing clearance processes.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "exclusivity",
    title: "Exclusivity of Engagement",
    content: `<p>Throughout the period of your employment with AUXOSYS, you are strictly prohibited from engaging in any form of professional, part-time, full-time, freelance, consulting, advisory, or volunteer work with any other individual, company, organisation, startup, or institution without the prior written consent of the Company.</p><p>This restriction applies to any activity that involves intellectual, physical, or digital contribution in exchange for monetary or non-monetary benefits, or any activity that may lead to a conflict of interest or compromise confidentiality.</p><p><b>Consequences of Violation:</b><br>If found to be in breach of this clause:<ul><li>Immediate termination of employment without notice or compensation;</li><li>Forfeiture of pending payments, incentives, or benefits;</li><li>Revocation of employment certificates or professional references from the Company;</li><li>Initiation of legal proceedings under applicable laws.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "false_allegations",
    title: "False Allegations and Malicious Public Statements",
    content: `<p><b>Zero Tolerance Policy</b><br>AUXOSYS ("the Company") maintains an uncompromising stance against any form of defamation, dissemination of false information, or malicious public statements that could damage the Company's reputation, credibility, or business interests.</p><p><b>Scope of Prohibited Conduct</b><br>You are strictly prohibited from making, either directly or indirectly, any statements or allegations that are:<ul><li>Factually incorrect, misleading, or unsubstantiated;</li><li>Intentionally harmful or designed to malign the Company, its management, employees, clients, partners, or stakeholders;</li><li>Disseminated publicly through social media platforms, online forums, blogs, or press outlets.</li></ul></p><p><b>Legal Implications</b><ul><li>Defamation or spreading of false information will be subject to appropriate civil lawsuits for damages and criminal complaints under applicable laws.</li><li>You will be held personally liable for any monetary or reputational damage caused to the Company.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "performance_review",
    title: "Performance Review and Termination",
    content: `<p><b>Periodic Performance Evaluation</b><br>As an employee of AUXOSYS ("the Company"), your work performance, conduct, and overall contribution will be subject to regular evaluation by your immediate supervisors and the Human Resources department.</p><p><b>Grounds for Termination</b><br>Your services may be terminated under any of the following circumstances:<ul><li><b>Unsatisfactory Performance:</b> Persistent failure to meet performance standards.</li><li><b>Breach of Policies:</b> Violation of confidentiality, asset usage, or conduct guidelines.</li><li><b>Absence Without Authorisation:</b> Unapproved absenteeism beyond limits permitted by policy.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "document_verification",
    title: "Submission of Documents and Background Verification",
    content: `<p><b>Provisional Nature of Employment</b><br>Your employment with AUXOSYS ("the Company") is provisional and subject to satisfactory completion of mandatory document submissions and background verification checks.</p><p><b>Mandatory Documentation</b><ul><li><b>Identity Proof:</b> Aadhaar Card, PAN Card, Passport, or Driving License.</li><li><b>Academic Credentials:</b> Degree certificates, mark sheets, transcripts.</li><li><b>Background Check Documents:</b> Previous employment letters, relief letters, and references.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "substance_abuse",
    title: "Substance Abuse & Conduct Testing",
    content: `<p>At any point during your employment, you may be subject to drug or substance-abuse tests as deemed necessary by the Company or client requirements. Failure to undergo such tests or failure to pass them will lead to immediate suspension or termination of your services.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "leave_policy",
    title: "Leave Policy (Annexure B)",
    content: `<p>This Leave Policy forms an integral part of the Employment Agreement with AUXOSYS. All employees are required to adhere strictly to the provisions laid out herein.</p><p><b>1. Types of Leave</b><ul><li><b>Casual Leave (CL):</b> Limited to 6 days per calendar year.</li><li><b>Sick Leave (SL):</b> Limited to 12 days per year.</li><li><b>Earned Leave / Privilege Leave (EL/PL):</b> Accrued based on tenure and available after completion of a specified period of engagement.</li><li><b>Compensatory Off (Comp Off):</b> Granted for approved overtime or holiday work.</li><li><b>Leave Without Pay (LWP):</b> Granted when paid leave balances are exhausted.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "intellectual_property",
    title: "Intellectual Property Rights",
    content: `<p><b>Ownership of Intellectual Property</b><br>All intellectual property rights developed, created, or contributed to by you during the course of your employment with AUXOSYS shall be the exclusive property of the Company.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "post_termination",
    title: "Post-Termination Responsibilities (Annexure C)",
    content: `<p>Upon termination of employment, you are required to return all Company property, complete formal project handovers, and abide by non-solicitation and confidentiality obligations for six (6) months following your departure.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "legal_jurisdiction",
    title: "Legal Jurisdiction",
    content: `<p>This Agreement shall be governed by and construed in accordance with the laws of the Republic of India. Disputes shall be subject to the exclusive jurisdiction of the courts in Bhubaneswar, Odisha.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "acceptance_clause",
    title: "Acceptance Clause and Legal Binding",
    content: `<p>This offer shall remain valid for three (3) days from the date of this letter. Upon acceptance, this document becomes legally binding and enforceable.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_a",
    title: "Annexure A: Required Documents for Verification",
    content: `<table><thead><tr><th>S.No</th><th>Document Type</th><th>Description/Notes</th></tr></thead><tbody><tr><td>1</td><td>Identity Proof</td><td>Aadhaar Card, PAN Card, Passport, or Driving License</td></tr><tr><td>2</td><td>Academic Credentials</td><td>Degree certificates, mark sheets, transcripts</td></tr><tr><td>3</td><td>Background Check Documents</td><td>Previous employment letters, references</td></tr></tbody></table>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_b",
    title: "Annexure B: Leave Policy",
    content: `<p>This Leave Policy forms an integral part of the Employment Agreement with AUXOSYS.</p><p><b>1. Types of Leave</b><ul><li><b>Casual Leave (CL):</b> 6 days per calendar year.</li><li><b>Sick Leave (SL):</b> 12 days per year.</li><li><b>Earned Leave / Privilege Leave (EL/PL):</b> Available after completion of specified tenure.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_c",
    title: "Annexure C: Checklist for Exit Formalities",
    content: `<p>Checklist of exit formalities including return of assets, project handover, and department clearances.</p>`,
    isActive: true,
    required: true
  }
];

export const INTERNSHIP_CLAUSES = [
  {
    id: "compensation",
    title: "Compensation and Payment Terms",
    content: buildCompensationClauseContent("Internship", "0", "INR"),
    isActive: true,
    required: true
  },
  {
    id: "nature_of_engagement",
    title: "Nature and Scope of Engagement",
    content: `<p>Your engagement with AUXOSYS ("the Company") is offered in the form of a professional internship as specified in this agreement. This engagement is intended to provide you with practical exposure, hands-on experience, and opportunities for professional development within the Company's operational framework.</p><p>It is expressly understood and agreed that this engagement does not constitute a guarantee or assurance of permanent employment with the Company, unless and until such permanent employment is explicitly and formally offered to you in writing by an authorised representative of the Company.</p><p>During the course of your internship, you will be assigned to work closely with designated internal teams, project managers, and other key personnel, contributing actively to ongoing projects, tasks, and operational functions. You are expected to perform your duties diligently, following assigned responsibilities with professionalism and due care.</p><p>Your role requires strict adherence to all Company policies, including, but not limited to, confidentiality, data protection, intellectual property rights, and professional discipline. You shall exercise the highest level of integrity in handling sensitive and proprietary information and will be responsible for safeguarding all confidential materials and data entrusted to you during the tenure of your engagement.</p><p>The Company reserves the right to modify your assignments, roles, or responsibilities as per business needs and project requirements. Your continued engagement is contingent upon satisfactory performance and compliance with all applicable Company policies and ethical standards.</p><p>Furthermore, you acknowledge that the internship engagement is subject to periodic review and may be terminated by either party in accordance with the terms and conditions set forth in this agreement. Your compliance with this clause is vital to maintaining a professional relationship that benefits both you and the Company.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "professional_behaviour",
    title: "Professional Behaviour and Ethical Conduct",
    content: `<p>At AUXOSYS, we hold professionalism and ethical conduct as fundamental pillars that uphold our corporate culture and foster a respectful and productive work environment. As an Intern, you are expected to consistently demonstrate the highest standards of professional behaviour throughout your internship with the Company. This includes, but is not limited to, the following key expectations:</p><ul><li><b>Punctuality and Attendance:</b> You are required to be punctual in reporting to work or attending virtual meetings and complete assigned work within the stipulated time frames. Regular attendance and adherence to scheduled work hours reflect your commitment and respect for the organisation and your colleagues.</li><li><b>Discipline:</b> Maintain self-discipline at all times in your conduct and work ethic. This encompasses following all Company policies, refraining from any form of misconduct, and abiding by directions issued by your supervisors or management personnel.</li><li><b>Mutual Respect and Teamwork:</b> Foster an environment of mutual respect, cooperation, and collaboration with colleagues, supervisors, and clients. Discrimination, bullying, harassment (whether verbal, physical, sexual, or psychological), or any form of disrespectful behaviour is strictly prohibited and will be regarded as a severe violation of this Code.</li><li><b>Adherence to Instructions:</b> You must diligently follow all lawful instructions and guidelines provided by authorised personnel. Failure to comply with instructions may impact project outcomes and the Company's reputation.</li><li><b>Responsiveness and Communication:</b> Maintain prompt, clear, and professional communication both internally and externally. Timely updates on work progress, addressing queries, and participating actively in discussions are essential responsibilities.</li><li><b>Integrity and Honesty:</b> Demonstrate honesty and transparency in all your dealings. Any form of dishonesty, including falsification of information, misrepresentation, or withholding critical information, will be treated as a serious breach of trust.</li><li><b>Confidentiality:</b> Safeguard all confidential and proprietary information of the Company, clients, and partners. Unauthorised disclosure, sharing, or misuse of confidential data is a violation of Company policy and applicable law.</li><li><b>Use of Company Resources:</b> Utilise all Company resources, including physical assets, digital tools, and information, responsibly and solely for official purposes. Misuse or misappropriation of Company property will result in strict disciplinary action.</li></ul><p><b>Consequences of Violations</b><br>Any form of unprofessional behaviour or violation of the Code of Conduct will be considered gross misconduct. Such misconduct includes, but is not limited to:<ul><li>Harassment or abuse (verbal, physical, or sexual).</li><li>Discrimination based on gender, caste, religion, ethnicity, disability, sexual orientation, or any other protected category.</li><li>Intentionally disrupting work or causing conflicts within the team.</li><li>Spreading rumours or false information damaging to the Company's reputation.</li><li>Breach of confidentiality or data protection policies.</li><li>Any conduct that adversely affects the Company's image or goodwill.</li></ul></p><p><b>Disciplinary Actions</b><br>The Company reserves the right to take strict and immediate disciplinary action against any Intern found guilty of misconduct, including but not limited to:<ul><li>Formal written warnings and counselling.</li><li>Termination of internship engagement without notice.</li><li>Informing educational institutions or internship providers (if applicable) about the breach of conduct.</li><li>Initiation of civil or criminal proceedings for severe breaches or damages committed.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "confidentiality_obligations",
    title: "Code of Conduct and Confidentiality Obligations",
    content: `<p>As a valued member of the AUXOSYS team, you are entrusted with access to sensitive and proprietary information essential to the Company's operations, competitive standing, and client relationships. Upholding strict confidentiality and complying with the Company's Code of Conduct are fundamental responsibilities throughout your internship tenure.</p><p><b>Confidential Information Defined</b><br>Confidential information includes, but is not limited to, the following:<ul><li>Proprietary business data, including financial records, marketing strategies, project plans, product designs, software code, technical documentation, and operational procedures.</li><li>Client and vendor information, including contracts, pricing, negotiation details, and communications.</li><li>Internal reports, meeting minutes, organisational charts, and company records.</li><li>Any information marked as "confidential," "restricted," or designated by the Company to be sensitive.</li><li>Information disclosed orally, visually, or electronically during the course of your engagement.</li></ul></p><p><b>Non-Disclosure and Non-Use Obligations</b><br>You agree and undertake to:<ul><li>Maintain the strict confidentiality of all such information during and after your internship with AUXOSYS.</li><li>Refrain from disclosing, sharing, publishing, distributing, or disseminating confidential information to any third party, including family members, friends, academic institutions, or external organisations, without prior written authorisation from the Company.</li><li>Not to use confidential information for personal gain, academic research, competitive advantage, or any purpose unrelated to your duties at the Company.</li><li>Ensure that all physical and electronic materials containing confidential information are securely stored and access is restricted to authorised personnel only.</li></ul></p><p><b>Restrictions on Copying and Transmission</b><ul><li>You shall not copy, reproduce, transmit, or store any confidential or proprietary data outside of approved Company platforms or devices.</li><li>The use of personal devices for storing Company data without explicit approval is strictly prohibited.</li><li>Any transmission of confidential information over electronic communication channels must comply with Company IT policies and encryption standards.</li></ul></p><p><b>Reporting of Security Breaches</b><ul><li>You are obligated to immediately report any actual or suspected unauthorised access, data breaches, or disclosure of confidential information to your supervisor or the Company's designated compliance officer.</li><li>Failure to report such incidents will be treated as a serious violation and may result in disciplinary action.</li></ul></p><p><b>Legal Implications of Breach</b><ul><li>Any breach of confidentiality obligations will be regarded as a legal offence under applicable Indian laws, including but not limited to the Information Technology Act, 2000 (IT Act).</li><li>The Company reserves the right to initiate legal proceedings against individuals who violate these obligations, which may include filing complaints, civil lawsuits for damages, and seeking injunctive relief.</li><li>You acknowledge that unauthorised disclosure or misuse of confidential information may cause irreparable harm to the Company, justifying such legal action.</li></ul></p><p><b>Return of Company Property</b><ul><li>Upon conclusion of your internship, you shall immediately return all documents, materials, electronic devices, and any other property belonging to the Company.</li><li>You shall not retain any copies, notes, or extracts of confidential information in any form.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "asset_usage",
    title: "Digital and Physical Asset Usage",
    content: `<p>As part of your internship with AUXOSYS ("the Company"), you may be granted access to various digital and physical assets essential to the performance of your duties. These assets include, but are not limited to, Company computer systems, software applications, databases, proprietary tools, communication platforms (such as email, instant messaging, and collaboration software), intellectual property, physical equipment, and documentation.</p><p><b>Authorised Use of Company Assets</b><ul><li>Access to the Company's digital and physical assets is extended solely for the purpose of fulfilling your assigned responsibilities and contributing to the Company's business objectives.</li><li>You are required to use these assets strictly for official, project-related activities.</li><li>Personal use of Company systems, software, or physical resources is expressly prohibited unless specifically authorised in writing by the management.</li></ul></p><p><b>Access Controls and Security</b><ul><li>You must comply with all security protocols established by the Company, including but not limited to password protection, two-factor authentication, and restricted access levels.</li><li>Sharing login credentials or access rights with unauthorised persons is strictly forbidden.</li><li>You are responsible for safeguarding your access credentials and ensuring that no unauthorised individual gains access to Company systems or physical resources through your account.</li></ul></p><p><b>Data Handling and Protection</b><ul><li>Any data accessed, processed, or stored using Company assets remains the sole property of the Company and must be handled in accordance with Company policies and applicable data protection laws.</li><li>You must not extract, copy, transfer, delete, or manipulate any Company data, documents, software code, or intellectual property without explicit prior authorisation from your supervisor or the Company's designated authority.</li><li>Unauthorised use or dissemination of such data, whether for personal benefit, third-party sharing, or competitive advantage, will be considered a grave violation of Company policy.</li></ul></p><p><b>Prohibited Activities</b><br>The following actions are strictly prohibited and constitute misconduct:<ul><li>Using Company digital or physical assets for personal projects, financial gain, or any activity unrelated to Company business.</li><li>Installing unauthorised software or hardware on Company systems or networks.</li><li>Attempting to bypass or undermine the Company's security controls or monitoring systems.</li><li>Engaging in any form of cyber-attack, data theft, intellectual property infringement, or sabotage.</li><li>Downloading, storing, or distributing illegal, offensive, or inappropriate content via Company resources.</li></ul></p><p><b>Monitoring and Compliance</b><ul><li>The Company reserves the right to monitor and audit the use of its digital and physical assets to ensure compliance with all policies and legal requirements.</li><li>You acknowledge that any use of Company assets may be subject to inspection and investigation without prior notice, consistent with applicable laws and regulations.</li></ul></p><p><b>Consequences of Misuse</b><ul><li>Any violation of the asset usage policies outlined above will result in immediate disciplinary action, which may include suspension, termination of your internship, and forfeiture of completion certificates.</li><li>The Company will initiate legal proceedings against individuals responsible for data theft, unauthorised disclosure, intellectual property violation, or any breach of contractual terms relating to asset usage.</li></ul></p><p><b>Return of Assets</b><ul><li>Upon completion or termination of your internship, you are required to return all Company-issued physical assets, including laptops, mobile devices, access cards, documents, and any other materials provided during your tenure.</li><li>All digital access, including user accounts and permissions, will be revoked at the end of your engagement.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "offer_acceptance",
    title: "Offer Acceptance and Non-Compliance",
    content: `<p><b>Acceptance of Offer</b><br>Upon receiving this offer, you are required to formally acknowledge and accept the terms and conditions outlined herein by signing and returning a copy of this letter within the stipulated acceptance period. Acceptance of this offer constitutes your commitment to join AUXOSYS ("the Company") on the mutually agreed date and to comply fully with all Company policies and procedures.</p><p><b>Obligations Upon Acceptance</b><br>Once you have accepted the offer:<ul><li>You are required to report for duty on the agreed start date without fail.</li><li>You must maintain regular communication with the Company during the onboarding process and thereafter, promptly responding to any official communication.</li><li>You are expected to engage professionally with the Company's representatives to facilitate a smooth onboarding and integration into your assigned role.</li></ul></p><p><b>Definition of Non-Compliance</b><br>Non-compliance will be considered under the following circumstances:<ul><li>Failure to join on the agreed start date without prior notice or approval from the Company.</li><li>Failure to respond to communications, including emails, phone calls, or messages, from the Company within a reasonable timeframe.</li><li>Deliberate avoidance of communication or attempts to evade joining the Company despite having accepted the offer.</li><li>Unauthorised absconding or unexplained absence during the internship tenure.</li></ul></p><p><b>Consequences of Non-Compliance</b><br>In the event of non-compliance, the Company reserves the right to:<ul><li><b>Cancellation of the Internship Offer:</b> The Company may immediately revoke your offer of internship, rendering it null and void.</li><li><b>Notification to Academic Institutions:</b> In cases where you are currently enrolled as a student, the Company reserves the right to notify your educational institution or placement cell about non-compliance with accepted commitments.</li><li><b>Revocation of Certification:</b> Forfeiture of any eligibility for internship completion certificates or references from AUXOSYS.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "voluntary_exit",
    title: "Voluntary Exit and Notice Requirement",
    content: `<p>Either party may terminate the internship by providing 7 days' written notice. The Company reserves the right to waive or shorten the notice period depending on operational requirements.</p><p><b>Mandatory Notice Period</b><ul><li>The Intern is required to submit a written notice of exit addressed to their immediate supervisor or the Human Resources department at least 7 calendar days prior to their intended last working day.</li><li>This allows the Company sufficient time to make necessary adjustments, including project handovers, knowledge transfer, and administrative processing.</li><li>The written notice should clearly specify your intended last working day and reasons for exit.</li></ul></p><p><b>Exit Formalities and Clearance</b><ul><li>Compliance with the notice period requires your active cooperation in handing over your responsibilities, returning all Company property (physical and digital), and completing required clearance processes.</li><li>Upon successful completion of exit formalities and notice period, the Company will process your exit documentation, approved dues/incentives (if applicable), and issue your Internship Completion Certificate.</li><li>Abrupt departure without notice or handover may result in the withholding of certificates and pending dues until formalities are completed.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "exclusivity",
    title: "Exclusivity of Engagement",
    content: `<p>During the internship, the Intern shall avoid engagements that create a conflict of interest, compromise confidentiality, or materially interfere with their responsibilities at Auxosys.</p><p>The Intern agrees that their engagement with Auxosys requires dedicated focus during assigned working hours. Any secondary engagement or academic commitment that potentially conflicts with Auxosys' business interests or confidentiality must be disclosed to the Company in writing.</p><p><b>Consequences of Violation:</b><br>If the Intern is found to be in breach of this clause:<ul><li>Immediate termination of the internship engagement without compensation;</li><li>Forfeiture of any unbilled performance incentives or pending stipends;</li><li>Revocation of internship completion certificates or professional references from the Company;</li><li>Permanent disqualification from any future engagement with AUXOSYS.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "false_allegations",
    title: "False Allegations and Malicious Public Statements",
    content: `<p>The Intern shall not knowingly make false, defamatory, or malicious statements intended to harm the reputation of the Company, its employees, clients, or stakeholders. Nothing in this clause restricts the Intern from exercising rights available under applicable law or reporting genuine concerns through appropriate channels.</p><p><b>Scope of Prohibited Conduct</b><br>You are strictly prohibited from making or circulating statements that are:<ul><li>Factually incorrect, misleading, or unsubstantiated;</li><li>Intentionally harmful or designed to malign the Company, its management, employees, clients, or stakeholders;</li><li>Disseminated publicly through social media platforms, online forums, blogs, or press outlets.</li></ul></p><p><b>Liability and Consequences</b><ul><li>Any intentional defamation or malicious campaign damaging the Company's reputation will result in immediate termination of the internship engagement and forfeiture of completion certificates.</li><li>The Company reserves the right to pursue appropriate legal remedies under applicable laws to address reputational harm and financial losses incurred.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "performance_review",
    title: "Performance Review and Termination",
    content: `<p><b>Periodic Performance Evaluation</b><br>As an Intern at AUXOSYS ("the Company"), your work performance, conduct, and overall contribution will be subject to regular evaluation by your supervisor and the Human Resources department to ensure alignment with Company standards and project goals. Criteria include:<ul><li><b>Quality and Timeliness of Deliverables:</b> Meeting project milestones and work standards.</li><li><b>Professionalism and Conduct:</b> Adherence to Company policies, respect for team members, and ethical conduct.</li><li><b>Attendance and Punctuality:</b> Regular presence during working hours and timely communication.</li><li><b>Collaboration and Initiative:</b> Teamwork and active participation in assigned tasks.</li></ul></p><p><b>Grounds for Termination</b><br>The internship may be terminated by the Company prior to the scheduled end date under circumstances including:<ul><li><b>Unsatisfactory Performance:</b> Persistent failure to meet assigned tasks or quality expectations.</li><li><b>Breach of Company Policies:</b> Violation of confidentiality, asset usage, or professional conduct guidelines.</li><li><b>Unauthorised Absence:</b> Failure to report for work without approval or valid notification.</li></ul></p><p><b>Consequences of Termination</b><ul><li>In the event of termination for cause, the Intern will not be entitled to further stipends (if applicable) or completion certificates.</li><li>The Intern must complete exit asset returns prior to departure.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "document_verification",
    title: "Submission of Documents and Background Verification",
    content: `<p><b>Provisional Nature of Engagement</b><br>Your internship engagement with AUXOSYS ("the Company") is provisional and subject to satisfactory verification of documents submitted by you. Until verification is complete, your status remains provisional, and the Company reserves the right to revoke this offer in case of discrepancies.</p><p><b>Mandatory Documentation</b><br>You are required to submit the following essential documents upon request:<ul><li><b>Identity Proof:</b> Aadhaar Card, PAN Card, Passport, or Driving License.</li><li><b>Academic Credentials:</b> Copies of mark sheets, college ID, degree certificates, or enrollment proof.</li><li><b>Declaration of Accuracy:</b> Affirmation that all details provided during application are true and complete.</li></ul></p><p><b>Consequences of Misrepresentation</b><ul><li>Submission of forged, altered, or misleading documents will result in immediate termination of the internship without completion certificates and potential reporting to your academic institution.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "leave_policy",
    title: "Leave Policy (Annexure B)",
    content: `<p>This Leave Policy forms an integral part of the Internship Agreement with AUXOSYS. Interns are required to adhere strictly to the provisions laid out herein.</p><p><b>1. Types of Leave</b><ul><li><b>Casual Leave (CL):</b> Eligible for unforeseen personal matters and urgent situations. It is typically limited to 6 days per calendar year. Must be applied for in advance, where possible.</li><li><b>Sick Leave (SL):</b> For medical reasons. Requires submission of a medical certificate if exceeding 2 consecutive days. It is typically limited to 12 days per year.</li><li><b>Earned Leave / Privilege Leave (EL/PL):</b> Leave accrued based on tenure and available after completion of a specified period of engagement. May be granted with prior approval only.</li><li><b>Compensatory Off (Comp Off):</b> Granted for approved work performed on official holidays or beyond regular hours.</li><li><b>Leave Without Pay (LWP):</b> Granted when paid leave balances are exhausted, subject to manager approval.</li></ul></p><p><b>2. Leave Application Procedure</b><ul><li>Leave requests must be submitted to your reporting manager at least 48 hours in advance for planned leave.</li><li>Sick leave must be reported on the first day of absence.</li></ul></p><p><b>3. Unauthorized Absence</b><ul><li>Absence without approved leave for more than 2 consecutive working days will be treated as unauthorised absence and may lead to termination of the internship engagement.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "intellectual_property",
    title: "Intellectual Property Rights",
    content: `<p><b>Ownership of Intellectual Property</b><br>All intellectual property rights developed, created, or contributed to by you during the course of your internship with AUXOSYS shall be the exclusive property of the Company.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "post_termination",
    title: "Post-Termination Responsibilities (Annexure C)",
    content: `<p>Upon termination or conclusion of your internship, you are required to return all Company property, complete formal project handovers, and abide by non-solicitation and confidentiality obligations for six (6) months following your departure.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "legal_jurisdiction",
    title: "Legal Jurisdiction",
    content: `<p>This Agreement shall be governed by and construed in accordance with the laws of the Republic of India. Disputes shall be subject to the exclusive jurisdiction of the courts in Bhubaneswar, Odisha.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "acceptance_clause",
    title: "Acceptance Clause and Legal Binding",
    content: `<p>This offer shall remain valid for three (3) days from the date of this letter. Upon acceptance, this document becomes legally binding and enforceable.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_a",
    title: "Annexure A: Required Documents for Verification",
    content: `<table><thead><tr><th>S.No</th><th>Document Type</th><th>Description/Notes</th></tr></thead><tbody><tr><td>1</td><td>Identity Proof</td><td>Aadhaar Card, PAN Card, Passport, or Driving License</td></tr><tr><td>2</td><td>Academic Credentials</td><td>Degree certificates, mark sheets, college ID card</td></tr><tr><td>3</td><td>Background Check Documents</td><td>Previous internship letters, references (if applicable)</td></tr><tr><td>4</td><td>Declaration Form</td><td>Signed declaration of accurate credentials</td></tr></tbody></table>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_b",
    title: "Annexure B: Leave Policy",
    content: `<p>This Leave Policy forms an integral part of the Internship Agreement with AUXOSYS.</p><p><b>1. Types of Leave</b><ul><li><b>Casual Leave (CL):</b> 6 days per calendar year.</li><li><b>Sick Leave (SL):</b> 12 days per year.</li><li><b>Earned Leave / Privilege Leave (EL/PL):</b> Available after completion of specified tenure.</li></ul></p>`,
    isActive: true,
    required: true
  },
  {
    id: "annexure_c",
    title: "Annexure C: Checklist for Exit Formalities",
    content: `<p>Checklist of exit formalities including return of assets, project handover, and department clearances.</p>`,
    isActive: true,
    required: true
  }
];

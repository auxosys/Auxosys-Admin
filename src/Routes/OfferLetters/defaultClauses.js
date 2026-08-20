export const FULL_TIME_CLAUSES = [
  {
    id: "appointment",
    title: "1. Appointment & Employment",
    content: `<p>The Employee is being appointed by <b>[Legal Company Name]</b> for the position of <b>[Job Title]</b>, subject to the terms and conditions set out in this Offer Letter and the applicable policies of the Company.</p><p>The Employee shall perform the duties and responsibilities associated with the position and such other reasonable responsibilities as may be assigned by the Company from time to time based on business and operational requirements.</p><p>The Employee agrees to perform their duties with professionalism, diligence, integrity, and reasonable care.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "date_joining",
    title: "2. Date of Joining & Place of Work",
    content: `<p>The Employee's expected date of joining shall be <b>[Joining Date]</b>.</p><p>The Employee's initial work arrangement shall be: <b>[Work Mode]</b></p><p>The Company may reasonably modify the Employee's work location, working arrangements, or reporting structure based on business requirements, subject to applicable law and the terms of employment.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "probation",
    title: "3. Probation",
    content: `<p>The Employee shall initially be placed under probation for <b>[Probation Period]</b>, unless otherwise specified in this Offer Letter.</p><p>During probation, the Employee's performance, conduct, attendance, ability to perform assigned responsibilities, and overall suitability for the role may be evaluated.</p><p>Upon satisfactory completion of probation, the Employee may be confirmed in accordance with the Company's applicable policies.</p>`,
    isActive: true,
    required: false
  },
  {
    id: "compensation",
    title: "4. Compensation & Benefits",
    content: `<p>The Employee shall receive compensation as outlined in the compensation section or applicable annexure to this Offer Letter.</p><p>Applicable statutory deductions, taxes, contributions, and other lawful deductions shall be made as required.</p><p>Any variable pay, performance incentive, bonus, or discretionary benefit shall be subject to the applicable eligibility criteria and Company policy.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "working_hours",
    title: "5. Working Hours & Attendance",
    content: `<p>The Employee shall follow the working hours, attendance requirements, holidays, and work schedules applicable to their role and work arrangement.</p><p>The Employee is expected to maintain punctuality, regular attendance, availability during designated working hours, and timely communication with their reporting manager.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "leave_holidays",
    title: "6. Leave & Holidays",
    content: `<p>The Employee shall be entitled to leave and holidays in accordance with the Company's applicable leave policy and applicable law.</p><p>Leave should normally be requested in advance and approved by the appropriate authority.</p><p>Unauthorised absence or repeated failure to follow attendance procedures may result in appropriate action in accordance with Company policy and applicable law.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "performance",
    title: "7. Performance & Responsibilities",
    content: `<p>The Employee's performance may be evaluated based on factors including quality of work, timeliness, technical competence, achievement of objectives, communication, team collaboration, initiative, and professional conduct.</p><p>The Company may provide feedback, performance reviews, improvement guidance, or performance objectives as appropriate.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "code_of_conduct",
    title: "8. Code of Conduct",
    content: `<p>The Employee shall maintain professional and respectful conduct while interacting with employees, managers, clients, customers, vendors, and other stakeholders.</p><p>The Employee shall not engage in harassment, discrimination, bullying, threats, abusive behaviour, dishonesty, fraud, or other conduct prohibited by Company policy or applicable law.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "confidentiality",
    title: "9. Confidentiality & Non-Disclosure",
    content: `<p>During employment, the Employee may have access to confidential or proprietary information belonging to Auxosys, its clients, partners, employees, vendors, or other stakeholders.</p><p>The Employee shall not disclose, copy, distribute, misuse, or provide such information to any unauthorised person.</p><p>These confidentiality obligations shall continue after the Employee's employment ends to the extent permitted by applicable law and the nature of the information.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "data_protection",
    title: "10. Data Protection & Information Security",
    content: `<p>The Employee shall comply with the Company's information-security, privacy, data-protection, and acceptable-use policies.</p><p>The Employee shall protect Company credentials, not share passwords, not access information without authorisation, and immediately report suspected security incidents.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "intellectual_property",
    title: "11. Intellectual Property",
    content: `<p>Subject to applicable law, work product created by the Employee <b>within the scope of employment or using Company resources</b> shall be handled in accordance with the Company's intellectual-property policies.</p><p>The Employee shall cooperate with reasonable documentation required to establish the Company's rights in such work product.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "company_property",
    title: "12. Company Property & Resources",
    content: `<p>Company property shall be used responsibly and primarily for authorised purposes.</p><p>The Employee shall not intentionally damage, misuse, transfer, sell, disclose, or provide Company property to unauthorised persons.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "conflict_of_interest",
    title: "13. Conflict of Interest",
    content: `<p>The Employee shall avoid activities that create an actual conflict between their personal interests and the legitimate interests of the Company.</p><p>Outside professional activities must not interfere with Company responsibilities, misuse Company resources, or create a conflict with Company clients.</p>`,
    isActive: true,
    required: false
  },
  {
    id: "termination",
    title: "14. Termination of Employment",
    content: `<p>Employment may be terminated by either party in accordance with the applicable employment terms, Company policy, and applicable law.</p><p>Grounds for termination may include unsatisfactory performance, serious misconduct, material breach of Company policy, confidentiality breach, or other lawful grounds.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "exit_handover",
    title: "15. Exit & Handover",
    content: `<p>Before leaving the Company, the Employee shall reasonably cooperate with the exit process, including knowledge transfer, project handover, return of Company property, and completion of clearance formalities.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "governing_law",
    title: "16. Governing Law & Jurisdiction",
    content: `<p>This Offer Letter and the employment relationship shall be governed by the applicable laws of India. Any dispute arising from it shall be subject to the exclusive jurisdiction of the courts in Bhubaneswar, Odisha.</p>`,
    isActive: true,
    required: true
  }
];

export const INTERNSHIP_CLAUSES = [
  {
    id: "nature_of_internship",
    title: "1. Nature of Internship",
    content: `<p>The internship is a structured learning and practical training opportunity with <b>[Legal Company Name]</b>.</p><p>The Intern will participate in projects, assignments, training activities, and other learning opportunities relevant to the internship role.</p><p>The internship is intended to provide practical exposure and professional experience and does not by itself constitute a promise or guarantee of permanent employment.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "internship_duration",
    title: "2. Internship Duration",
    content: `<p>The internship shall commence on <b>[Start Date]</b> and is expected to conclude on <b>[End Date]</b>, unless extended, shortened, or terminated in accordance with the applicable internship terms.</p><p>Any extension shall be subject to mutual agreement and written confirmation.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "role_responsibilities",
    title: "3. Internship Role & Responsibilities",
    content: `<p>The Intern will be engaged as <b>[Job Title]</b> in the <b>[Department]</b> department.</p><p>The Intern may be assigned tasks and responsibilities related to the internship role, including practical project work, research, documentation, development, testing, or other activities.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "stipend",
    title: "4. Stipend",
    content: `<p>The Intern shall receive a stipend as outlined in the compensation section, subject to satisfactory attendance, participation, and completion of assigned responsibilities.</p><p>The stipend terms and applicable deductions shall be specified in the offer.</p>`,
    isActive: true,
    required: false
  },
  {
    id: "attendance_hours",
    title: "5. Attendance & Working Hours",
    content: `<p>The Intern shall follow the working schedule applicable to the internship.</p><p>The Intern is expected to maintain regular attendance and punctuality. Absence should be communicated to and approved by the designated mentor/manager.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "code_of_conduct",
    title: "6. Code of Conduct",
    content: `<p>The Intern must maintain professional conduct while interacting with employees, clients, partners, and other stakeholders.</p><p>The Intern must not engage in harassment, discrimination, bullying, abusive behaviour, dishonesty, or unauthorised activities.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "confidentiality",
    title: "7. Confidentiality",
    content: `<p>During the internship, the Intern may receive access to confidential information belonging to the Company or its clients.</p><p>The Intern shall not disclose, copy, publish, distribute, or misuse confidential information without proper authorisation.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "intellectual_property",
    title: "8. Intellectual Property",
    content: `<p>Any work product created by the Intern <b>within the scope of the internship or using Company resources</b> shall be handled in accordance with the Company's applicable intellectual-property terms.</p><p>The Intern agrees to reasonably cooperate with documentation required to establish applicable rights in such work.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "company_property",
    title: "9. Company Property",
    content: `<p>All Company property must be returned when requested or upon completion/termination of the internship.</p><p>This includes physical and digital assets, documents, credentials, access cards, and devices.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "internship_certificate",
    title: "10. Internship Certificate",
    content: `<p>Upon successful completion of the internship, and subject to applicable completion requirements, the Company may issue an <b>Internship Completion Certificate</b>.</p><p>The certificate may depend on satisfactory performance, attendance, completion of assigned work, and exit formalities.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "no_guarantee_employment",
    title: "11. No Guarantee of Full-Time Employment",
    content: `<p>Successful completion of the internship <b>does not automatically guarantee a full-time employment offer</b>.</p><p>The Company may, based on business requirements and the Intern's performance, consider the Intern for future employment opportunities.</p>`,
    isActive: true,
    required: true
  },
  {
    id: "termination",
    title: "12. Termination / Early Completion",
    content: `<p>Either party may request termination of the internship by providing notice, subject to the applicable internship terms.</p><p>The Company may end the internship earlier in cases of serious misconduct, confidentiality breach, unauthorised absence, or other violations.</p>`,
    isActive: true,
    required: true
  }
];

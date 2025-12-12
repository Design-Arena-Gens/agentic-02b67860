'use client';

import { useEffect, useMemo, useState } from 'react';

const SECTION_DEFINITIONS = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'directors', label: 'معلومات المديرين' },
  { id: 'schools', label: 'معلومات الابتدائيات' },
  { id: 'reports', label: 'تقارير المفتشية' },
  { id: 'tracking', label: 'متابعة المدراء' },
  { id: 'dispatch', label: 'جداول الإرسال' },
  { id: 'productivity', label: 'حساب المردودية' },
  { id: 'gmail', label: 'مراسلات Gmail' },
  { id: 'appointments', label: 'المواعيد والتنبيهات' }
];

const initialState = {
  directors: [
    { id: 1, name: 'أحمد بن يوسف', school: 'ابتدائية الفتح', phone: '0550 123 456', status: 'نشط' },
    { id: 2, name: 'سميرة بوزيد', school: 'ابتدائية الإيمان', phone: '0551 654 987', status: 'قيد المتابعة' },
    { id: 3, name: 'ليلى قادري', school: 'ابتدائية النجاح', phone: '0552 777 111', status: 'ممتاز' }
  ],
  schools: [
    { id: 1, name: 'ابتدائية الفتح', location: 'بلدية سيدي بلعباس', students: 480, status: 'جاهزة' },
    { id: 2, name: 'ابتدائية الإيمان', location: 'بلدية عين تموشنت', students: 360, status: 'صيانة جزئية' },
    { id: 3, name: 'ابتدائية النجاح', location: 'بلدية وهران', students: 520, status: 'جاهزة' }
  ],
  reports: [
    {
      id: 1,
      title: 'تقرير زيارات شهر أبريل',
      date: '2024-04-30',
      status: 'مكتمل',
      summary: 'تمت متابعة 12 مؤسسة وتعزيز برامج الدعم التربوي مع رفع 5 توصيات رئيسية.'
    },
    {
      id: 2,
      title: 'تقييم خطط الطوارئ المدرسية',
      date: '2024-05-12',
      status: 'جاري',
      summary: 'جمع المعطيات من 8 مدارس، جاري العمل على خطة تدريب مشتركة مع الجماعات المحلية.'
    }
  ],
  followUps: [
    {
      id: 1,
      director: 'أحمد بن يوسف',
      focus: 'تحسين نتائج الرياضيات',
      progress: 82,
      actions: ['تنشيط حصص دعم أسبوعية', 'تعيين منسق فريق مادة الرياضيات']
    },
    {
      id: 2,
      director: 'سميرة بوزيد',
      focus: 'رفع نسبة الحضور',
      progress: 54,
      actions: ['تقوية التواصل مع أولياء التلاميذ', 'برنامج تحفيز للمدرسين']
    }
  ],
  dispatchPlans: [
    {
      id: 1,
      title: 'إرسال التقرير السنوي',
      target: 'مديرية التربية',
      channel: 'البريد الرسمي',
      dueDate: '2024-05-25',
      status: 'جاهز'
    },
    {
      id: 2,
      title: 'تنسيق زيارة ميدانية',
      target: 'مفتشية بئر العاتر',
      channel: 'بريد إلكتروني + اتصال هاتفي',
      dueDate: '2024-05-20',
      status: 'قيد الإنجاز'
    }
  ],
  gmailQueue: [
    {
      id: 1,
      to: 'inspection-board@example.com',
      subject: 'ملخص الاجتماع الأسبوعي',
      message: 'السلام عليكم، أرفق لكم ملخص محاور اجتماع هذا الأسبوع وخطة المتابعة.' ,
      schedule: '2024-05-18T10:00',
      status: 'مجدول'
    }
  ],
  appointments: [
    {
      id: 1,
      title: 'اجتماع مع مديري الابتدائيات',
      date: '2024-05-19T09:30',
      location: 'قاعة الاجتماعات - المديرية',
      notes: 'تقديم خطة دعم جديدة وتوزيع الأدوار.'
    },
    {
      id: 2,
      title: 'زيارة ميدانية لابتدائية الإيمان',
      date: '2024-05-21T08:00',
      location: 'بلدية عين تموشنت',
      notes: 'التأكد من جاهزية مخابر العلوم وتجهيزات الأمان.'
    }
  ]
};

const STORAGE_KEY = 'almofatish-data-v1';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [directors, setDirectors] = useState(initialState.directors);
  const [schools, setSchools] = useState(initialState.schools);
  const [reports, setReports] = useState(initialState.reports);
  const [followUps, setFollowUps] = useState(initialState.followUps);
  const [dispatchPlans, setDispatchPlans] = useState(initialState.dispatchPlans);
  const [gmailQueue, setGmailQueue] = useState(initialState.gmailQueue);
  const [appointments, setAppointments] = useState(initialState.appointments);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [messageForm, setMessageForm] = useState({ to: '', subject: '', message: '', schedule: '' });
  const [appointmentForm, setAppointmentForm] = useState({ title: '', date: '', location: '', notes: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.directors) setDirectors(parsed.directors);
      if (parsed.schools) setSchools(parsed.schools);
      if (parsed.reports) setReports(parsed.reports);
      if (parsed.followUps) setFollowUps(parsed.followUps);
      if (parsed.dispatchPlans) setDispatchPlans(parsed.dispatchPlans);
      if (parsed.gmailQueue) setGmailQueue(parsed.gmailQueue);
      if (parsed.appointments) setAppointments(parsed.appointments);
    } catch (error) {
      console.error('تعذر تحميل البيانات المخزنة', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      directors,
      schools,
      reports,
      followUps,
      dispatchPlans,
      gmailQueue,
      appointments
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [directors, schools, reports, followUps, dispatchPlans, gmailQueue, appointments]);

  useEffect(() => {
    const soon = appointments.filter((item) => {
      const delta = new Date(item.date).getTime() - Date.now();
      return delta > 0 && delta < 1000 * 60 * 60 * 24 * 3;
    });
    if (soon.length && isAuthenticated) {
      alert(`تنبيه: لديك ${soon.length} موعد(ات) قريب خلال الأيام الثلاثة القادمة.`);
    }
  }, [appointments, isAuthenticated]);

  const overviewStats = useMemo(() => {
    const readySchools = schools.filter((item) => item.status === 'جاهزة').length;
    const followUpAverage =
      followUps.length > 0
        ? Math.round(followUps.reduce((acc, cur) => acc + cur.progress, 0) / followUps.length)
        : 0;
    const pendingDispatch = dispatchPlans.filter((item) => item.status !== 'جاهز').length;
    return {
      readySchools,
      followUpAverage,
      pendingDispatch,
      reportsCount: reports.length
    };
  }, [schools, followUps, dispatchPlans, reports]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (loginForm.username.trim().length < 3 || loginForm.password.trim().length < 4) {
      setLoginError('الرجاء إدخال بيانات دخول صحيحة (اسم مستخدم 3 أحرف فأكثر وكلمة سر 4 خانات على الأقل).');
      return;
    }
    setLoginError('');
    setIsAuthenticated(true);
  };

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    if (!messageForm.to || !messageForm.subject || !messageForm.message || !messageForm.schedule) return;
    const newMessage = {
      id: Date.now(),
      ...messageForm,
      status: 'مجدول'
    };
    setGmailQueue((prev) => [newMessage, ...prev]);
    setMessageForm({ to: '', subject: '', message: '', schedule: '' });
  };

  const handleAppointmentSubmit = (event) => {
    event.preventDefault();
    if (!appointmentForm.title || !appointmentForm.date) return;
    const newAppointment = {
      id: Date.now(),
      ...appointmentForm
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setAppointmentForm({ title: '', date: '', location: '', notes: '' });
  };

  const handleProductivity = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const visitsDone = Number(form.get('visitsDone') || 0);
    const visitsPlanned = Number(form.get('visitsPlanned') || 1);
    const training = Number(form.get('trainingHours') || 0);
    const satisfaction = Number(form.get('satisfaction') || 0);
    const productivity = Math.min(
      100,
      Math.round(((visitsDone / visitsPlanned) * 60 + training * 5 + satisfaction * 0.4) / 2)
    );
    alert(`مؤشر المردودية التقديري: ${productivity}%`);
  };

  const upcomingAppointments = useMemo(
    () =>
      [...appointments]
        .filter((item) => new Date(item.date).getTime() >= Date.now())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [appointments]
  );

  return (
    <div className="app-shell">
      {!isAuthenticated && (
        <div className="login-overlay">
          <form className="login-card" onSubmit={handleLoginSubmit}>
            <h1>المفتش</h1>
            <p>منصة موحدة لمتابعة أعمال المفتشية وإدارة المواعيد والمراسلات.</p>
            <label>
              اسم المستخدم
              <input
                type="text"
                value={loginForm.username}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="أدخل اسم المستخدم"
              />
            </label>
            <label>
              كلمة السر
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="••••••"
              />
            </label>
            {loginError && <span className="error-message">{loginError}</span>}
            <button type="submit">دخول المنصة</button>
          </form>
        </div>
      )}

      <header className="app-header">
        <div>
          <h2>لوحة تحكم المفتشية</h2>
          <p>إدارة البيانات، متابعة الأداء، وجدولة الاجتماعات في واجهة واحدة.</p>
        </div>
        <div className="header-meta">
          <span>{new Date().toLocaleDateString('ar-DZ')}</span>
          {isAuthenticated && <button onClick={() => setIsAuthenticated(false)}>تسجيل الخروج</button>}
        </div>
      </header>

      <section className="section-selector">
        {SECTION_DEFINITIONS.map((section) => (
          <button
            key={section.id}
            className={selectedSection === section.id ? 'section-tab active' : 'section-tab'}
            onClick={() => setSelectedSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </section>

      <main className="section-content">
        {selectedSection === 'overview' && (
          <section className="overview-grid">
            <div className="card">
              <h3>المؤسسات الجاهزة</h3>
              <strong>{overviewStats.readySchools}</strong>
              <p>عدد الابتدائيات المكتملة التجهيز للبرامج التربوية.</p>
            </div>
            <div className="card">
              <h3>متوسط تقدم المتابعة</h3>
              <strong>{overviewStats.followUpAverage}%</strong>
              <p>نسبة التقدم المتوسطة لخطة دعم المديرين قيد المتابعة.</p>
            </div>
            <div className="card">
              <h3>التقارير المسجلة</h3>
              <strong>{overviewStats.reportsCount}</strong>
              <p>عدد التقارير الأحدث ضمن نظام المفتشية.</p>
            </div>
            <div className="card">
              <h3>مهام الإرسال المتبقية</h3>
              <strong>{overviewStats.pendingDispatch}</strong>
              <p>خطط الإرسال التي تتطلب إكمال أو متابعة.</p>
            </div>
            <div className="card span-2">
              <h3>أقرب المواعيد</h3>
              {upcomingAppointments.length === 0 ? (
                <p>لا توجد مواعيد قادمة.</p>
              ) : (
                <ul>
                  {upcomingAppointments.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{new Date(item.date).toLocaleString('ar-DZ')}</span>
                      <span>{item.location}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {selectedSection === 'directors' && (
          <section className="panel">
            <h3>قاعدة بيانات المديرين</h3>
            <table>
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>المؤسسة</th>
                  <th>الهاتف</th>
                  <th>حالة المتابعة</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((director) => (
                  <tr key={director.id}>
                    <td>{director.name}</td>
                    <td>{director.school}</td>
                    <td>{director.phone}</td>
                    <td>
                      <span className={`status status-${director.status.split(' ')[0]}`}>
                        {director.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {selectedSection === 'schools' && (
          <section className="panel">
            <h3>معلومات الابتدائيات</h3>
            <div className="card-grid">
              {schools.map((school) => (
                <article key={school.id} className="card">
                  <header>
                    <h4>{school.name}</h4>
                    <span className={`status status-${school.status.split(' ')[0]}`}>
                      {school.status}
                    </span>
                  </header>
                  <p>الموقع: {school.location}</p>
                  <p>عدد التلاميذ: {school.students}</p>
                  <p>آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {selectedSection === 'reports' && (
          <section className="panel reports">
            <h3>تقارير المفتشية الحديثة</h3>
            {reports.map((report) => (
              <article key={report.id} className="report-card">
                <header>
                  <div>
                    <h4>{report.title}</h4>
                    <span>{formatDate(report.date)}</span>
                  </div>
                  <span className={`status status-${report.status.split(' ')[0]}`}>
                    {report.status}
                  </span>
                </header>
                <p>{report.summary}</p>
              </article>
            ))}
          </section>
        )}

        {selectedSection === 'tracking' && (
          <section className="panel">
            <h3>متابعة خطط المدراء</h3>
            <div className="card-grid">
              {followUps.map((item) => (
                <article key={item.id} className="card">
                  <h4>{item.director}</h4>
                  <p>محور العمل: {item.focus}</p>
                  <div className="progress">
                    <div className="bar" style={{ width: `${item.progress}%` }} />
                    <span>{item.progress}%</span>
                  </div>
                  <ul>
                    {item.actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {selectedSection === 'dispatch' && (
          <section className="panel">
            <h3>جدولة الإرسال والتواصل</h3>
            <table>
              <thead>
                <tr>
                  <th>المهمة</th>
                  <th>الجهة المستهدفة</th>
                  <th>قناة الإرسال</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {dispatchPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.title}</td>
                    <td>{plan.target}</td>
                    <td>{plan.channel}</td>
                    <td>{formatDate(plan.dueDate)}</td>
                    <td>
                      <span className={`status status-${plan.status.split(' ')[0]}`}>
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {selectedSection === 'productivity' && (
          <section className="panel">
            <h3>حاسبة المردودية التقديرية</h3>
            <form className="form-grid" onSubmit={handleProductivity}>
              <label>
                الزيارات المنجزة
                <input type="number" name="visitsDone" min="0" defaultValue="10" />
              </label>
              <label>
                الزيارات المبرمجة
                <input type="number" name="visitsPlanned" min="1" defaultValue="12" />
              </label>
              <label>
                ساعات التكوين الداعمة
                <input type="number" name="trainingHours" min="0" defaultValue="6" />
              </label>
              <label>
                نسبة رضا المتابعين (%)
                <input type="number" name="satisfaction" min="0" max="100" defaultValue="75" />
              </label>
              <button type="submit">احسب المردودية</button>
            </form>
            <p>
              تستند المعادلة إلى مزيج من مؤشرات الإنجاز، جرعات التكوين، ونسبة الرضا التقديرية لإعطاء مؤشر موحد يساعد في
              اتخاذ القرار.
            </p>
          </section>
        )}

        {selectedSection === 'gmail' && (
          <section className="panel gmail">
            <div>
              <h3>حجز وإرسال مراسلات عبر Gmail</h3>
              <form className="form-grid" onSubmit={handleMessageSubmit}>
                <label>
                  وجهة البريد
                  <input
                    type="email"
                    value={messageForm.to}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, to: event.target.value }))}
                    placeholder="example@gmail.com"
                    required
                  />
                </label>
                <label>
                  موضوع الرسالة
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))}
                    required
                  />
                </label>
                <label className="span-2">
                  نص الرسالة
                  <textarea
                    value={messageForm.message}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, message: event.target.value }))}
                    rows={4}
                    required
                  />
                </label>
                <label>
                  توقيت الإرسال
                  <input
                    type="datetime-local"
                    value={messageForm.schedule}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, schedule: event.target.value }))}
                    required
                  />
                </label>
                <button type="submit">إضافة إلى الجدولة</button>
              </form>
            </div>
            <div className="messages-list">
              <h4>قائمة الرسائل المجدولة</h4>
              <ul>
                {gmailQueue.length === 0 ? (
                  <li>لا توجد مراسلات مجدولة حالياً.</li>
                ) : (
                  gmailQueue.map((message) => (
                    <li key={message.id}>
                      <strong>{message.subject}</strong>
                      <span>{message.to}</span>
                      <span>{new Date(message.schedule).toLocaleString('ar-DZ')}</span>
                      <span className={`status status-${message.status.split(' ')[0]}`}>
                        {message.status}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        )}

        {selectedSection === 'appointments' && (
          <section className="panel">
            <h3>إدارة المواعيد والتنبيهات</h3>
            <form className="form-grid" onSubmit={handleAppointmentSubmit}>
              <label>
                عنوان الموعد
                <input
                  type="text"
                  value={appointmentForm.title}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                توقيت الموعد
                <input
                  type="datetime-local"
                  value={appointmentForm.date}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </label>
              <label>
                مكان الاجتماع
                <input
                  type="text"
                  value={appointmentForm.location}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="القاعة الكبرى / عن بعد / ..."
                />
              </label>
              <label className="span-2">
                ملاحظات إضافية
                <textarea
                  value={appointmentForm.notes}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                />
              </label>
              <button type="submit">حفظ الموعد</button>
            </form>
            <div className="card-grid">
              {appointments.map((item) => {
                const isSoon = new Date(item.date).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 3;
                return (
                  <article key={item.id} className={`card ${isSoon ? 'card-alert' : ''}`}>
                    <h4>{item.title}</h4>
                    <p>
                      <strong>التاريخ:</strong> {new Date(item.date).toLocaleString('ar-DZ')}
                    </p>
                    {item.location && (
                      <p>
                        <strong>المكان:</strong> {item.location}
                      </p>
                    )}
                    {item.notes && <p>{item.notes}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

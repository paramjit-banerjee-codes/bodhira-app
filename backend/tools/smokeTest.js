const API = 'http://localhost:5000/api';

function okOrThrow(res, text=''){
  if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  return res.json();
}

(async function(){
  try{
    const ts = Math.floor(Date.now()/1000);
    const email = `teacher${ts}@example.com`;
    console.log('Registering teacher:', email);
    const regResp = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: 'Smoke Teacher', email, password: 'Password123!', confirmPassword: 'Password123!', role: 'teacher' })
    });
    const reg = await regResp.json();
    if(!regResp.ok) { console.error('Register failed', reg); process.exit(1); }
    const token = reg.data.token;
    console.log('Token received length:', token.length);

    // Create classroom
    const clsResp = await fetch(`${API}/classrooms`, {
      method: 'POST', headers: {'Content-Type':'application/json','Authorization': `Bearer ${token}`},
      body: JSON.stringify({ name: 'Smoke Classroom', subject: 'Programming', description: 'E2E smoke test' })
    });
    const cls = await clsResp.json(); if(!clsResp.ok){ console.error('Create classroom failed', cls); process.exit(1); }
    const clsId = (cls?.data?.id) || (cls?.data?._id) || (cls?.data?.data?.id) || cls?.id || cls?._id;
    console.log('Classroom created id:', clsId);

    // Create test
    const testResp = await fetch(`${API}/classrooms/${clsId}/tests`, {
      method: 'POST', headers: {'Content-Type':'application/json','Authorization': `Bearer ${token}`},
      body: JSON.stringify({ topic: 'Algebra Basics', difficulty: 'easy', duration: 20, totalQuestions: 1, questions: [{ question: '2+2=?', options: ['1','2','3','4'], correctAnswer: 3 }] })
    });
    const testJson = await testResp.json(); if(!testResp.ok){ console.error('Create test failed', testJson); process.exit(1); }
    const testId = (testJson?.data?.id) || (testJson?.data?._id) || testJson?.id || testJson?._id;
    console.log('Test created id:', testId);

    // Enroll student
    const studentEmail = `student+${ts}@test.local`;
    const enrollResp = await fetch(`${API}/classrooms/${clsId}/enroll`, {
      method: 'POST', headers: {'Content-Type':'application/json','Authorization': `Bearer ${token}`},
      body: JSON.stringify({ name: 'Smoke Student', email: studentEmail, roll: 'S-001' })
    });
    const enrollJson = await enrollResp.json(); if(!enrollResp.ok){ console.error('Enroll failed', enrollJson); process.exit(1); }
    const studentId = (enrollJson?.data?.id) || (enrollJson?.data?._id) || enrollJson?.id || enrollJson?._id;
    console.log('Student enrolled id:', studentId);

    // Fetch students
    const studentsResp = await fetch(`${API}/classrooms/${clsId}/students`, { headers: { Authorization: `Bearer ${token}` } });
    const studentsJson = await studentsResp.json(); if(!studentsResp.ok){ console.error('Fetch students failed', studentsJson); process.exit(1); }
    console.log('Students count:', studentsJson.data.length);

    // Fetch tests
    const testsResp = await fetch(`${API}/classrooms/${clsId}/tests`, { headers: { Authorization: `Bearer ${token}` } });
    const testsJson = await testsResp.json(); if(!testsResp.ok){ console.error('Fetch tests failed', testsJson); process.exit(1); }
    console.log('Tests count:', testsJson.data.length);

    console.log('SMOKE OK', JSON.stringify({ classroomId: clsId, testId, studentId, students: studentsJson.data.length, tests: testsJson.data.length }, null, 2));
    process.exit(0);
  }catch(err){
    console.error('SMOKE ERROR', err);
    process.exit(1);
  }
})();
